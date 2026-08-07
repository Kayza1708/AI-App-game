import { ACHIEVEMENTS, createDefaultState, ENERGY_BUILDINGS, GEM_SHOP_ITEMS, HARDWARE_CATALOG, MODEL_CATALOG, MODEL_SKILLS, OBJECTIVES, PATENTS, TECH_NODES, UPGRADES, WORLD_EVENTS } from '../data/defaultState.js';

const COST_GROWTH = 1.16;
export const BASE_ENERGY_PRODUCTION = 1.5;

function strategicBonus(state, effect) {
  const tech = TECH_NODES.filter((node) => state.meta.techNodes.includes(node.id));
  const positive = tech.filter((node) => node.effect === effect).reduce((sum, node) => sum + node.value, 0);
  const penalties = tech.filter((node) => node.tradeoff === effect).reduce((sum, node) => sum + node.penalty, 0);
  const events = state.world.modifiers.filter((modifier) => modifier.effect === effect).reduce((sum, modifier) => sum + modifier.value, 0);
  const achievementBonus = Object.keys(state.meta.achievements).reduce((sum, id) => sum + (ACHIEVEMENTS.find((achievement) => achievement.id === id)?.reward ?? 0), 0);
  const patents = PATENTS.filter((patent) => state.patents.equipped.includes(patent.id) && patent.effect === effect).reduce((sum, patent) => sum + patent.value * patentLevelMultiplier(state, patent.id), 0);
  return positive - penalties + events + patents + (['allOutput', 'hardwareOutput', 'demand', 'revenue', 'training'].includes(effect) ? achievementBonus : 0);
}

export function hardwareCost(item, quantity) { return Math.ceil(item.baseCost * COST_GROWTH ** quantity); }
export function isHardwareUnlocked(state, item) { return item.tier === 0 || state.hardware[HARDWARE_CATALOG[item.tier - 1].id] > 0; }

function upgradeBonus(state, effect, hardwareId = null) {
  return UPGRADES.filter((upgrade) => state.upgrades.includes(upgrade.id) && upgrade.effect === effect && (!upgrade.hardwareId || upgrade.hardwareId === hardwareId)).reduce((total, upgrade) => total + upgrade.value, 0);
}

function milestoneBonus(state, effect, item = null) {
  return HARDWARE_CATALOG.reduce((total, hardware) => total + hardware.milestones.filter((milestone) => state.hardware[hardware.id] >= milestone.quantity && milestone.effect === effect && (!item || hardware.id === item.id)).reduce((sum, milestone) => sum + milestone.value, 0), 0);
}

export function effectiveHardwareCost(state, item) {
  const discount = Math.min(0.5, upgradeBonus(state, 'hardwareCost', item.id) + milestoneBonus(state, 'hardwareDiscount') + strategicBonus(state, 'hardwareCost') + strategicBonus(state, 'hardwareDiscount'));
  return Math.ceil(hardwareCost(item, state.hardware[item.id]) * (1 - discount));
}

function hardwareGlobalMultiplier(state) {
  return Math.max(0.1, 1 + upgradeBonus(state, 'allOutput') + upgradeBonus(state, 'hardwareOutput') + strategicBonus(state, 'allOutput') + strategicBonus(state, 'hardwareOutput') + deployedIdentityBonus(state, 'allOutput') + deployedIdentityBonus(state, 'hardwareOutput'));
}

export function hardwareContribution(state, item) {
  return rawHardwareContribution(state, item) * hardwareGlobalMultiplier(state) * energyEfficiency(state);
}
export function rawHardwareContribution(state, item) { return item.computePerSecond * state.hardware[item.id] * (1 + milestoneBonus(state, 'hardwareOutput', item) + upgradeBonus(state, 'hardwareOutput', item.id)); }

export function computePerSecond(state) {
  const raw = HARDWARE_CATALOG.reduce((total, item) => total + rawHardwareContribution(state, item), 0);
  return raw * hardwareGlobalMultiplier(state) * energyEfficiency(state);
}

