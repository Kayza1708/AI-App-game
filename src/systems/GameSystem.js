import { HARDWARE_CATALOG, MODEL_CATALOG, OBJECTIVES, UPGRADES } from '../data/defaultState.js';

const COST_GROWTH = 1.17;

export function hardwareCost(item, quantity) { return Math.ceil(item.baseCost * COST_GROWTH ** quantity); }

function upgradeBonus(state, effect, hardwareId = null) {
  return UPGRADES.filter((upgrade) => state.upgrades.includes(upgrade.id) && upgrade.effect === effect && (!upgrade.hardwareId || upgrade.hardwareId === hardwareId)).reduce((total, upgrade) => total + upgrade.value, 0);
}

function milestoneBonus(state, effect, item = null) {
  return HARDWARE_CATALOG.reduce((total, hardware) => total + hardware.milestones.filter((milestone) => state.hardware[hardware.id] >= milestone.quantity && milestone.effect === effect && (!item || hardware.id === item.id)).reduce((sum, milestone) => sum + milestone.value, 0), 0);
}

export function effectiveHardwareCost(state, item) {
  const discount = Math.min(0.5, upgradeBonus(state, 'hardwareCost', item.id) + milestoneBonus(state, 'hardwareDiscount'));
  return Math.ceil(hardwareCost(item, state.hardware[item.id]) * (1 - discount));
}

export function computePerSecond(state) {
  const globalMultiplier = 1 + upgradeBonus(state, 'allOutput') + upgradeBonus(state, 'hardwareOutput');
  return HARDWARE_CATALOG.reduce((total, item) => total + item.computePerSecond * state.hardware[item.id] * (1 + milestoneBonus(state, 'hardwareOutput', item) + upgradeBonus(state, 'hardwareOutput', item.id)), 0) * globalMultiplier;
}

export function energyUse(state) { return HARDWARE_CATALOG.reduce((total, item) => total + item.energy * state.hardware[item.id], 0); }
export function activeModel(state) { return MODEL_CATALOG.find(({ id }) => id === state.model.activeId) ?? MODEL_CATALOG[0]; }
export function revenuePerUser(state) { return 0.24 * state.market.priceMultiplier * (1 + upgradeBonus(state, 'revenue') + milestoneBonus(state, 'revenue')); }
export function xpRequired(level) { return Math.floor(16 * level ** 1.4); }
export function trainingRequired(level) { return Math.floor(12 * level ** 1.46); }

export function marketMetrics(state) {
  const model = activeModel(state);
  const highestTier = HARDWARE_CATALOG.reduce((tier, item) => state.hardware[item.id] > 0 ? Math.max(tier, item.tier) : tier, 0);
  const unlockedMarketSize = (30 + state.model.level * 18) * 2.15 ** highestTier * (1 + upgradeBonus(state, 'marketSize'));
  const appeal = (model.stats.appeal + upgradeBonus(state, 'appeal') * 10) * (1 + state.model.quality * (0.2 + upgradeBonus(state, 'quality')));
  const priceResistance = 1 / state.market.priceMultiplier ** 1.35;
  const marketingPower = 1 + state.market.marketing * (0.12 + upgradeBonus(state, 'marketing'));
  const reputationPower = Math.max(1, state.market.reputation * (1 + upgradeBonus(state, 'reputation')));
  const adoptionPower = 1 + Math.sqrt(state.market.adoption) * (0.08 + upgradeBonus(state, 'adoption'));
  const capacity = computePerSecond(state) * state.allocation.inference / 100 * model.stats.efficiency * 1.45 * (1 + upgradeBonus(state, 'inference'));
  const organicDemand = unlockedMarketSize * appeal * 0.14 * marketingPower * reputationPower * adoptionPower * priceResistance * (1 + upgradeBonus(state, 'demand') + milestoneBonus(state, 'demand'));
  const distributionFloor = capacity * Math.min(0.22, 0.1 + highestTier * 0.006);
  const demand = Math.max(organicDemand, distributionFloor);
  const target = Math.floor(Math.min(demand, capacity));
  const utilization = capacity > 0 ? Math.min(1, demand / capacity) : 0;
  return { demand, capacity, target, utilization, unlockedMarketSize, bottleneck: demand < capacity ? 'DEMAND LIMITED' : 'CAPACITY LIMITED', revenue: state.resources.users * revenuePerUser(state) };
}

export function userGrowthPerSecond(state) { const target = marketMetrics(state).target; return (target - state.resources.users) * 0.18; }

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
  const trainingGain = produced * state.allocation.training / 100;
  const researchGain = produced * state.allocation.research / 100;
  const dataGain = produced * state.allocation.data / 100;
  const agentGain = produced * state.allocation.agents / 100;
  const metrics = marketMetrics(state);
  const userStep = Math.max(0.2 * seconds, Math.abs(metrics.target - state.resources.users) * 0.18 * seconds);
  const users = metrics.target > state.resources.users ? Math.min(metrics.target, state.resources.users + userStep) : Math.max(metrics.target, state.resources.users - userStep);
  const creditGain = users * revenuePerUser(state) * seconds;
  const reputation = Math.min(10, state.market.reputation + dataGain * 0.00004);
  const adoption = Math.min(100, state.market.adoption + agentGain * 0.0002 + users * seconds * 0.00004);
  const next = {
    ...state,
    resources: { ...state.resources, credits: state.resources.credits + creditGain, compute: state.resources.compute + trainingGain, users, research: state.resources.research + researchGain },
    market: { ...state.market, reputation, adoption, demand: metrics.demand },
    statistics: { ...state.statistics, totalCreditsEarned: state.statistics.totalCreditsEarned + creditGain, totalComputeProduced: state.statistics.totalComputeProduced + produced, playTimeMs: state.statistics.playTimeMs + deltaMs },
    session: { ...state.session, elapsedMs: state.session.elapsedMs + deltaMs },
  };
  return tutorialAfterTick(next);
}

