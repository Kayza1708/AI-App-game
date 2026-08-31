import { cloneState } from './clone.js';

export class StateStore {
  #eventBus;
  #state;
  #normalize;

  constructor(initialState, eventBus, normalize = (state) => state) {
    this.#normalize = normalize;
    this.#state = cloneState(this.#normalize(initialState));
    this.#eventBus = eventBus;
  }

  getState() {
    return this.#state;
  }

  update(updater, source = 'unknown') {
    const previousState = this.#state;
    const nextState = updater(previousState);
    if (!nextState || nextState === this.#state) return;
    this.#state = this.#normalize(nextState);
    this.#eventBus.emit('state:changed', { source, previousState, state: this.#state });
  }

  replace(nextState, source = 'restore') {
    const previousState = this.#state;
    this.#state = cloneState(this.#normalize(nextState));
    this.#eventBus.emit('state:changed', { source, previousState, state: this.#state });
  }
}
