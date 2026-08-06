import { CURRENT_SAVE_VERSION, createInitialState } from '../data/createInitialState.js';

const STORAGE_KEY = 'ai-singularity-save';

function isValidSave(candidate) {
  return candidate?.version === CURRENT_SAVE_VERSION
    && typeof candidate.meta?.createdAt === 'number'
    && typeof candidate.meta?.totalRuntimeMs === 'number';
}

export class SaveSystem {
  load() {
    const serializedState = localStorage.getItem(STORAGE_KEY);

    if (!serializedState) {
      return createInitialState();
    }

    try {
      const savedState = JSON.parse(serializedState);
      return isValidSave(savedState) ? savedState : createInitialState();
    } catch {
      return createInitialState();
    }
  }

  save(state) {
    state.meta.lastSavedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