function feedback(state, message) { return { ...state, ui: { ...state.ui, toast: { message, id: Date.now() } } }; }

export function buyHardware(state, itemId) {
  const item = HARDWARE_CATALOG.find(({ id }) => id === itemId);
  if (!item) return state;
  const cost = effectiveHardwareCost(state, item);
  if (state.resources.credits < cost) return state;
  let next = { ...state, resources: { ...state.resources, credits: state.resources.credits - cost }, hardware: { ...state.hardware, [itemId]: state.hardware[itemId] + 1 } };
  if (state.tutorial.step === 1 && itemId === 'calculator') next = { ...next, tutorial: { ...state.tutorial, step: 2 } };
  if (state.tutorial.step === 7 && itemId !== 'calculator') next = { ...next, tutorial: { ...state.tutorial, step: 8 } };
  return feedback(next, `${item.name} online · +${item.computePerSecond} Compute/s`);
}

export function optimizeCode(state) {
  const gain = optimizeGain(state);
  return feedback({ ...state, resources: { ...state.resources, compute: state.resources.compute + gain }, statistics: { ...state.statistics, totalComputeProduced: state.statistics.totalComputeProduced + gain, totalClicks: state.statistics.totalClicks + 1 } }, `Code optimized · +${gain.toFixed(1)} Compute`);
}

export function optimizeGain(state) {
  const rate = computePerSecond(state);
  const activeShare = 0.58 / (1 + Math.sqrt(rate / 350));
  return Math.max(1.5 + state.model.level * 0.15, rate * activeShare);
}

export function trainModel(state) {
  const required = trainingRequired(state.model.level);
  const invested = Math.min(state.resources.compute, required - state.model.trainingProgress);
  if (invested <= 0) return state;
  let { level, xp, quality, trainingProgress } = state.model;
  trainingProgress += invested * (1 + upgradeBonus(state, 'training'));
  if (trainingProgress >= required) {
    trainingProgress = 0; xp += required; quality += 0.3 + activeModel(state).stats.quality * 0.025;
    while (xp >= xpRequired(level)) { xp -= xpRequired(level); level += 1; quality += 0.2; }
  }
  let next = { ...state, resources: { ...state.resources, compute: state.resources.compute - invested }, model: { ...state.model, level, xp, quality, trainingProgress } };
  if (state.tutorial.step === 4 && trainingProgress === 0) next = { ...next, tutorial: { ...state.tutorial, step: 5 } };
  return feedback(next, trainingProgress === 0 ? 'Training complete · Model improved' : `${invested.toFixed(1)} Compute invested`);
}

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
export function buyMarketing(state) { const cost = 100 * (state.market.marketing + 1) ** 1.6; return state.resources.credits < cost ? state : feedback({ ...state, resources: { ...state.resources, credits: state.resources.credits - cost }, market: { ...state.market, marketing: state.market.marketing + 1 } }, 'Marketing reach increased'); }

export function acquireModel(state, modelId) {
  const model = MODEL_CATALOG.find(({ id }) => id === modelId); if (!model) return state;
  if (state.model.owned.includes(modelId)) return { ...state, model: { ...state.model, activeId: modelId } };
  if (state.model.level < model.unlockLevel || state.resources.credits < model.cost) return state;
  return feedback({ ...state, resources: { ...state.resources, credits: state.resources.credits - model.cost }, model: { ...state.model, activeId: modelId, owned: [...state.model.owned, modelId], quality: state.model.quality + model.stats.quality * 0.25 } }, `${model.name} deployed`);
}

export function canBuyUpgrade(state, upgrade) { const balance = upgrade.category === 'research' ? state.resources.research : state.resources.credits; const unlocked = upgrade.category === 'hardware' ? state.hardware[upgrade.hardwareId] >= upgrade.unlock : state.model.level >= upgrade.unlock; return !state.upgrades.includes(upgrade.id) && unlocked && balance >= upgrade.cost; }
export function buyUpgrade(state, upgradeId) { const upgrade = UPGRADES.find(({ id }) => id === upgradeId); if (!upgrade || !canBuyUpgrade(state, upgrade)) return state; const currency = upgrade.category === 'research' ? 'research' : 'credits'; return feedback({ ...state, resources: { ...state.resources, [currency]: state.resources[currency] - upgrade.cost }, upgrades: [...state.upgrades, upgradeId] }, `${upgrade.name} installed`); }

export function objectiveProgress(state, objective) { const values = { hardware: state.hardware.calculator, level: state.model.level, users: state.resources.users, gamingPc: state.hardware.gamingPc, computeRate: computePerSecond(state) }; return Math.min(objective.target, values[objective.type]); }
export function claimObjective(state, objectiveId) { const objective = OBJECTIVES.find(({ id }) => id === objectiveId); if (!objective || state.objectives[objectiveId] || objectiveProgress(state, objective) < objective.target) return state; return feedback({ ...state, resources: { ...state.resources, credits: state.resources.credits + objective.reward }, objectives: { ...state.objectives, [objectiveId]: true } }, `Objective complete · +${objective.reward} Credits`); }

export function advanceTutorial(state) { const step = state.tutorial.step; if ([0, 3].includes(step)) return { ...state, tutorial: { ...state.tutorial, step: step + 1 }, ui: { ...state.ui, activeView: step === 0 ? 'hardware' : 'model' } }; if (step === 8) return { ...state, tutorial: { ...state.tutorial, step: 9 } }; if (step === 9) return { ...state, tutorial: { step: 10, completed: true } }; return state; }