export function rawEnergyDemand(state) { const hardware = HARDWARE_CATALOG.reduce((total, item) => total + item.energy * state.hardware[item.id], 0); const serving = state.model.deployed.reduce((total, id) => total + state.resources.users * 0.0002 / Math.max(1, effectiveModelStat(state,MODEL_CATALOG.find(model=>model.id===id)??MODEL_CATALOG[0],'energy')), 0); return (hardware + serving) * Math.max(0.1, 1 - strategicBonus(state, 'energyEfficiency') - deployedIdentityBonus(state, 'energyEfficiency')); }
export function energyProduction(state) { return (BASE_ENERGY_PRODUCTION + ENERGY_BUILDINGS.reduce((total, building) => total + building.output * state.energy.buildings[building.id], 0)) * (1 + strategicBonus(state, 'energyOutput')); }
export function energyEfficiency(state) { const demand = rawEnergyDemand(state); return demand <= 0 ? 1 : Math.min(1, energyProduction(state) / demand); }
export function energyUse(state) { return rawEnergyDemand(state); }
export function effectiveHardwareOutput(state, item) { const owned = state.hardware[item.id]; return owned ? hardwareContribution(state, item) / owned : item.computePerSecond * (1 + upgradeBonus(state, 'hardwareOutput', item.id)) * hardwareGlobalMultiplier(state) * energyEfficiency(state); }
export function activeModel(state) { return MODEL_CATALOG.find(({ id }) => id === state.model.activeId) ?? MODEL_CATALOG[0]; }
function deployedIdentityBonus(state,effect){return state.model.deployed.reduce((sum,id)=>sum+(MODEL_CATALOG.find(model=>model.id===id)?.identity?.[effect]??0),0)}
function activeProgress(state){return state.model.progress?.[state.model.activeId]??{level:state.model.level,xp:state.model.xp,upgradePoints:state.model.upgradePoints??0,skills:state.model.improvements?.[state.model.activeId]??{}}}
function modelImprovementLevel(state, modelId, path) { return state.model.progress?.[modelId]?.skills?.[path] ?? state.model.improvements[modelId]?.[path] ?? 0; }
export function effectiveModelStat(state, model, stat) { const base=model.stats[stat]??0; return (base + modelImprovementLevel(state,model.id,stat) * 0.4) * (['quality','reasoning','knowledge','context','coding','vision','creativity','math'].includes(stat) ? 1 + strategicBonus(state,'quality') + deployedIdentityBonus(state,'quality') : 1); }
export function revenuePerUser(state) { const enterpriseModels = state.model.deployed.reduce((sum,id) => {const model=MODEL_CATALOG.find(item=>item.id===id);return sum+(model?effectiveModelStat(state,model,'enterprise')*.04:0)}, 0) + (state.model.deployed.includes('agi') ? 0.5 : 0); return 0.24 * state.market.priceMultiplier * Math.max(0.1, 1 + enterpriseModels + upgradeBonus(state, 'revenue') + milestoneBonus(state, 'revenue') + strategicBonus(state, 'revenue') + deployedIdentityBonus(state,'revenue') + strategicBonus(state, 'enterprise') * 0.7 - strategicBonus(state, 'adoption') * 0.25); }
export function xpRequired(level) { return Math.floor(16 * level ** 1.4); }
export function trainingRequired(level) { return Math.floor(12 * level ** 1.46); }
export function trainingRequiredForState(state) { return trainingRequired(activeProgress(state).level) * (activeModel(state).trainingScale??1); }
function trainingMultiplier(state) { const skills=(modelImprovementLevel(state,state.model.activeId,'coding')+modelImprovementLevel(state,state.model.activeId,'reasoning')+modelImprovementLevel(state,state.model.activeId,'efficiency'))*.02;return Math.max(.1,1+upgradeBonus(state,'training')+strategicBonus(state,'training')+strategicBonus(state,'quality')*.5+deployedIdentityBonus(state,'coding')+skills) }
export function trainingRatePerSecond(state) { return computePerSecond(state) * state.allocation.training / 100 * trainingMultiplier(state); }

export function marketMetrics(state) {
  const deployed = MODEL_CATALOG.filter((model) => state.model.deployed.includes(model.id));
  const highestTier = HARDWARE_CATALOG.reduce((tier, item) => state.hardware[item.id] > 0 ? Math.max(tier, item.tier) : tier, 0);
  const deployedLevel = Math.max(1, ...deployed.map((model) => state.model.progress?.[model.id]?.level ?? 1));
  const deployedQuality = deployed.reduce((sum, model) => sum + effectiveModelStat(state, model, 'quality'), 0) / Math.max(1, deployed.length);
  const unlockedMarketSize = (30 + deployedLevel * 18) * 2.15 ** highestTier * (1 + upgradeBonus(state, 'marketSize') + strategicBonus(state, 'marketSize') + deployedIdentityBonus(state, 'marketSize'));
  const appeal = deployed.reduce((sum, deployedModel) => sum + effectiveModelStat(state,deployedModel,'popularity') + effectiveModelStat(state,deployedModel,'quality')*.5 + effectiveModelStat(state,deployedModel,'vision')*.2 + effectiveModelStat(state,deployedModel,'creativity')*.2 + effectiveModelStat(state,deployedModel,'context')*.1 + effectiveModelStat(state,deployedModel,'reasoning')*.1, 0) + upgradeBonus(state, 'appeal') * 10;
  const qualityAppeal = (appeal + strategicBonus(state, 'appeal') * 10 + deployedIdentityBonus(state,'demand') * 10) * (1 + deployedQuality * (0.2 + upgradeBonus(state, 'quality') + strategicBonus(state, 'quality')));
  const priceResistance = 1 / state.market.priceMultiplier ** Math.max(0.55, 1.35 - strategicBonus(state, 'priceElasticity'));
  const marketingPower = 1 + state.market.marketing * (0.12 + upgradeBonus(state, 'marketing'));
  const reputationPower = Math.max(1, state.market.reputation * (1 + upgradeBonus(state, 'reputation')));
  const adoptionPower = 1 + Math.sqrt(state.market.adoption) * (0.08 + upgradeBonus(state, 'adoption'));
  const modelEfficiency = deployed.reduce((sum, deployedModel) => sum + effectiveModelStat(state,deployedModel,'efficiency') * (1+effectiveModelStat(state,deployedModel,'latency')*.04), 0) / Math.max(1, deployed.length);
  const capacity = computePerSecond(state) * state.allocation.inference / 100 * modelEfficiency * 1.45 * Math.max(0.1, 1 + upgradeBonus(state, 'inference') + strategicBonus(state, 'enterprise') * 0.35);
  const organicDemand = unlockedMarketSize * qualityAppeal * 0.14 * marketingPower * reputationPower * adoptionPower * priceResistance * Math.max(0.1, 1 + upgradeBonus(state, 'demand') + milestoneBonus(state, 'demand') + strategicBonus(state, 'demand') + strategicBonus(state, 'adoption') - strategicBonus(state, 'enterprise') * 0.2);
  const distributionFloor = capacity * Math.min(0.22, 0.1 + highestTier * 0.006);
  const demand = Math.max(organicDemand, distributionFloor);
  const target = Math.floor(Math.min(demand, capacity));
  const utilization = capacity > 0 ? Math.min(1, demand / capacity) : 0;
  return { demand, capacity, target, utilization, unlockedMarketSize, bottleneck: demand < capacity ? 'DEMAND LIMITED' : 'CAPACITY LIMITED', revenue: state.resources.users * revenuePerUser(state) };
}

