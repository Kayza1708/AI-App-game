import { BALANCE } from '../config/balance.js';
import { HARDWARE_CATALOG } from '../data/defaultState.js';

export const HARDWARE_UPGRADE_TRACKS = Object.freeze([
  { id: 'processor', name: 'Processor', effect: 'hardwareOutput', valuePerLevel: 0.12, description: 'Raises this generation’s effective Compute output.' },
  { id: 'memory', name: 'Memory', effect: 'training', valuePerLevel: 0.08, description: 'Raises effective Training Compute while this generation is owned.' },
  { id: 'optimization', name: 'Optimization', effect: 'inference', valuePerLevel: 0.08, description: 'Raises Inference capacity while this generation is owned.' },
]);

export function hardwareUpgradeLevel(state, hardwareId, trackId) { return state.hardwareUpgradeLevels?.[hardwareId]?.[trackId] ?? 0; }
export function hardwareUpgradeCost(state, hardwareId, trackId) {
  const hardware = HARDWARE_CATALOG.find((item) => item.id === hardwareId);
  const track = HARDWARE_UPGRADE_TRACKS.find((item) => item.id === trackId);
  if (!hardware || !track) return Infinity;
  return Math.ceil(hardware.baseCost * BALANCE.hardware.upgradeCostFactor * BALANCE.hardware.upgradeCostGrowth ** hardwareUpgradeLevel(state, hardwareId, trackId));
}
export function hardwareTrackBonus(state, effect, hardwareId = null) {
  return HARDWARE_CATALOG.reduce((sum, hardware) => {
    if (hardwareId && hardware.id !== hardwareId) return sum;
    if ((state.hardware[hardware.id] ?? 0) <= 0) return sum;
    return sum + HARDWARE_UPGRADE_TRACKS.filter((track) => track.effect === effect).reduce((trackSum, track) => trackSum + hardwareUpgradeLevel(state, hardware.id, track.id) * track.valuePerLevel, 0);
  }, 0);
}
export function buyHardwareUpgrade(state, hardwareId, trackId) {
  const track = HARDWARE_UPGRADE_TRACKS.find((item) => item.id === trackId);
  const hardware = HARDWARE_CATALOG.find((item) => item.id === hardwareId);
  const cost = hardwareUpgradeCost(state, hardwareId, trackId);
  if (!track || !hardware || !state.hardware[hardwareId] || state.resources.credits < cost) return state;
  const level = hardwareUpgradeLevel(state, hardwareId, trackId) + 1;
  return {
    ...state,
    resources: { ...state.resources, credits: state.resources.credits - cost },
    statistics: { ...state.statistics, totalCreditsSpent: state.statistics.totalCreditsSpent + cost },
    hardwareUpgradeLevels: { ...state.hardwareUpgradeLevels, [hardwareId]: { ...state.hardwareUpgradeLevels[hardwareId], [trackId]: level } },
    ui: { ...state.ui, toast: { id: Date.now(), message: `${hardware.name} ${track.name} · Level ${level}` } },
  };
}
