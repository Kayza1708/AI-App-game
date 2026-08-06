export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', eyebrow: 'System' },
  { id: 'operations', label: 'Operations', eyebrow: 'Foundation' },
  { id: 'intelligence', label: 'Intelligence', eyebrow: 'Locked' },
  { id: 'trajectory', label: 'Trajectory', eyebrow: 'Locked' },
];

export function isKnownView(viewId) {
  return NAV_ITEMS.some(({ id }) => id === viewId);
}