export function userGrowthPerSecond(state) { const target = marketMetrics(state).target; return (target - state.resources.users) * 0.18; }

export function economySnapshot(state) {
  const compute = computePerSecond(state);
  const market = marketMetrics(state);
  const energyOut = energyProduction(state);
  const energyDemand = energyUse(state);
  const trainingRate = compute * state.allocation.training / 100;
  const inferenceRate = compute * state.allocation.inference / 100;
  const computeConsumed = inferenceRate * market.utilization + compute * (state.allocation.research + state.allocation.data + state.allocation.agents + (state.model.trainingActive ? state.allocation.training : 0)) / 100;
  const storedComputeRate = state.model.trainingActive ? 0 : trainingRate;
  const currentObjective = OBJECTIVES.find((objective) => !state.objectives[objective.id] && objectiveProgress(state, objective) < objective.target) ?? null;
  return {
    credits: state.resources.credits, creditsPerSecond: market.revenue, revenuePerSecond: market.revenue,
    compute: state.resources.compute, computePerSecond: compute, computeConsumed, computeWasted: Math.max(0, inferenceRate * (1 - market.utilization)), storedComputeRate,
    trainingCompute: trainingRate, research: state.resources.research, researchPerSecond: compute * state.allocation.research / 100,
    users: state.resources.users, usersPerSecond: (market.target - state.resources.users) * .18, targetUsers: market.target, unlockedMarketSize: market.unlockedMarketSize, demand: market.demand, capacity: market.capacity,
    utilization: market.utilization, revenuePerUser: revenuePerUser(state), priceMultiplier: state.market.priceMultiplier,
    marketing: state.market.marketing, marketingBonus: 1 + state.market.marketing * (0.12 + upgradeBonus(state, 'marketing')),
    reputation: state.market.reputation, adoption: state.market.adoption,
    energyProduction: energyOut, energyDemand, energySurplus: energyOut - energyDemand, energyEfficiency: energyEfficiency(state),
    currentHardwareTier: HARDWARE_CATALOG.reduce((tier, item) => state.hardware[item.id] > 0 ? Math.max(tier, item.tier) : tier, 0),
    currentModel: state.model.activeId, trainingTarget: state.model.trainingTarget ?? state.model.activeId,
    modelLevel: state.model.level, modelXp: state.model.xp, modelUpgradePoints: state.model.upgradePoints ?? 0,
    currentPatent: PATENTS[state.patents.discovered.length]?.id ?? null, currentObjective: currentObjective?.id ?? null,
    developmentCycle: state.meta.cycles, runCreditsEarned: state.run.creditsEarned, runComputeProduced: state.run.computeProduced, intelligence: state.meta.intelligence, gems: state.resources.gems,
    bottleneck: market.bottleneck,
  };
}

function tutorialAfterTick(state) {
  let step = state.tutorial.step;
  if (step === 2 && computePerSecond(state) > 0 && state.statistics.totalComputeProduced >= 0.25) step = 3;
  if (step === 5 && state.resources.users >= 1) step = 6;
  if (step === 6 && state.statistics.totalCreditsEarned >= 0.1) step = 7;
  return step === state.tutorial.step ? state : { ...state, tutorial: { ...state.tutorial, step } };
}

