import { viewUnlocked } from '../config/balance.js';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', eyebrow: 'Command' },
  { id: 'hardware', label: 'Hardware', eyebrow: 'Infrastructure' },
  { id: 'model', label: 'AI Model', eyebrow: 'Training' },
  { id: 'inventory', label: 'Inventory', eyebrow: 'Model Builds' },
  { id: 'company', label: 'Company', eyebrow: 'Growth' },
  { id: 'statistics', label: 'Statistics', eyebrow: 'Telemetry' },
  { id: 'allocation', label: 'Allocation', eyebrow: 'Compute' },
  { id: 'research', label: 'Research', eyebrow: 'Science' },
  { id: 'market', label: 'Market', eyebrow: 'Economy' },
  { id: 'objectives', label: 'Objectives', eyebrow: 'Missions' },
  { id: 'strategy', label: 'Tech Tree', eyebrow: 'Intelligence' },
  { id: 'achievements', label: 'Achievements', eyebrow: 'Legacy' },
  { id: 'patents', label: 'Patents', eyebrow: 'Permanent' },
  { id: 'gemshop', label: 'Gem Shop', eyebrow: 'Convenience' },
  { id: 'missions', label: 'Missions', eyebrow: 'Daily' },
];
export const DEVELOPER_NAV_ITEM = { id: 'developer', label: 'Developer Analytics', eyebrow: 'Internal' };
export const RUNTIME_NAV_ITEM = { id: 'runtime', label: 'Runtime Inspector', eyebrow: 'Stability' };
export const DEVELOPER_NAV_ITEMS = Object.freeze([DEVELOPER_NAV_ITEM, RUNTIME_NAV_ITEM]);

export function isKnownView(viewId, includeDeveloper = false) {
  return NAV_ITEMS.some(({ id }) => id === viewId) || (includeDeveloper && DEVELOPER_NAV_ITEMS.some(({ id }) => id === viewId));
}

export function navigationItemsForState(state, { includeDeveloper = false, developmentAvailable = false } = {}) {
  const items = NAV_ITEMS.filter((item) => viewUnlocked(state, item.id) || (item.id === 'strategy' && developmentAvailable));
  // Developer tools deliberately bypass every gameplay feature and Technology gate.
  return includeDeveloper ? [...items, ...DEVELOPER_NAV_ITEMS] : items;
}
