import { HARDWARE_CATALOG } from '../data/defaultState.js';

const COST_GROWTH = 1.17;

export function hardwareCost(item, quantity) {
  return Math.ceil(item.baseCost * COST_GROWTH ** quantity);
}

export function computePerSecond(state) {
  return HARDWARE_CATALOG.reduce((total, item) => total + item.computePerSecond * state.hardware[item.id], 0);
}

export function revenuePerUser(state) {
  return 0.08 + (state.model.level - 1) * 0.008;
}

export function targetUsers(state) {
  return Math.max(1, Math.floor(8 * state.model.quality ** 1.72));
}

export function xpRequired(level) {
  return Math.floor(20 * level ** 1.42);
}

export function trainingRequired(level) {
  return Math.floor(18 * level ** 1.48);
}

export function tickGame(state, deltaMs) {
  const seconds = deltaMs / 1000;
  const computeGain = computePerSecond(state) * seconds;
  const creditGain = state.resources.users * revenuePerUser(state) * seconds;
  const desiredUsers = targetUsers(state);
  const userStep = Math.max(0.25 * seconds, Math.abs(desiredUsers - state.resources.users) * 0.08 * seconds);
  const users = desiredUsers > state.resources.users
    ? Math.min(desiredUsers, state.resources.users + userStep)
    : Math.max(desiredUsers, state.resources.users - userStep);
  return {
    ...state,
    resources: { credits: state.resources.credits + creditGain, compute: state.resources.compute + computeGain, users },
    statistics: {
      ...state.statistics,
      totalCreditsEarned: state.statistics.totalCreditsEarned + creditGain,
      totalComputeProduced: state.statistics.totalComputeProduced + computeGain,
      playTimeMs: state.statistics.playTimeMs + deltaMs,
    },
    session: { ...state.session, elapsedMs: state.session.elapsedMs + deltaMs },
  };
}

export function buyHardware(state, itemId) {
  const item = HARDWARE_CATALOG.find(({ id }) => id === itemId);
  if (!item) return state;
  const cost = hardwareCost(item, state.hardware[itemId]);
  if (state.resources.credits < cost) return state;
  return {
    ...state,
    resources: { ...state.resources, credits: state.resources.credits - cost },
    hardware: { ...state.hardware, [itemId]: state.hardware[itemId] + 1 },
  };
}

export function optimizeCode(state) {
  const gain = 1 + state.model.level * 0.35;
  return {
    ...state,
    resources: { ...state.resources, compute: state.resources.compute + gain },
    statistics: { ...state.statistics, totalComputeProduced: state.statistics.totalComputeProduced + gain, totalClicks: state.statistics.totalClicks + 1 },
  };
}

export function trainModel(state) {
  const required = trainingRequired(state.model.level);
  const needed = required - state.model.trainingProgress;
  const invested = Math.min(state.resources.compute, needed);
  if (invested <= 0) return state;
  let level = state.model.level;
  let xp = state.model.xp;
  let quality = state.model.quality;
  let trainingProgress = state.model.trainingProgress + invested;
  if (trainingProgress >= required) {
    trainingProgress = 0;
    xp += required;
    quality += 0.22 + level * 0.035;
    while (xp >= xpRequired(level)) {
      xp -= xpRequired(level);
      level += 1;
      quality += 0.18;
    }
  }
  return { ...state, resources: { ...state.resources, compute: state.resources.compute - invested }, model: { level, xp, quality, trainingProgress } };
}