export function tickGame(state, deltaMs) {
  const seconds = deltaMs / 1000;
  const rate = computePerSecond(state);
  const produced = rate * seconds;
  const allocationEfficiency = 1 + strategicBonus(state, 'allocationEfficiency');
  const rawTrainingGain = produced * state.allocation.training / 100 * allocationEfficiency;
  const effectiveTrainingMultiplier = trainingMultiplier(state);
  const trainingGain = rawTrainingGain * effectiveTrainingMultiplier;
  const researchGain = produced * state.allocation.research / 100 * Math.max(0.1, 1 + strategicBonus(state, 'research')) * allocationEfficiency;
  const dataGain = produced * state.allocation.data / 100 * allocationEfficiency;
  const autonomy=state.model.deployed.reduce((sum,id)=>{const model=MODEL_CATALOG.find(item=>item.id===id);return sum+(model?effectiveModelStat(state,model,'autonomy')*.015:0)},0);const agentGain = produced * state.allocation.agents / 100 * (1 + strategicBonus(state, 'agents') + autonomy) * allocationEfficiency * (1 + deployedIdentityBonus(state,'agents'));
  const metrics = marketMetrics(state);
  const userStep = Math.max(0.2 * seconds, Math.abs(metrics.target - state.resources.users) * 0.18 * seconds);
  const users = metrics.target > state.resources.users ? Math.min(metrics.target, state.resources.users + userStep) : Math.max(metrics.target, state.resources.users - userStep);
  const creditGain = users * revenuePerUser(state) * seconds;
  const safety = state.model.deployed.reduce((sum,id) => {const model=MODEL_CATALOG.find(item=>item.id===id);return sum+(model?effectiveModelStat(state,model,'safety')*.1:0)}, 0);
  const reputation = Math.min(10, state.market.reputation + dataGain * 0.00004 * (1 + safety * 0.06 + strategicBonus(state, 'reputationGrowth')));
  const adoption = Math.min(100, state.market.adoption + agentGain * 0.0002 + users * seconds * 0.00004 * (1 + deployedIdentityBonus(state,'adoption')));
  const wasTrainingActive=state.model.trainingActive;
  const storedTrainingUsed = wasTrainingActive ? Math.min(state.resources.compute, Math.max(rawTrainingGain, seconds * .25)) : 0;
  let trainingProgress = state.model.trainingProgress;
  let trainingActive = state.model.trainingActive;
  let level = activeProgress(state).level; let xp = activeProgress(state).xp; let upgradePoints = activeProgress(state).upgradePoints;
  let completedTraining = false;
  if (trainingActive) {
    trainingProgress += trainingGain + storedTrainingUsed * effectiveTrainingMultiplier;
    const required = trainingRequiredForState(state);
    if (trainingProgress >= required) { trainingProgress = 0; trainingActive = false; completedTraining = true; xp += required; while (xp >= xpRequired(level)) { xp -= xpRequired(level); level += 1; upgradePoints += 1; } }
  }
  const patentRate = patentResearchPerSecond(state);
  let patentProgress = state.patents.progress + patentRate * seconds;
  let discoveredPatents = state.patents.discovered; let patentHistory = state.patents.history; let equippedPatents = state.patents.equipped; let patentDiscovery = null;
  const nextPatent = PATENTS[discoveredPatents.length];
  if (nextPatent && patentProgress >= patentResearchRequired(discoveredPatents.length)) { patentProgress -= patentResearchRequired(discoveredPatents.length); discoveredPatents = [...discoveredPatents, nextPatent.id]; patentHistory = [...patentHistory, { id: nextPatent.id, discoveredAt: Date.now(), cycle: state.meta.cycles }]; if (equippedPatents.length < state.patents.slots) equippedPatents = [...equippedPatents, nextPatent.id]; patentDiscovery = nextPatent; }
  const eventCountdown = state.world.activeEvent ? state.world.nextEventMs : state.world.nextEventMs - deltaMs;
  const event = !state.world.activeEvent && eventCountdown <= 0 ? WORLD_EVENTS[(state.meta.cycles + Math.floor(state.statistics.playTimeMs / 90_000)) % WORLD_EVENTS.length] : state.world.activeEvent;
  let next = {
    ...state,
    resources: { ...state.resources, credits: state.resources.credits + creditGain, compute: Math.max(0, state.resources.compute - storedTrainingUsed + (wasTrainingActive ? 0 : rawTrainingGain)), users, research: state.resources.research + researchGain, gems: state.resources.gems + (patentDiscovery && discoveredPatents.length % 10 === 0 ? 1 : 0) },
    model: { ...state.model, level, xp, quality: effectiveModelStat(state,activeModel(state),'quality'), upgradePoints, trainingProgress, trainingActive, progress: { ...state.model.progress, [state.model.activeId]: { ...activeProgress(state), level, xp, upgradePoints } } },
    market: { ...state.market, reputation, adoption, demand: metrics.demand },
    statistics: { ...state.statistics, totalCreditsEarned: state.statistics.totalCreditsEarned + creditGain, totalComputeProduced: state.statistics.totalComputeProduced + produced, totalComputeConsumed: state.statistics.totalComputeConsumed + produced * (state.allocation.research + state.allocation.data + state.allocation.agents) / 100 + produced * state.allocation.inference / 100 * metrics.utilization + (wasTrainingActive ? rawTrainingGain : 0) + storedTrainingUsed, totalComputeWasted: state.statistics.totalComputeWasted + produced * state.allocation.inference / 100 * (1 - metrics.utilization), playTimeMs: state.statistics.playTimeMs + deltaMs },
    run: { ...state.run, creditsEarned: state.run.creditsEarned + creditGain, computeProduced: state.run.computeProduced + produced },
    session: { ...state.session, elapsedMs: state.session.elapsedMs + deltaMs },
    world: { ...state.world, activeEvent: event, nextEventMs: event ? Math.max(0, eventCountdown) : eventCountdown, modifiers: state.world.modifiers.filter((modifier) => modifier.expiresAt > state.statistics.playTimeMs) },
    patents: { ...state.patents, discovered: discoveredPatents, progress: patentProgress, history: patentHistory, equipped: equippedPatents },
    ui: { ...state.ui, patentDiscovery: patentDiscovery ?? state.ui.patentDiscovery },
  };
  if (completedTraining && state.tutorial.step === 4) next = { ...next, tutorial: { ...state.tutorial, step: 5 } };
  next = applyAutomation(awardAchievements(next));
  return tutorialAfterTick(next);
}

function feedback(state, message) { return { ...state, ui: { ...state.ui, toast: { message, id: Date.now() } } }; }
function spendCredits(state, cost) { return { ...state, resources: { ...state.resources, credits: state.resources.credits - cost }, statistics: { ...state.statistics, totalCreditsSpent: state.statistics.totalCreditsSpent + cost } }; }
function grantCredits(state, amount) { return { ...state, resources: { ...state.resources, credits: state.resources.credits + amount }, statistics: { ...state.statistics, totalCreditsEarned: state.statistics.totalCreditsEarned + amount }, run: { ...state.run, creditsEarned: state.run.creditsEarned + amount } }; }

export function buyHardware(state, itemId) {
  const item = HARDWARE_CATALOG.find(({ id }) => id === itemId);
  if (!item || !isHardwareUnlocked(state, item)) return state;
  const cost = effectiveHardwareCost(state, item);
  if (state.resources.credits < cost) return state;
  let next = spendCredits(state, cost); next = { ...next, hardware: { ...next.hardware, [itemId]: next.hardware[itemId] + 1 } };
  if (state.tutorial.step === 1 && itemId === 'calculator') next = { ...next, tutorial: { ...state.tutorial, step: 2 } };
  if (state.tutorial.step === 7 && itemId !== 'calculator') next = { ...next, tutorial: { ...state.tutorial, step: 8 } };
  return feedback(next, `${item.name} online · +${item.computePerSecond} Compute/s`);
}

