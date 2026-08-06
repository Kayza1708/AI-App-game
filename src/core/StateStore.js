export class StateStore {
  #eventBus;
  #state;

  constructor(initialState, eventBus) {
    this.#state = structuredClone(initialState);
    this.#eventBus = eventBus;
  }

  getState() {
    return this.#state;
  }

  update(updater, source = 'unknown') {
    const nextState = updater(this.#state);
    if (!nextState || nextState === this.#state) return;
    this.#state = nextState;
    this.#eventBus.emit('state:changed', { source, state: this.#state });
  }

  replace(nextState, source = 'restore') {
    this.#state = structuredClone(nextState);
    this.#eventBus.emit('state:changed', { source, state: this.#state });
  }
}
