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
export function hardwareTrackBonus() { return 0; }
export function buyHardwareUpgrade(state) { return state; }
