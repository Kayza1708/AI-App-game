export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', eyebrow: 'Command' },
  { id: 'hardware', label: 'Hardware', eyebrow: 'Infrastructure' },
  { id: 'model', label: 'AI Model', eyebrow: 'Training' },
  { id: 'company', label: 'Company', eyebrow: 'Growth' },
  { id: 'statistics', label: 'Statistics', eyebrow: 'Telemetry' },
  { id: 'allocation', label: 'Allocation', eyebrow: 'Compute' },
  { id: 'market', label: 'Market', eyebrow: 'Economy' },
  { id: 'objectives', label: 'Objectives', eyebrow: 'Missions' },
];

export function isKnownView(viewId) {
  return NAV_ITEMS.some(({ id }) => id === viewId);
}
