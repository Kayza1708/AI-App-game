export const SAVE_VERSION = 1;

export function createDefaultState() {
  return {
    version: SAVE_VERSION,
    profile: { companyName: 'Unnamed Intelligence Lab', createdAt: Date.now() },
    session: { elapsedMs: 0, lastSavedAt: null },
    ui: { activeView: 'overview', sidebarOpen: false },
  };
}
