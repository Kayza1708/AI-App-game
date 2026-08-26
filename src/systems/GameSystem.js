import { ACHIEVEMENTS, createDefaultState, GEM_SHOP_ITEMS, HARDWARE_CATALOG, MODEL_CATALOG, MODEL_SKILLS, OBJECTIVES, PATENTS, TECH_NODES, UPGRADES, WORLD_EVENTS } from '../data/defaultState.js';
import { BALANCE, curveValue, FEATURE_UNLOCKS, featureUnlocked, skillUnlocked, SYSTEM_TECH_NODES } from '../config/balance.js';
import { modifierValue } from './ModifierSystem.js';
import { purchaseSystemTech } from './TechSystem.js';
import { ensureMissions } from './MissionSystem.js';
import { ensureGameState } from '../core/GameStateContract.js';



function strategicBonus(state, effect) {
  const tech = TECH_NODES.filter((node) => state.meta.techNodes.includes(node.id));
  const positive = tech.filter((node) => node.effect === effect).reduce((sum, node) => sum + node.value, 0);
  const penalties = tech.filter((node) => node.tradeoff === effect).reduce((sum, node) => sum + node.penalty, 0);
  const events = state.world.modifiers.filter((modifier) => modifier.effect === effect).reduce((sum, modifier) => sum + modifier.value, 0);
  const achievementBonus = Object.keys(state.meta.achievements).reduce((sum, id) => sum + (ACHIEVEMENTS.find((achievement) => achievement.id === id)?.reward ?? 0), 0);
  const patents = PATENTS.filter((patent) => state.patents.equipped.includes(patent.id) && patent.effect === effect).reduce((sum, patent) => sum + patent.value * patentLevelMultiplier(state, patent.id), 0);
  const modelStats = ['quality','reasoning','knowledge','context','coding','vision','creativity','math','efficiency','latency','popularity','enterprise','research','safety','autonomy'];
  return positive - penalties + events + patents + (['allOutput', 'hardwareOutput', 'demand', 'revenue', 'training'].includes(effect) ? achievementBonus : 0) + (modelStats.includes(effect) ? 0 : modifierValue(state, effect));
}

export function hardwareCost(item, quantity) { return Math.ceil(curveValue(item.baseCost, BALANCE.hardware.costGrowth, quantity)); }
export function isHardwareUnlocked(state, item) { return item.tier === 0 || state.hardware[HARDWARE_CATALOG[item.tier - 1].id] > 0; }

function upgradeBonus(state, effect, hardwareId = null) {
  return UPGRADES.filter((upgrade) => state.upgrades.includes(upgrade.id) && upgrade.effect === effect && (!upgrade.hardwareId || upgrade.hardwareId === hardwareId)).reduce((total, upgrade) => total + upgrade.value, 0);
}

function milestoneBonus(state, effect, item = null) {
  return HARDWARE_CATALOG.reduce((total, hardware) => total + hardware.milestones.filter((milestone) => state.hardware[hardware.id] >= milestone.quantity && milestone.effect === effect && (!item || hardware.id === item.id)).reduce((sum, milestone) => sum + milestone.value, 0), 0);
}

export function effectiveHardwareCost(state, item) {
  const discount = Math.min(BALANCE.hardware.bulkDiscountCap, upgradeBonus(state, 'hardwareCost', item.id) + milestoneBonus(state, 'hardwareDiscount') + strategicBonus(state, 'hardwareCost') + strategicBonus(state, 'hardwareDiscount'));
  return Math.ceil(hardwareCost(item, state.hardware[item.id]) * (1 - discount));
}

function hardwareGlobalMultiplier(state) {
  return Math.max(0.1, 1 + upgradeBonus(state, 'allOutput') + upgradeBonus(state, 'hardwareOutput') + strategicBonus(state, 'allOutput') + strategicBonus(state, 'hardwareOutput') + deployedIdentityBonus(state, 'allOutput') + deployedIdentityBonus(state, 'hardwareOutput'));
}

export function hardwareContribution(state, item) {
  return rawHardwareContribution(state, item) * hardwareGlobalMultiplier(state);
}
export function rawHardwareContribution(state, item) { return item.computePerSecond * state.hardware[item.id] * (1 + milestoneBonus(state, 'hardwareOutput', item) + upgradeBonus(state, 'hardwareOutput', item.id)); }

export function computePerSecond(input) {
  const state = ensureGameState(input);
  const raw = HARDWARE_CATALOG.reduce((total, item) => total + rawHardwareContribution(state, item), 0);
  return raw * hardwareGlobalMultiplier(state);
}