export function optimizeCode(state) {
  const gain = optimizeGain(state);
  return feedback({ ...state, resources: { ...state.resources, compute: state.resources.compute + gain }, statistics: { ...state.statistics, totalComputeProduced: state.statistics.totalComputeProduced + gain, totalManualComputeProduced: state.statistics.totalManualComputeProduced + gain, totalClicks: state.statistics.totalClicks + 1 }, run: { ...state.run, computeProduced: state.run.computeProduced + gain } }, `Code optimized · +${gain.toFixed(1)} Compute`);
}

export function optimizeGain(state) {
  const rate = computePerSecond(state);
  const activeShare = 0.58 / (1 + Math.sqrt(rate / 350));
  return Math.max(0.5, Math.max(1.5 + state.model.level * 0.15, rate * activeShare) * Math.max(0.1, 1 + strategicBonus(state, 'click')));
}

export function trainModel(state) {
  if (state.model.trainingActive || computePerSecond(state) <= 0) return state;
  return feedback({ ...state, model: { ...state.model, trainingActive: true } }, `${activeModel(state).name} training run started`);
}

export function patentResearchRequired(index) {
  // Cumulative discovery targets: 25m, 5h, 1d, 1w, 3w, 2mo, and 6mo.
  const anchors = [[0,25],[4,300],[9,1440],[19,10080],[29,30240],[39,86400],[49,259200]];
  const cumulative = (patentIndex) => {
    const upper = anchors.find(([position]) => position >= patentIndex) ?? anchors.at(-1);
    const lower = [...anchors].reverse().find(([position]) => position <= patentIndex) ?? anchors[0];
    const ratio = upper[0] === lower[0] ? 0 : (patentIndex - lower[0]) / (upper[0] - lower[0]);
    return lower[1] * (upper[1] / lower[1]) ** ratio;
  };
  const durationMinutes = cumulative(index) - (index ? cumulative(index - 1) : 0);
  return durationMinutes * 60 * 0.025;
}
function patentLevel(state, patentId) { return state.patents.levels[patentId] ?? 1; }
function patentLevelMultiplier(state, patentId) { return 1 + (patentLevel(state, patentId) - 1) * 0.5; }
export function patentUpgradeCost(state, patentId) { return Math.ceil(2 * patentLevel(state, patentId) ** 1.7); }
export function patentCurrentBonus(state, patentId) { const patent = PATENTS.find(({ id }) => id === patentId); return patent ? patent.value * patentLevelMultiplier(state, patentId) : 0; }
export function togglePatentEquipped(state, patentId) { if (!state.patents.discovered.includes(patentId)) return state; const alreadyEquipped = state.patents.equipped.includes(patentId); const swapping = !alreadyEquipped && state.patents.equipped.length >= state.patents.slots; const equipped = alreadyEquipped ? state.patents.equipped.filter((id) => id !== patentId) : swapping ? [...state.patents.equipped.slice(1), patentId] : [...state.patents.equipped, patentId]; return feedback({ ...state, patents: { ...state.patents, equipped } }, alreadyEquipped ? 'Patent unequipped' : swapping ? 'Patent loadout swapped' : 'Patent equipped'); }
export function upgradePatent(state, patentId) { if (!state.patents.discovered.includes(patentId)) return state; const cost = patentUpgradeCost(state, patentId); if (state.meta.intelligence < cost) return state; return feedback({ ...state, meta: { ...state.meta, intelligence: state.meta.intelligence - cost }, patents: { ...state.patents, levels: { ...state.patents.levels, [patentId]: patentLevel(state, patentId) + 1 }, intInvested: { ...state.patents.intInvested, [patentId]: (state.patents.intInvested[patentId] ?? 0) + cost } } }, `${PATENTS.find(({id}) => id === patentId).name} upgraded`); }
export const PATENT_SLOT_PRICES = { 4: 250, 5: 600, 6: 1_200, 7: 2_500, 8: 5_000 };
export function buyPatentSlot(state) { const nextSlot = state.patents.slots + 1, cost = PATENT_SLOT_PRICES[nextSlot]; if (!cost || state.resources.gems < cost) return state; return feedback({ ...state, resources: { ...state.resources, gems: state.resources.gems - cost }, patents: { ...state.patents, slots: nextSlot } }, `Patent Slot ${nextSlot} unlocked`); }
export function patentResearchPerSecond(state) {
  if (state.patents.discovered.length >= PATENTS.length) return 0;
  const labs = 1 + (state.premium.purchases.includes('researchLab2') ? 0.2 : 0) + (state.premium.purchases.includes('researchLab3') ? 0.25 : 0);
  const researchModel = 1 + deployedIdentityBonus(state,'research') + state.model.deployed.reduce((sum,id)=>{const model=MODEL_CATALOG.find(item=>item.id===id);return sum+(model?(effectiveModelStat(state,model,'research')+effectiveModelStat(state,model,'knowledge')+effectiveModelStat(state,model,'math'))*.008:0)},0); const achievementFactor = 1 + Object.keys(state.meta.achievements).length * 0.002;
  const researchUpgrades = UPGRADES.filter((upgrade) => upgrade.category === 'research' && state.upgrades.includes(upgrade.id)).length;
  const computeFactor = computePerSecond(state) > 0 ? 1 + Math.log10(1 + computePerSecond(state)) * 0.04 : 0; return 0.025 * (state.allocation.research / 15) * computeFactor * Math.max(0.1, 1 + strategicBonus(state, 'research') + strategicBonus(state, 'flatResearch') * .04 + researchUpgrades * 0.04) * labs * researchModel * achievementFactor * (1 + Math.log10(1 + state.meta.totalIntelligence) * 0.03);
}

