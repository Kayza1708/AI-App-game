export class StateStore {
  #eventBus;
  #state;
  #normalize;

  constructor(initialState, eventBus, normalize = (state) => state) {
    this.#normalize = normalize;
    this.#state = structuredClone(this.#normalize(initialState));
    this.#eventBus = eventBus;
  }

  getState() {
    return this.#state;
  }

  update(updater, source = 'unknown') {
    const nextState = updater(this.#state);
    if (!nextState || nextState === this.#state) return;
    this.#state = this.#normalize(nextState);
    this.#eventBus.emit('state:changed', { source, state: this.#state });
  }

  replace(nextState, source = 'restore') {
    this.#state = structuredClone(this.#normalize(nextState));
    this.#eventBus.emit('state:changed', { source, state: this.#state });
  }
}
