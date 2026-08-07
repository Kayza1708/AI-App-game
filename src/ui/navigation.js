export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', eyebrow: 'Command' },
  { id: 'hardware', label: 'Hardware', eyebrow: 'Infrastructure' },
  { id: 'model', label: 'AI Model', eyebrow: 'Training' },
  { id: 'company', label: 'Company', eyebrow: 'Growth' },
  { id: 'statistics', label: 'Statistics', eyebrow: 'Telemetry' },
  { id: 'allocation', label: 'Allocation', eyebrow: 'Compute' },
  { id: 'market', label: 'Market', eyebrow: 'Economy' },
  { id: 'objectives', label: 'Objectives', eyebrow: 'Missions' },
  { id: 'strategy', label: 'Tech Tree', eyebrow: 'Intelligence' },
  { id: 'achievements', label: 'Achievements', eyebrow: 'Legacy' },
  { id: 'patents', label: 'Patents', eyebrow: 'Permanent' },
  { id: 'energy', label: 'Energy', eyebrow: 'Infrastructure' },
  { id: 'gemshop', label: 'Gem Shop', eyebrow: 'Convenience' },
  { id: 'missions', label: 'Missions', eyebrow: 'Daily' },
];
export const DEVELOPER_NAV_ITEM = { id: 'developer', label: 'Developer Analytics', eyebrow: 'Internal' };

export function isKnownView(viewId, includeDeveloper = false) {
  return NAV_ITEMS.some(({ id }) => id === viewId) || (includeDeveloper && viewId === DEVELOPER_NAV_ITEM.id);
}