// Legacy compatibility: Energy was removed in save version 14 and never affects simulation.
export function rawEnergyDemand() { return 0; }
export function energyProduction() { return 0; }
export function energyEfficiency() { return 1; }
export function energyUse() { return 0; }
export function effectiveHardwareOutput(state, item) { const owned = state.hardware[item.id]; return owned ? hardwareContribution(state, item) / owned : item.computePerSecond * (1 + upgradeBonus(state, 'hardwareOutput', item.id)) * hardwareGlobalMultiplier(state); }
export function activeModel(state) { return MODEL_CATALOG.find(({ id }) => id === state.model.activeId) ?? MODEL_CATALOG[0]; }
function deployedIdentityBonus(state,effect){return state.model.deployed.reduce((sum,id)=>sum+(MODEL_CATALOG.find(model=>model.id===id)?.identity?.[effect]??0),0)}
function activeProgress(state){return state.model.progress?.[state.model.activeId]??{level:state.model.level,xp:state.model.xp,upgradePoints:state.model.upgradePoints??0,trainings:0,totalPointsEarned:state.model.upgradePoints??0,totalPointsSpent:0,skills:state.model.improvements?.[state.model.activeId]??{}}}
function modelImprovementLevel(state, modelId, path) { return state.model.progress?.[modelId]?.skills?.[path] ?? state.model.improvements[modelId]?.[path] ?? 0; }
export function effectiveModelStat(state, model, stat) { const base=model.stats[stat]??0; const points=skillUnlocked(state,stat)?modelImprovementLevel(state,model.id,stat):0; return (base + points * BALANCE.training.skillGain + modifierValue(state,stat,model.id)) * (['quality','reasoning','knowledge','context','coding','vision','creativity','math'].includes(stat) ? 1 + strategicBonus(state,'quality') + deployedIdentityBonus(state,'quality') : 1); }
export function lifetimeIncomeMultiplier(state) { return 1 + Math.max(0, state.meta.totalIntelligence ?? 0) * 0.10; }
export function revenuePerUser(state) { const enterpriseModels = state.model.deployed.reduce((sum,id) => {const model=MODEL_CATALOG.find(item=>item.id===id);return sum+(model?effectiveModelStat(state,model,'enterprise')*.04+effectiveModelStat(state,model,'quality')*.012:0)}, 0) + (state.model.deployed.includes('agi') ? 0.5 : 0); return BALANCE.market.revenueBase * state.market.priceMultiplier * lifetimeIncomeMultiplier(state) * Math.max(0.1, 1 + enterpriseModels + upgradeBonus(state, 'revenue') + milestoneBonus(state, 'revenue') + strategicBonus(state, 'revenue') + deployedIdentityBonus(state,'revenue') + strategicBonus(state, 'enterprise') * 0.7 - strategicBonus(state, 'adoption') * 0.25); }
export function xpRequired() { return 0; }
export function trainingRequired(level) { const anchors=BALANCE.training.requirementAnchors; const target=Math.max(1,Number(level)||1); const upper=anchors.find(([anchor])=>anchor>=target)??anchors.at(-1); const lower=[...anchors].reverse().find(([anchor])=>anchor<=target)??anchors[0]; if(upper[0]===lower[0])return lower[1]; const ratio=(target-lower[0])/(upper[0]-lower[0]); return Math.round(Math.exp(Math.log(lower[1])+(Math.log(upper[1])-Math.log(lower[1]))*ratio)); }
export function trainingRequiredForState(state) { const progress=activeProgress(state);return trainingRequired(progress.level) * (activeModel(state).trainingScale??1); }
function trainingMultiplier(state) { const skills=(modelImprovementLevel(state,state.model.activeId,'coding')+modelImprovementLevel(state,state.model.activeId,'reasoning')+modelImprovementLevel(state,state.model.activeId,'efficiency'))*.02;return Math.max(.1,1+upgradeBonus(state,'training')+strategicBonus(state,'training')+strategicBonus(state,'quality')*.5+deployedIdentityBonus(state,'coding')+skills) }
export function trainingRatePerSecond(state) { return computePerSecond(state) * state.allocation.training / 100 * trainingMultiplier(state); }
export function trainingEtaSeconds(state){const rate=trainingRatePerSecond(state);const banked=state.model.trainingActive?(state.resources.compute??0)*trainingMultiplier(state):0;return rate>0?Math.max(0,trainingRequiredForState(state)-state.model.trainingProgress-banked)/rate:Infinity}
export function completeTrainingProgress(progress){const upgradePoints=Math.max(0,progress.upgradePoints??0)+1,totalPointsSpent=Math.max(0,progress.totalPointsSpent??0);return{...progress,level:Math.max(1,progress.level??1)+1,xp:0,trainings:Math.max(0,progress.trainings??0)+1,upgradePoints,totalPointsSpent,totalPointsEarned:upgradePoints+totalPointsSpent}}

export function marketMetrics(input) {
  const state = ensureGameState(input);
  const deployed = MODEL_CATALOG.filter((model) => state.model.deployed.includes(model.id));
  const highestTier = HARDWARE_CATALOG.reduce((tier, item) => state.hardware[item.id] > 0 ? Math.max(tier, item.tier) : tier, 0);
  const deployedLevel = Math.max(1, ...deployed.map((model) => state.model.progress?.[model.id]?.level ?? 1));
  const deployedQuality = deployed.reduce((sum, model) => sum + effectiveModelStat(state, model, 'quality'), 0) / Math.max(1, deployed.length);
  const unlockedMarketSize = (30 + deployedLevel * 18) * BALANCE.market.tierMarketGrowth ** highestTier * (1 + upgradeBonus(state, 'marketSize') + strategicBonus(state, 'marketSize') + deployedIdentityBonus(state, 'marketSize'));
  const appeal = deployed.reduce((sum, deployedModel) => sum + effectiveModelStat(state,deployedModel,'popularity') + effectiveModelStat(state,deployedModel,'quality')*.5 + effectiveModelStat(state,deployedModel,'vision')*.2 + effectiveModelStat(state,deployedModel,'creativity')*.2 + effectiveModelStat(state,deployedModel,'context')*.1 + effectiveModelStat(state,deployedModel,'reasoning')*.1, 0) + upgradeBonus(state, 'appeal') * 10;
  const qualityAppeal = (appeal + strategicBonus(state, 'appeal') * 10 + deployedIdentityBonus(state,'demand') * 10) * (1 + deployedQuality * (0.2 + upgradeBonus(state, 'quality') + strategicBonus(state, 'quality')));
  const priceResistance = 1 / state.market.priceMultiplier ** Math.max(0.55, 1.35 - strategicBonus(state, 'priceElasticity'));
  const marketingPower = 1 + state.market.marketing * (BALANCE.market.marketingBase + upgradeBonus(state, 'marketing'));
  const reputationPower = Math.max(1, state.market.reputation * (1 + upgradeBonus(state, 'reputation')));
  const adoptionPower = 1 + Math.sqrt(state.market.adoption) * (0.08 + upgradeBonus(state, 'adoption'));
  const modelEfficiency = deployed.reduce((sum, deployedModel) => sum + effectiveModelStat(state,deployedModel,'efficiency') * (1+effectiveModelStat(state,deployedModel,'latency')*.04), 0) / Math.max(1, deployed.length);
  const capacity = computePerSecond(state) * state.allocation.inference / 100 * modelEfficiency * BALANCE.market.capacityScale * Math.max(0.1, 1 + upgradeBonus(state, 'inference') + strategicBonus(state, 'enterprise') * 0.35);
  const organicDemand = unlockedMarketSize * qualityAppeal * BALANCE.market.demandScale * marketingPower * reputationPower * adoptionPower * priceResistance * Math.max(0.1, 1 + upgradeBonus(state, 'demand') + milestoneBonus(state, 'demand') + strategicBonus(state, 'demand') + strategicBonus(state, 'adoption') - strategicBonus(state, 'enterprise') * 0.2);
  const distributionFloor = capacity * Math.min(0.14, BALANCE.market.demandFloor + highestTier * 0.005);
  const demand = Math.max(organicDemand, distributionFloor);
  const target = Math.floor(Math.min(demand, capacity));
  const utilization = capacity > 0 ? Math.min(1, state.resources.users / capacity) : 0;
  return { demand, capacity, target, utilization, unlockedMarketSize, bottleneck: demand < capacity ? 'DEMAND LIMITED' : 'CAPACITY LIMITED', revenue: state.resources.users * revenuePerUser(state) };
}

