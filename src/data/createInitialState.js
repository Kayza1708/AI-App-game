export const CURRENT_SAVE_VERSION = 1;

export function createInitialState(now = Date.now()) {
  return {
    version: CURRENT_SAVE_VERSION,
    meta: {
      createdAt: now,
      lastSavedAt: null,
      totalRuntimeMs: 0,
    },
  };
}