export function energyBuildingCost(state, building) { return Math.ceil(building.cost * 1.18 ** state.energy.buildings[building.id]); }
export function buyEnergyBuilding(state, buildingId) { const building = ENERGY_BUILDINGS.find(({id}) => id === buildingId); if (!building) return state; const cost = energyBuildingCost(state, building); if (state.resources.credits < cost) return state; const paid=spendCredits(state,cost);return feedback({ ...paid, energy: { ...paid.energy, buildings: { ...paid.energy.buildings, [buildingId]: paid.energy.buildings[buildingId] + 1 } } }, `${building.name} connected · +${building.output} energy`); }

export function modelImprovementCost() { return 1; }
export function improveModel(state, modelId, path) { if (!MODEL_SKILLS.includes(path) || !state.model.owned.includes(modelId)) return state; const progress=state.model.progress?.[modelId]??{level:1,xp:0,upgradePoints:0,skills:{}}; if(progress.upgradePoints<1)return state;const skills={...progress.skills,[path]:(progress.skills[path]??0)+1},nextProgress={...progress,upgradePoints:progress.upgradePoints-1,skills};const improvements={...state.model.improvements,[modelId]:skills};const active=modelId===state.model.activeId;return feedback({...state,model:{...state.model,upgradePoints:active?nextProgress.upgradePoints:state.model.upgradePoints,quality:active?(MODEL_CATALOG.find(model=>model.id===modelId)?.stats.quality??1)+(skills.quality??0)*.4:state.model.quality,progress:{...state.model.progress,[modelId]:nextProgress},improvements}},`${MODEL_CATALOG.find(({id})=>id===modelId).name} ${path} specialized`)}

export function acquireModel(state, modelId) {const model=MODEL_CATALOG.find(({id})=>id===modelId),index=MODEL_CATALOG.findIndex(({id})=>id===modelId);if(!model||index>0&&!state.model.owned.includes(MODEL_CATALOG[index-1].id))return state;if(state.model.owned.includes(modelId)){const progress=state.model.progress?.[modelId]??{level:1,xp:0,upgradePoints:0,skills:{}};return{...state,model:{...state.model,activeId:modelId,trainingTarget:modelId,level:progress.level,xp:progress.xp,upgradePoints:progress.upgradePoints,quality:effectiveModelStat(state,model,'quality')}}}if(state.meta.intelligence<model.intCost)return state;const progress={level:1,xp:0,upgradePoints:0,skills:{}};return feedback({...state,meta:{...state.meta,intelligence:state.meta.intelligence-model.intCost,unlockedModels:[...new Set([...(state.meta.unlockedModels??state.model.owned),modelId])]},model:{...state.model,activeId:modelId,trainingTarget:modelId,level:1,xp:0,upgradePoints:0,quality:model.stats.quality,owned:[...state.model.owned,modelId],progress:{...state.model.progress,[modelId]:progress}}},`${model.name} permanently unlocked`)}

export function toggleModelDeployment(state, modelId) { if (!state.model.owned.includes(modelId)) return state; const deployed = state.model.deployed.includes(modelId) ? state.model.deployed.filter((id) => id !== modelId) : [...state.model.deployed, modelId]; if (!deployed.length || deployed.length > 3) return state; return { ...state, model: { ...state.model, deployed } }; }

export function setAllocation(state, category, value) {
  if (!(category in state.allocation)) return state;
  const requested = Math.max(0, Math.min(100, Number(value)));
  const others = Object.keys(state.allocation).filter((key) => key !== category);
  const remaining = 100 - requested;
  const otherTotal = others.reduce((sum, key) => sum + state.allocation[key], 0);
  const allocation = { ...state.allocation, [category]: requested };
  others.forEach((key, index) => { allocation[key] = index === others.length - 1 ? 100 - Object.entries(allocation).filter(([name]) => name !== key).reduce((sum, [, amount]) => sum + amount, 0) : otherTotal ? Math.round(state.allocation[key] / otherTotal * remaining) : Math.round(remaining / others.length); });
  return { ...state, allocation };
}

export function setPrice(state, value) { return { ...state, market: { ...state.market, priceMultiplier: Math.max(0.5, Math.min(3, Number(value))) } }; }
export function buyMarketing(state) { const cost = 100 * (state.market.marketing + 1) ** 1.6; if(state.resources.credits<cost)return state;const paid=spendCredits(state,cost);return feedback({ ...paid, market: { ...paid.market, marketing: paid.market.marketing + 1 } }, 'Marketing reach increased'); }

export function canBuyUpgrade(state, upgrade) { const balance = upgrade.category === 'research' ? state.resources.research : state.resources.credits; const unlocked = upgrade.category === 'hardware' ? state.hardware[upgrade.hardwareId] >= upgrade.unlock : state.model.level >= upgrade.unlock; return !state.upgrades.includes(upgrade.id) && unlocked && balance >= upgrade.cost; }
export function buyUpgrade(state, upgradeId) { const upgrade = UPGRADES.find(({ id }) => id === upgradeId); if (!upgrade || !canBuyUpgrade(state, upgrade)) return state; const paid=upgrade.category==='research'?{...state,resources:{...state.resources,research:state.resources.research-upgrade.cost}}:spendCredits(state,upgrade.cost);return feedback({ ...paid, upgrades: [...paid.upgrades, upgradeId] }, `${upgrade.name} installed`); }

