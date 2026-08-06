import { createDefaultState, SAVE_VERSION } from '../data/defaultState.js';

const STORAGE_KEY = 'ai-singularity-save';
const SAVE_INTERVAL_MS = 15_000;

export class SaveSystem {
  #intervalId = null;
  #store;

  constructor(store) {
    this.#store = store;
  }

  load() {
    try {
      const serializedSave = localStorage.getItem(STORAGE_KEY);
      if (!serializedSave) return null;
      const save = JSON.parse(serializedSave);
      return this.#isValid(save) ? this.#mergeWithDefaults(save) : null;
    } catch {
      return null;
    }
  }

  save() {
    const state = this.#store.getState();
    const nextState = {
      ...state,
      session: { ...state.session, lastSavedAt: Date.now() },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    this.#store.replace(nextState, 'save');
  }

  startAutosave() {
    if (this.#intervalId === null) {
      this.#intervalId = window.setInterval(() => this.save(), SAVE_INTERVAL_MS);
    }
  }

  stopAutosave() {
    if (this.#intervalId !== null) window.clearInterval(this.#intervalId);
    this.#intervalId = null;
  }

  #isValid(save) {
    return save?.version === SAVE_VERSION && typeof save.resources?.credits === 'number' && typeof save.model?.level === 'number';
  }

  #mergeWithDefaults(save) {
    const defaults = createDefaultState();
    return {
      ...defaults, ...save,
      profile: { ...defaults.profile, ...save.profile }, resources: { ...defaults.resources, ...save.resources },
      hardware: { ...defaults.hardware, ...save.hardware }, model: { ...defaults.model, ...save.model },
      allocation: { ...defaults.allocation, ...save.allocation }, market: { ...defaults.market, ...save.market },
      tutorial: { ...defaults.tutorial, ...save.tutorial }, objectives: { ...defaults.objectives, ...save.objectives },
      settings: { ...defaults.settings, ...save.settings }, statistics: { ...defaults.statistics, ...save.statistics },
      session: { ...defaults.session, ...save.session }, ui: { ...defaults.ui, ...save.ui },
    };
  }
}