export function userGrowthPerSecond(state) { const target = marketMetrics(state).target; return (target - state.resources.users) * BALANCE.market.userConvergence; }

export function createDefaultEconomySnapshot() {
  return {
    credits: 0, creditsPerSecond: 0, revenuePerSecond: 0,
    compute: 0, computePerSecond: 0, computeConsumed: 0, computeWasted: 0, storedComputeRate: 0,
    trainingCompute: 0, research: 0, researchPerSecond: 0,
    users: 0, usersPerSecond: 0, targetUsers: 0, unlockedMarketSize: 0, demand: 0, capacity: 0,
    utilization: 0, revenuePerUser: 0, priceMultiplier: 1, marketing: 0, marketingBonus: 1,
    reputation: 1, adoption: 0, energyProduction: 0, energyDemand: 0, energySurplus: 0, energyEfficiency: 1, currentHardwareTier: 0,
    currentModel: MODEL_CATALOG[0].id, trainingTarget: MODEL_CATALOG[0].id,
    modelLevel: 1, modelXp: 0, modelUpgradePoints: 0, currentPatent: null, currentObjective: null,
    developmentCycle: 0, runCreditsEarned: 0, runComputeProduced: 0, intelligence: 0, gems: 0,
    bottleneck: 'CAPACITY LIMITED',
  };
}