export function objectiveProgress(state, objective) { const values = { hardware: state.hardware.calculator, level: state.model.level, users: state.resources.users, gamingPc: state.hardware.gamingPc, workstation: state.hardware.workstation, computeRate: computePerSecond(state) }; return Math.min(objective.target, values[objective.type]); }
export function claimObjective(state, objectiveId) { const objective = OBJECTIVES.find(({ id }) => id === objectiveId); if (!objective || state.objectives[objectiveId] || objectiveProgress(state, objective) < objective.target) return state; const rewarded=grantCredits(state,objective.reward);return feedback({ ...rewarded, objectives: { ...rewarded.objectives, [objectiveId]: true } }, `Objective complete · +${objective.reward} Credits`); }

export function advanceTutorial(state) { const step = state.tutorial.step; if ([0, 3].includes(step)) return { ...state, tutorial: { ...state.tutorial, step: step + 1 }, ui: { ...state.ui, activeView: step === 0 ? 'hardware' : 'model' } }; if (step === 8) return { ...state, tutorial: { ...state.tutorial, step: 9 } }; if (step === 9) return { ...state, tutorial: { step: 10, completed: true } }; return state; }

function achievementMetric(state, metric) {
  const hardware = Object.values(state.hardware).reduce((sum, quantity) => sum + quantity, 0);
  return { totalCreditsEarned: state.statistics.totalCreditsEarned, totalComputeProduced: state.statistics.totalComputeProduced, totalClicks: state.statistics.totalClicks, users: state.resources.users, quality: state.model.quality, hardware, level: state.model.level, research: state.resources.research, reputation: state.market.reputation, cycles: state.meta.cycles }[metric];
}

function awardAchievements(state) {
  const earned = ACHIEVEMENTS.filter((achievement) => !state.meta.achievements[achievement.id] && achievementMetric(state, achievement.metric) >= achievement.target);
  if (!earned.length) return state;
  const gems = earned.filter((achievement) => Number(achievement.id.split('-').at(-1)) % 4 === 0).length;
  return feedback({ ...state, resources: { ...state.resources, gems: state.resources.gems + gems }, meta: { ...state.meta, achievements: { ...state.meta.achievements, ...Object.fromEntries(earned.map((achievement) => [achievement.id, Date.now()])) } } }, `${earned[0].name} achieved · permanent company bonus${gems ? ` · +${gems} Gem` : ''}`);
}

function applyAutomation(state) {
  let next = state;
  if (state.meta.techNodes.includes('automation-1')) {
    const metrics = marketMetrics(state); const desiredInference = metrics.utilization < 0.75 ? Math.max(15, state.allocation.inference - 1) : Math.min(65, state.allocation.inference + 1);
    if (desiredInference !== state.allocation.inference) next = setAllocation(next, 'inference', desiredInference);
  }
  if (state.meta.techNodes.includes('automation-2') && state.session.elapsedMs - state.automation.lastHardwarePurchaseMs >= 1_000) {
    const item = HARDWARE_CATALOG.find((hardware) => isHardwareUnlocked(next, hardware) && effectiveHardwareCost(next, hardware) <= next.resources.credits * 0.25);
    if (item) { next = buyHardware(next, item.id); next = { ...next, automation: { ...next.automation, lastHardwarePurchaseMs: state.session.elapsedMs } }; }
  }
  if (state.meta.techNodes.includes('automation-3') && !next.model.trainingActive && computePerSecond(next) > 0) next = { ...next, model: { ...next.model, trainingActive: true } };
  return next;
}

export function cycleIntelligence(state) { return Math.max(2, Math.floor(2 + Math.log10(1 + state.run.creditsEarned / 10_000) * 1.5 + Math.max(0, state.model.level - 5) / 6 + state.meta.cycles * 0.5)); }
export function canDevelop(state) { return state.model.level >= 5 && state.run.creditsEarned >= 250_000; }
export function startDevelopmentCycle(state) {
  if (!canDevelop(state)) return state;
  const intelligence = cycleIntelligence(state); const fresh = createDefaultState();
  const intelligenceMultiplier = 1 + strategicBonus(state, 'intelligenceGain') + deployedIdentityBonus(state,'intelligence');
  const unlocked=state.meta.unlockedModels??state.model.owned;const progress=state.model.progress??{};const tinyProgress=progress.tinyChat??fresh.model.progress.tinyChat;return feedback({ ...fresh, resources: { ...fresh.resources, gems: state.resources.gems }, settings: state.settings, statistics: state.statistics, meta: { ...state.meta, unlockedModels:unlocked, intelligence: state.meta.intelligence + Math.floor(intelligence * intelligenceMultiplier), totalIntelligence: state.meta.totalIntelligence + Math.floor(intelligence * intelligenceMultiplier), cycles: state.meta.cycles + 1 }, model:{...fresh.model,level:tinyProgress.level,xp:tinyProgress.xp,upgradePoints:tinyProgress.upgradePoints,owned:unlocked,deployed:['tinyChat'],progress}, patents: state.patents, premium: state.premium, retention: state.retention, tutorial: { step: 10, completed: true } }, `Development Cycle complete · +${Math.floor(intelligence * intelligenceMultiplier)} INT`);
}
export function buyTechNode(state, nodeId) {
  const node = TECH_NODES.find(({ id }) => id === nodeId); if (!node || state.meta.techNodes.includes(nodeId) || state.meta.intelligence < node.cost || (node.requires && !state.meta.techNodes.includes(node.requires))) return state;
  return feedback({ ...state, meta: { ...state.meta, intelligence: state.meta.intelligence - node.cost, techNodes: [...state.meta.techNodes, nodeId] } }, `${node.name} permanently unlocked`);
}
export function resolveWorldEvent(state, choiceIndex) {
  const event = state.world.activeEvent; const choice = event?.choices[choiceIndex]; if (!choice || (choice.cost && state.resources.credits < choice.cost)) return state;
  const modifier = { effect: choice.effect, value: choice.value, expiresAt: state.statistics.playTimeMs + 180_000 };
  const reputationPenalty = choice.penalty === 'reputation' ? -0.15 : 0;
  let next=choice.cost?spendCredits(state,choice.cost):state;if(choice.credits)next=grantCredits(next,choice.credits);return feedback({ ...next, market: { ...next.market, reputation: Math.max(0.25, next.market.reputation + reputationPenalty) }, world: { activeEvent: null, nextEventMs: 600_000 + (next.statistics.totalClicks % 600) * 1_000, modifiers: [...next.world.modifiers, modifier] } }, `${event.title}: ${choice.label}`);
}

export function companyStage(state) { const tier = HARDWARE_CATALOG.reduce((highest, hardware) => state.hardware[hardware.id] ? Math.max(highest, hardware.tier) : highest, 0); return ['Garage Developer', 'Startup', 'AI Company', 'Tech Giant', 'Global AI Infrastructure', 'Planetary Compute Network', 'Interplanetary AI', 'Technological Singularity'][Math.min(7, Math.floor(tier / 2))]; }
export function dismissPatentDiscovery(state) { return { ...state, ui: { ...state.ui, patentDiscovery: null } }; }

export function buyGemShopItem(state, itemId) { const item = GEM_SHOP_ITEMS.find(({id}) => id === itemId); if (!item || state.premium.purchases.includes(itemId) || state.resources.gems < item.cost) return state; return feedback({ ...state, resources: { ...state.resources, gems: state.resources.gems - item.cost }, premium: { ...state.premium, purchases: [...state.premium.purchases, itemId] } }, `${item.name} added to your account`); }

export function claimRewardedAd(state, reward) {
  const now = Date.now(); if ((state.premium.adCooldowns[reward] ?? 0) > now) return state;
  const modifiers = { credits: { effect:'revenue',value:1 }, compute: { effect:'hardwareOutput',value:1 }, training: { effect:'training',value:.5 }, marketing: { effect:'demand',value:.5 }, energy: { effect:'energyOutput',value:1 }, research: { effect:'research',value:1 } };
  const modifier = modifiers[reward]; if (!modifier) return state;
  return feedback({ ...state, world: { ...state.world, modifiers: [...state.world.modifiers, { ...modifier, expiresAt: state.statistics.playTimeMs + 1_800_000 }] }, premium: { ...state.premium, adCooldowns: { ...state.premium.adCooldowns, [reward]: now + 3_600_000 } } }, `Optional boost activated · ${reward} for 30 minutes`);
}

function dateKey(date = new Date()) { return date.toISOString().slice(0,10); }
export function retentionMissions(state) { const day = dateKey(); const week = `${new Date().getUTCFullYear()}-W${Math.ceil((((new Date()) - new Date(Date.UTC(new Date().getUTCFullYear(),0,1))) / 86400000 + 1) / 7)}`; return [
  { id:`${day}-compute`,period:'Daily',text:'Produce 100 Compute',progress:state.statistics.totalComputeProduced,target:100,reward:{research:10} },
  { id:`${day}-users`,period:'Daily',text:'Serve 25 Users',progress:state.resources.users,target:25,reward:{credits:250} },
  { id:`${day}-train`,period:'Daily',text:'Reach Model Level 2',progress:state.model.level,target:2,reward:{gems:1} },
  { id:`${week}-patent`,period:'Weekly',text:'Discover a Patent',progress:state.patents.discovered.length,target:1,reward:{gems:3} },
  { id:`${week}-growth`,period:'Weekly',text:'Earn 10,000 Credits',progress:state.statistics.totalCreditsEarned,target:10000,reward:{gems:4} },
  { id:`${new Date().getUTCFullYear()}-${new Date().getUTCMonth()}-cycle`,period:'Monthly',text:'Complete a Development Cycle',progress:state.meta.cycles,target:1,reward:{gems:10} },
]; }
export function claimLoginReward(state) { const today = dateKey(); if (state.retention.lastLoginDate === today) return state; const yesterday = dateKey(new Date(Date.now() - 86400000)); const streak = state.retention.lastLoginDate === yesterday ? state.retention.loginStreak + 1 : 1; const gems = streak % 7 === 0 ? 3 : 1; return feedback({ ...state, resources: { ...state.resources, gems: state.resources.gems + gems }, retention: { ...state.retention, lastLoginDate: today, loginStreak: streak } }, `Day ${streak} login · +${gems} Gem${gems > 1 ? 's' : ''}`); }
export function claimRetentionMission(state, missionId) { const mission = retentionMissions(state).find(({id}) => id === missionId); if (!mission || state.retention.claimedDaily[missionId] || mission.progress < mission.target) return state; let rewarded=state;for(const [resource,amount] of Object.entries(mission.reward)){rewarded=resource==='credits'?grantCredits(rewarded,amount):{...rewarded,resources:{...rewarded.resources,[resource]:rewarded.resources[resource]+amount}}}return feedback({ ...rewarded, retention: { ...rewarded.retention, claimedDaily: { ...rewarded.retention.claimedDaily, [missionId]: true } } }, `${mission.period} mission complete`); }