export function economySnapshot(input) {
  const state = ensureGameState(input);
  const compute = computePerSecond(state);
  const market = marketMetrics(state);
  const trainingRate = trainingRatePerSecond(state);
  const inferenceRate = compute * state.allocation.inference / 100;
  const computeConsumed = inferenceRate * market.utilization + compute * (state.allocation.research + state.allocation.data + state.allocation.agents + (state.model.trainingActive ? state.allocation.training : 0)) / 100;
  const storedComputeRate = state.model.trainingActive ? 0 : trainingRate;
  const currentObjective = OBJECTIVES.find((objective) => !state.objectives[objective.id] && objectiveProgress(state, objective) < objective.target) ?? null;
  return { ...createDefaultEconomySnapshot(),
    credits: state.resources.credits, creditsPerSecond: market.revenue, revenuePerSecond: market.revenue,
    compute: state.resources.compute, computePerSecond: compute, computeConsumed, computeWasted: Math.max(0, inferenceRate * (1 - market.utilization)), storedComputeRate,
    trainingCompute: trainingRate, research: state.resources.research, researchPerSecond: compute * state.allocation.research / 100,
    users: state.resources.users, usersPerSecond: (market.target - state.resources.users) * BALANCE.market.userConvergence, targetUsers: market.target, unlockedMarketSize: market.unlockedMarketSize, demand: market.demand, capacity: market.capacity,
    utilization: market.utilization, revenuePerUser: revenuePerUser(state), priceMultiplier: state.market.priceMultiplier,
    marketing: state.market.marketing, marketingBonus: 1 + state.market.marketing * (BALANCE.market.marketingBase + upgradeBonus(state, 'marketing')),
    reputation: state.market.reputation, adoption: state.market.adoption,
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
  const researchEnabled = featureUnlocked(state, 'research');
  const patentEnabled = featureUnlocked(state, 'patents');
  const rawTrainingGain = produced * state.allocation.training / 100 * allocationEfficiency;
  const effectiveTrainingMultiplier = trainingMultiplier(state);
  const trainingGain = rawTrainingGain * effectiveTrainingMultiplier;
  const researchGain = researchEnabled ? produced * state.allocation.research / 100 * Math.max(0.1, 1 + strategicBonus(state, 'research')) * allocationEfficiency : 0;
  const dataGain = produced * state.allocation.data / 100 * allocationEfficiency;
  const autonomy=state.model.deployed.reduce((sum,id)=>{const model=MODEL_CATALOG.find(item=>item.id===id);return sum+(model?effectiveModelStat(state,model,'autonomy')*.015:0)},0);const agentGain = produced * state.allocation.agents / 100 * (1 + strategicBonus(state, 'agents') + autonomy) * allocationEfficiency * (1 + deployedIdentityBonus(state,'agents'));
  const metrics = marketMetrics(state);
  const userStep = Math.max(0.2 * seconds, Math.abs(metrics.target - state.resources.users) * BALANCE.market.userConvergence * seconds);
  const users = metrics.target > state.resources.users ? Math.min(metrics.target, state.resources.users + userStep) : Math.max(metrics.target, state.resources.users - userStep);
  const creditGain = users * revenuePerUser(state) * seconds;
  const safety = state.model.deployed.reduce((sum,id) => {const model=MODEL_CATALOG.find(item=>item.id===id);return sum+(model?effectiveModelStat(state,model,'safety')*.1:0)}, 0);
  const reputation = Math.min(10, state.market.reputation + dataGain * 0.00004 * (1 + safety * 0.06 + strategicBonus(state, 'reputationGrowth')));
  const adoption = Math.min(100, state.market.adoption + agentGain * 0.0002 + users * seconds * 0.00004 * (1 + deployedIdentityBonus(state,'adoption')));
  const wasTrainingActive=state.model.trainingActive;
  // Manually generated Compute uses the same stored resource and is atomically
  // invested by active Training on the next simulation update.
  const storedTrainingUsed = wasTrainingActive ? state.resources.compute : 0;
  let trainingProgress = state.model.trainingProgress;
  let trainingActive = state.model.trainingActive;
  let trainingSession = state.model.trainingSession;
  let lastTrainingResult = state.model.lastTrainingResult;
  let level = activeProgress(state).level; let xp = activeProgress(state).xp; let upgradePoints = activeProgress(state).upgradePoints; let trainings=activeProgress(state).trainings??0; let totalPointsEarned=activeProgress(state).totalPointsEarned??upgradePoints; const totalPointsSpent=activeProgress(state).totalPointsSpent??0;
  let completedTraining = false;
  if (trainingActive) {
    const computeInvested = rawTrainingGain + storedTrainingUsed;
    trainingSession = { ...trainingSession, activeElapsedMs: (trainingSession?.activeElapsedMs ?? 0) + deltaMs, computeInvested: (trainingSession?.computeInvested ?? 0) + computeInvested };
    trainingProgress += trainingGain + storedTrainingUsed * effectiveTrainingMultiplier;
    const required = trainingRequiredForState(state);
    if (trainingProgress >= required) { const startingLevel=trainingSession?.startingLevel??level,completed=completeTrainingProgress({level,xp,upgradePoints,trainings,totalPointsEarned,totalPointsSpent});({level,xp,upgradePoints,trainings,totalPointsEarned}=completed);trainingProgress = 0; trainingActive = false; completedTraining = true; lastTrainingResult={...trainingSession,modelId:state.model.activeId,completedAt:Date.now(),completionPlaytimeMs:state.statistics.playTimeMs+deltaMs,actualDuration:(trainingSession?.activeElapsedMs??deltaMs)/1000,effectiveDuration:(trainingSession?.activeElapsedMs??deltaMs)/1000,computeInvested:trainingSession?.computeInvested??computeInvested,requiredCompute:required,startingLevel,resultingLevel:level,upgradePointsGained:1,availablePointsAfter:upgradePoints,totalPointsEarned};trainingSession=null; }
  }
  const patentRate = patentEnabled ? patentResearchPerSecond(state) : 0;
  let patentProgress = state.patents.progress + patentRate * seconds;
  let discoveredPatents = state.patents.discovered; let patentHistory = state.patents.history; let equippedPatents = state.patents.equipped; let patentDiscovery = null;
  const nextPatent = PATENTS[discoveredPatents.length];
  if (nextPatent && patentProgress >= patentResearchRequired(discoveredPatents.length)) { patentProgress -= patentResearchRequired(discoveredPatents.length); discoveredPatents = [...discoveredPatents, nextPatent.id]; patentHistory = [...patentHistory, { id: nextPatent.id, discoveredAt: Date.now(), cycle: state.meta.cycles }]; if (equippedPatents.length < state.patents.slots) equippedPatents = [...equippedPatents, nextPatent.id]; patentDiscovery = nextPatent; }
  const eventCountdown = state.world.activeEvent ? state.world.nextEventMs : featureUnlocked(state,'marketing') ? state.world.nextEventMs - deltaMs : state.world.nextEventMs;
  const event = featureUnlocked(state,'marketing') && !state.world.activeEvent && eventCountdown <= 0 ? WORLD_EVENTS[(state.meta.cycles + Math.floor(state.statistics.playTimeMs / 90_000)) % WORLD_EVENTS.length] : state.world.activeEvent;
  let next = {
    ...state,
    resources: { ...state.resources, credits: state.resources.credits + creditGain, compute: Math.max(0, state.resources.compute - storedTrainingUsed + (wasTrainingActive ? 0 : rawTrainingGain)), users, research: state.resources.research + researchGain, gems: state.resources.gems + (patentDiscovery && discoveredPatents.length % 10 === 0 ? 1 : 0) },
    model: { ...state.model, level, xp, quality: effectiveModelStat(state,activeModel(state),'quality'), upgradePoints, trainingProgress, trainingActive, trainingSession, lastTrainingResult, progress: { ...state.model.progress, [state.model.activeId]: { ...activeProgress(state), level, xp, upgradePoints, trainings, totalPointsEarned, totalPointsSpent } } },
    market: { ...state.market, reputation, adoption, demand: metrics.demand },
    statistics: { ...state.statistics, totalCreditsEarned: state.statistics.totalCreditsEarned + creditGain, totalComputeProduced: state.statistics.totalComputeProduced + produced, totalComputeConsumed: state.statistics.totalComputeConsumed + produced * (state.allocation.research + state.allocation.data + state.allocation.agents) / 100 + produced * state.allocation.inference / 100 * metrics.utilization + (wasTrainingActive ? rawTrainingGain : 0) + storedTrainingUsed, totalComputeWasted: state.statistics.totalComputeWasted + produced * state.allocation.inference / 100 * (1 - metrics.utilization), playTimeMs: state.statistics.playTimeMs + deltaMs },
    run: { ...state.run, creditsEarned: state.run.creditsEarned + creditGain, computeProduced: state.run.computeProduced + produced },
    session: { ...state.session, elapsedMs: state.session.elapsedMs + deltaMs },
    world: { ...state.world, activeEvent: event, nextEventMs: event ? Math.max(0, eventCountdown) : eventCountdown, modifiers: state.world.modifiers.filter((modifier) => modifier.expiresAt > state.statistics.playTimeMs) },
    patents: { ...state.patents, discovered: discoveredPatents, progress: patentProgress, history: patentHistory, equipped: equippedPatents },
    ui: { ...state.ui, patentDiscovery: patentDiscovery ?? state.ui.patentDiscovery },
  };
  if (completedTraining) next = { ...next, ui: { ...next.ui, toast: { message: `Training complete · Level ${level} · +1 Model Point · ${upgradePoints} available`, id: Date.now() } } };
  if (completedTraining && state.tutorial.step === 4) next = { ...next, tutorial: { ...state.tutorial, step: 5 } };
  next = applyAutomation(awardAchievements(next));
  if (Math.floor(state.statistics.playTimeMs / 60_000) !== Math.floor(next.statistics.playTimeMs / 60_000)) next = ensureMissions(next);
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
  return feedback({ ...state, resources: { ...state.resources, compute: state.resources.compute + gain }, statistics: { ...state.statistics, totalComputeProduced: state.statistics.totalComputeProduced + gain, totalManualComputeProduced: state.statistics.totalManualComputeProduced + gain, totalClicks: state.statistics.totalClicks + 1 }, run: { ...state.run, computeProduced: state.run.computeProduced + gain } }, `+${gain.toFixed(1)} Compute${state.model.trainingActive ? ' · queued for Training' : ''}`);
}

export function optimizeGain(state) {
  const rate = computePerSecond(state);
  const activeShare = 0.58 / (1 + Math.sqrt(rate / 350));
  return Math.max(0.5, Math.max(1.5 + state.model.level * 0.15, rate * activeShare) * Math.max(0.1, 1 + strategicBonus(state, 'click')));
}

export function trainModel(state) {
  if (state.model.trainingActive || computePerSecond(state) <= 0) return state;
  const required=trainingRequiredForState(state),rate=trainingRatePerSecond(state),multiplier=trainingMultiplier(state);
  const trainingSession={modelId:state.model.activeId,startedAt:Date.now(),startPlaytimeMs:state.statistics.playTimeMs,startingLevel:activeProgress(state).level,baseRequired:required,expectedDuration:required/Math.max(.0001,rate),activeElapsedMs:0,computeInvested:0,modifiers:{trainingMultiplier:multiplier,allocationEfficiency:1+strategicBonus(state,'allocationEfficiency'),allocation:state.allocation.training}};
  return feedback({ ...state, model: { ...state.model, trainingActive: true, trainingSession, lastTrainingResult:null } }, `${activeModel(state).name} training run started`);
}

export function patentResearchRequired(index) { const tier=Math.floor(index/10); return Math.floor(BALANCE.patents.baseRequirement * BALANCE.patents.discoveryGrowth ** index * BALANCE.patents.tierGrowth ** tier); }
function patentLevel(state, patentId) { return state.patents.levels[patentId] ?? 1; }
function patentLevelMultiplier(state, patentId) { return 1 + (patentLevel(state, patentId) - 1) * 0.5; }
export function patentUpgradeCost(state, patentId) { return Math.ceil(2 * patentLevel(state, patentId) ** 1.7); }
export function patentCurrentBonus(state, patentId) { const patent = PATENTS.find(({ id }) => id === patentId); return patent ? patent.value * patentLevelMultiplier(state, patentId) : 0; }
export function togglePatentEquipped(state, patentId) { if (!featureUnlocked(state,'patents') || !state.patents.discovered.includes(patentId)) return state; const alreadyEquipped = state.patents.equipped.includes(patentId); const swapping = !alreadyEquipped && state.patents.equipped.length >= state.patents.slots; const equipped = alreadyEquipped ? state.patents.equipped.filter((id) => id !== patentId) : swapping ? [...state.patents.equipped.slice(1), patentId] : [...state.patents.equipped, patentId]; return feedback({ ...state, patents: { ...state.patents, equipped } }, alreadyEquipped ? 'Patent unequipped' : swapping ? 'Patent loadout swapped' : 'Patent equipped'); }
export function upgradePatent(state, patentId) { if (!state.patents.discovered.includes(patentId)) return state; const cost = patentUpgradeCost(state, patentId); if (state.meta.intelligence < cost) return state; return feedback({ ...state, meta: { ...state.meta, intelligence: state.meta.intelligence - cost }, patents: { ...state.patents, levels: { ...state.patents.levels, [patentId]: patentLevel(state, patentId) + 1 }, intInvested: { ...state.patents.intInvested, [patentId]: (state.patents.intInvested[patentId] ?? 0) + cost } } }, `${PATENTS.find(({id}) => id === patentId).name} upgraded`); }
export const PATENT_SLOT_PRICES = { 4: 250, 5: 600, 6: 1_200, 7: 2_500, 8: 5_000 };
export function buyPatentSlot(state) { const nextSlot = state.patents.slots + 1, cost = PATENT_SLOT_PRICES[nextSlot]; if (!cost || state.resources.gems < cost) return state; return feedback({ ...state, resources: { ...state.resources, gems: state.resources.gems - cost }, patents: { ...state.patents, slots: nextSlot } }, `Patent Slot ${nextSlot} unlocked`); }
export function patentResearchPerSecond(state) { if (!featureUnlocked(state,'patents') || state.patents.discovered.length >= PATENTS.length) return 0; const allocated=computePerSecond(state)*state.allocation.research/100; const researchSkill=state.model.deployed.reduce((sum,id)=>{const model=MODEL_CATALOG.find(entry=>entry.id===id);return sum+(model?effectiveModelStat(state,model,'research')*.03:0)},0); const specialization=1+strategicBonus(state,'research')+deployedIdentityBonus(state,'research')+researchSkill; return allocated * BALANCE.patents.baseResearchRate * Math.max(.1,specialization); }

export function energyBuildingCost() { return Infinity; }
export function buyEnergyBuilding(state) { return state; }

export function modelImprovementCost(state, modelId, path) { const rank=state?.model?.progress?.[modelId]?.skills?.[path]??0; return BALANCE.training.pointCosts[rank]??Math.ceil((rank+1)/2); }
export function modelSkillEconomyPreview(state, modelId, path) { const progress=state.model.progress?.[modelId];if(!progress)return null;const next={...state,model:{...state.model,progress:{...state.model.progress,[modelId]:{...progress,skills:{...progress.skills,[path]:(progress.skills?.[path]??0)+1}}}}};const before=economySnapshot(state),after=economySnapshot(next);const metric={quality:'demand',popularity:'demand',efficiency:'capacity',latency:'capacity',enterprise:'revenuePerUser',research:'researchPerSecond',reasoning:'trainingCompute',coding:'trainingCompute',autonomy:'adoption'}[path]??'demand';return{metric,before:before[metric]??0,after:after[metric]??0}; }
export function improveModel(state, modelId, path) { if (!skillUnlocked(state,path) || !MODEL_SKILLS.includes(path) || !state.model.owned.includes(modelId)) return state; const progress=state.model.progress?.[modelId]??{level:1,xp:0,upgradePoints:0,trainings:0,totalPointsEarned:0,totalPointsSpent:0,skills:{}}; const cost=modelImprovementCost(state,modelId,path);if(progress.upgradePoints<cost)return state;const skills={...progress.skills,[path]:(progress.skills[path]??0)+1},nextProgress={...progress,upgradePoints:progress.upgradePoints-cost,totalPointsEarned:progress.totalPointsEarned??progress.upgradePoints+(progress.totalPointsSpent??0),totalPointsSpent:(progress.totalPointsSpent??0)+cost,skills};const improvements={...state.model.improvements,[modelId]:skills};const active=modelId===state.model.activeId;return feedback({...state,model:{...state.model,upgradePoints:active?nextProgress.upgradePoints:state.model.upgradePoints,quality:active?effectiveModelStat({...state,model:{...state.model,progress:{...state.model.progress,[modelId]:nextProgress}}},MODEL_CATALOG.find(model=>model.id===modelId),'quality'):state.model.quality,progress:{...state.model.progress,[modelId]:nextProgress},improvements}},`${MODEL_CATALOG.find(({id})=>id===modelId).name} ${path} specialized`)}

export function acquireModel(state, modelId) {const model=MODEL_CATALOG.find(({id})=>id===modelId),index=MODEL_CATALOG.findIndex(({id})=>id===modelId);if(!model||(model.unlockTech&&!state.meta.techNodes.includes(model.unlockTech))||index>0&&!state.model.owned.includes(MODEL_CATALOG[index-1].id))return state;if(state.model.owned.includes(modelId)){const progress=state.model.progress?.[modelId]??{level:1,xp:0,upgradePoints:0,trainings:0,totalPointsEarned:0,totalPointsSpent:0,skills:{}};return{...state,model:{...state.model,activeId:modelId,trainingTarget:modelId,level:progress.level,xp:progress.xp,upgradePoints:progress.upgradePoints,quality:effectiveModelStat(state,model,'quality')}}}const progress={level:1,xp:0,upgradePoints:0,trainings:0,totalPointsEarned:0,totalPointsSpent:0,skills:{}};return feedback({...state,meta:{...state.meta,unlockedModels:[...new Set([...(state.meta.unlockedModels??state.model.owned),modelId])]},model:{...state.model,activeId:modelId,trainingTarget:modelId,level:1,xp:0,upgradePoints:0,quality:model.stats.quality,owned:[...state.model.owned,modelId],progress:{...state.model.progress,[modelId]:progress}}},`${model.name} permanently unlocked`)}

export function toggleModelDeployment(state, modelId) { if (!state.model.owned.includes(modelId)) return state; const deployed = state.model.deployed.includes(modelId) ? state.model.deployed.filter((id) => id !== modelId) : [...state.model.deployed, modelId]; if (!deployed.length || deployed.length > 3) return state; return { ...state, model: { ...state.model, deployed } }; }

export function setAllocation(state, category, value) {
  if (!(category in state.allocation)) return state;
  if (!featureUnlocked(state, 'allocation') && ['research', 'data', 'agents'].includes(category)) return state;
  if (!featureUnlocked(state, 'agents') && category === 'agents') return state;
  const requested = Math.max(0, Math.min(100, Number(value)));
  const others = Object.keys(state.allocation).filter((key) => key !== category);
  const remaining = 100 - requested;
  const otherTotal = others.reduce((sum, key) => sum + state.allocation[key], 0);
  const allocation = { ...state.allocation, [category]: requested };
  others.forEach((key, index) => { allocation[key] = index === others.length - 1 ? 100 - Object.entries(allocation).filter(([name]) => name !== key).reduce((sum, [, amount]) => sum + amount, 0) : otherTotal ? Math.round(state.allocation[key] / otherTotal * remaining) : Math.round(remaining / others.length); });
  return { ...state, allocation };
}

export function setPrice(state, value) { if (!featureUnlocked(state,'marketing')) return state; return { ...state, market: { ...state.market, priceMultiplier: Math.max(0.5, Math.min(3, Number(value))) } }; }
export function buyMarketing(state) { if (!featureUnlocked(state,'marketing')) return state; const cost = 100 * (state.market.marketing + 1) ** 1.6; if(state.resources.credits<cost)return state;const paid=spendCredits(state,cost);return feedback({ ...paid, market: { ...paid.market, marketing: paid.market.marketing + 1 } }, 'Marketing reach increased'); }

export function canBuyUpgrade(state, upgrade) { const balance = upgrade.category === 'research' ? state.resources.research : state.resources.credits; const unlocked = upgrade.category === 'hardware' ? state.hardware[upgrade.hardwareId] >= upgrade.unlock : state.model.level >= upgrade.unlock; return !state.upgrades.includes(upgrade.id) && unlocked && balance >= upgrade.cost; }
export function buyUpgrade(state, upgradeId) { const upgrade = UPGRADES.find(({ id }) => id === upgradeId); if (!upgrade || !canBuyUpgrade(state, upgrade)) return state; const paid=upgrade.category==='research'?{...state,resources:{...state.resources,research:state.resources.research-upgrade.cost}}:spendCredits(state,upgrade.cost);return feedback({ ...paid, upgrades: [...paid.upgrades, upgradeId] }, `${upgrade.name} installed`); }

export function objectiveProgress(state, objective) {
  const metric = objective.metric ?? objective.type;
  const progress = Object.values(state.model.progress ?? {});
  const value = metric.startsWith('hardware:') ? state.hardware[metric.slice(9)] ?? 0 : {
    hardware: state.hardware.calculator, level: Math.max(state.model.level, ...progress.map((item) => item.level ?? 1)), users: state.resources.users,
    gamingPc: state.hardware.gamingPc, workstation: state.hardware.workstation, computeRate: computePerSecond(state),
    totalCompute: state.statistics.totalComputeProduced, creditsEarned: state.statistics.totalCreditsEarned,
    trainings: progress.reduce((sum, item) => sum + (item.trainings ?? 0), 0),
    pointsSpent: progress.reduce((sum, item) => sum + (item.totalPointsSpent ?? 0), 0),
    marketing: state.market.marketing, research: state.resources.research, patents: state.patents.discovered.length,
    cycles: state.meta.cycles, tech: state.meta.techNodes.length,
  }[metric] ?? 0;
  return Math.min(objective.target, value);
}
export function claimObjective(state, objectiveId) { const objective = OBJECTIVES.find(({ id }) => id === objectiveId); if (!objective || state.objectives[objectiveId] || objectiveProgress(state, objective) < objective.target) return state; const rewarded=grantCredits(state,objective.reward);return feedback({ ...rewarded, objectives: { ...rewarded.objectives, [objectiveId]: true } }, `Objective complete · +${objective.reward} Credits`); }

export function advanceTutorial(state) { const step = state.tutorial.step; if ([0, 3].includes(step)) return { ...state, tutorial: { ...state.tutorial, step: step + 1 }, ui: { ...state.ui, activeView: step === 0 ? 'hardware' : 'model' } }; if (step === 8) return { ...state, tutorial: { ...state.tutorial, step: 9 } }; if (step === 9) return { ...state, tutorial: { step: 10, completed: true } }; return state; }

function achievementMetric(state, metric) {
  const hardware = Object.values(state.hardware).reduce((sum, quantity) => sum + quantity, 0);
  return { totalCreditsEarned: state.statistics.totalCreditsEarned, totalComputeProduced: state.statistics.totalComputeProduced, totalClicks: state.statistics.totalClicks, users: state.resources.users, quality: state.model.quality, hardware, level: state.model.level, research: state.resources.research, reputation: state.market.reputation, cycles: state.meta.cycles }[metric];
}

function awardAchievements(state) {
  if (!featureUnlocked(state, 'account')) return state;
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

export function cycleIntelligence(state) { const tier=HARDWARE_CATALOG.reduce((highest,item)=>state.hardware[item.id]>0?Math.max(highest,item.tier):highest,0); const highestModel=Math.max(state.model.level??1,...Object.values(state.model.progress??{}).map(progress=>progress.level??1)); if(tier<BALANCE.intelligence.minimumHardwareTier||highestModel<BALANCE.intelligence.minimumModelLevel)return 0; const compute=Math.max(1,state.run.computeProduced/BALANCE.intelligence.computeScale); const credits=Math.max(1,state.run.creditsEarned/250_000); const breadth=1+tier*.28+Math.log2(1+highestModel)*.18; return Math.max(0,Math.floor((compute**BALANCE.intelligence.exponent)*(credits**.12)*breadth*BALANCE.intelligence.breakthroughMultiplier**(state.meta.breakthroughs??0))-3); }
export function developmentCyclePreview(state){const gain=cycleIntelligence(state),before=state.meta.totalIntelligence??0,after=before+gain;return{gain,lifetimeBefore:before,lifetimeAfter:after,incomeBonusBefore:before*.1,incomeBonusAfter:after*.1,newSystems:(state.meta.cycles??0)===0?['Market','Compute Allocation']:[]};}
export function canDevelop(state) { return cycleIntelligence(state) >= BALANCE.intelligence.cycleRequirement; }
export function startDevelopmentCycle(state) {
  if (!canDevelop(state)) return state;
  const intelligence = cycleIntelligence(state); const fresh = createDefaultState();
  const intelligenceMultiplier = 1 + strategicBonus(state, 'intelligenceGain') + deployedIdentityBonus(state,'intelligence');
  const unlocked=state.meta.unlockedModels??state.model.owned;const progress=Object.fromEntries(unlocked.map(id=>[id,{level:1,xp:0,upgradePoints:0,trainings:0,totalPointsEarned:0,totalPointsSpent:0,skills:{}}]));const tinyProgress=progress.tinyChat??fresh.model.progress.tinyChat;const gained=Math.floor(intelligence*intelligenceMultiplier),total=state.meta.totalIntelligence+gained;const featureUnlockTimes={...(state.meta.featureUnlockTimes??{})};for(const feature of FEATURE_UNLOCKS)if(feature.int<=total&&featureUnlockTimes[feature.id]===undefined)featureUnlockTimes[feature.id]=state.statistics.playTimeMs;if((state.meta.cycles??0)===0){featureUnlockTimes.marketing??=state.statistics.playTimeMs;featureUnlockTimes.allocation??=state.statistics.playTimeMs;}return feedback({ ...fresh, resources: { ...fresh.resources, gems: state.resources.gems }, objectives: state.objectives, settings: state.settings, session: { ...fresh.session, elapsedMs: state.session.elapsedMs }, run: { ...fresh.run, number: (state.run.number??state.meta.cycles+1)+1, startedAtSessionMs: state.session.elapsedMs }, statistics: state.statistics, meta: { ...state.meta, unlockedModels:unlocked, intelligence: state.meta.intelligence + gained, totalIntelligence: total, cycles: state.meta.cycles + 1, featureUnlockTimes, cycleHistory:[...(state.meta.cycleHistory??[]),{at:state.statistics.playTimeMs,duration:state.session.elapsedMs,compute:state.run.computeProduced,intelligence:gained}] }, model:{...fresh.model,level:tinyProgress.level,xp:tinyProgress.xp,upgradePoints:tinyProgress.upgradePoints,owned:unlocked,deployed:['tinyChat'],progress}, patents: state.patents, premium: state.premium, retention: state.retention, inventory:state.inventory, consumables:state.consumables, rewardCaches:state.rewardCaches, missions:state.missions, gemEconomy:state.gemEconomy, rewardedBoosts:state.rewardedBoosts, artifacts:state.artifacts, marketplace:state.marketplace, futureMeta:state.futureMeta, balanceRun:state.balanceRun, tutorial: { step: 10, completed: true } }, `Development Cycle complete · +${gained} INT · Market and Allocation unlocked`);
}
export function breakthroughReward(state){if(!canBreakthrough(state))return 0;return Math.max(1,Math.floor((state.statistics.totalComputeProduced/BALANCE.breakthrough.requiredCompute)**BALANCE.breakthrough.exponent));}
export function canBreakthrough(state){return state.meta.totalIntelligence>=BALANCE.breakthrough.requiredLifetimeIntelligence&&state.statistics.totalComputeProduced>=BALANCE.breakthrough.requiredCompute;}
export function startBreakthrough(state){if(!canBreakthrough(state))return state;const reward=breakthroughReward(state),fresh=createDefaultState();return feedback({...fresh,profile:state.profile,resources:{...fresh.resources,gems:state.resources.gems},settings:state.settings,statistics:state.statistics,retention:state.retention,premium:state.premium,inventory:state.inventory,consumables:state.consumables,rewardCaches:state.rewardCaches,missions:state.missions,gemEconomy:state.gemEconomy,rewardedBoosts:state.rewardedBoosts,artifacts:state.artifacts,marketplace:state.marketplace,futureMeta:state.futureMeta,balanceRun:state.balanceRun,meta:{...fresh.meta,achievements:state.meta.achievements,breakthroughs:(state.meta.breakthroughs??0)+reward,breakthroughCurrency:(state.meta.breakthroughCurrency??0)+reward},tutorial:{step:10,completed:true}},`Breakthrough complete · +${reward} Insight`)}
export function buyTechNode(state, nodeId) {
  if(SYSTEM_TECH_NODES.some((node)=>node.id===nodeId))return purchaseSystemTech(state,nodeId);
  const node = TECH_NODES.find(({ id }) => id === nodeId); if (!node || state.meta.techNodes.includes(nodeId) || state.meta.intelligence < node.cost || (node.requires && !state.meta.techNodes.includes(node.requires))) return state;
  return feedback({ ...state, meta: { ...state.meta, intelligence: state.meta.intelligence - node.cost, techNodes: [...state.meta.techNodes, nodeId] } }, `${node.name} permanently unlocked`);
}
export function resolveWorldEvent(state, choiceIndex) {
  const event = state.world.activeEvent; const choice = event?.choices[choiceIndex]; if (!choice || (choice.cost && state.resources.credits < choice.cost)) return state;
  const modifier = { effect: choice.effect, value: choice.value, expiresAt: state.statistics.playTimeMs + BALANCE.events.durationMs };
  const reputationPenalty = choice.penalty === 'reputation' ? -0.15 : 0;
  let next=choice.cost?spendCredits(state,choice.cost):state;if(choice.credits)next=grantCredits(next,choice.credits);return feedback({ ...next, market: { ...next.market, reputation: Math.max(0.25, next.market.reputation + reputationPenalty) }, world: { activeEvent: null, nextEventMs: BALANCE.events.minimumDelayMs + (next.statistics.totalClicks % 600) * 1_000, modifiers: [...next.world.modifiers, modifier] } }, `${event.title}: ${choice.label}`);
}

export function companyStage(state) { const tier = HARDWARE_CATALOG.reduce((highest, hardware) => state.hardware[hardware.id] ? Math.max(highest, hardware.tier) : highest, 0); return ['Garage Developer', 'Startup', 'AI Company', 'Tech Giant', 'Global AI Infrastructure', 'Planetary Compute Network', 'Interplanetary AI', 'Technological Singularity'][Math.min(7, Math.floor(tier / 2))]; }
export function dismissPatentDiscovery(state) { return { ...state, ui: { ...state.ui, patentDiscovery: null } }; }

export function buyGemShopItem(state, itemId) { const item = GEM_SHOP_ITEMS.find(({id}) => id === itemId); if (!featureUnlocked(state,'account') || !item || state.premium.purchases.includes(itemId) || state.resources.gems < item.cost) return state; return feedback({ ...state, resources: { ...state.resources, gems: state.resources.gems - item.cost }, premium: { ...state.premium, purchases: [...state.premium.purchases, itemId] } }, `${item.name} added to your account`); }

function dateKey(date = new Date()) { return date.toISOString().slice(0,10); }
export function claimLoginReward(state) { const today = dateKey(); if (state.retention.lastLoginDate === today) return state; const yesterday = dateKey(new Date(Date.now() - 86400000)); const streak = state.retention.lastLoginDate === yesterday ? state.retention.loginStreak + 1 : 1; const gems = streak % 7 === 0 ? 3 : 1; return feedback({ ...state, resources: { ...state.resources, gems: state.resources.gems + gems }, retention: { ...state.retention, lastLoginDate: today, loginStreak: streak } }, `Day ${streak} login · +${gems} Gem${gems > 1 ? 's' : ''}`); }
