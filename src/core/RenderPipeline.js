export class RenderPipeline {
  #animationFrame = null;
  #pendingState = null;
  #pendingReason = null;
  #render;
  #onError;

  constructor(render, onError = null) {
    this.#render = render;
    this.#onError = onError;
  }

  request(state, reason = 'state-update') {
    this.#pendingState = state;
    this.#pendingReason = reason;
    if (this.#animationFrame !== null) return;
    this.#animationFrame = requestAnimationFrame(() => {
      this.#animationFrame = null;
      try {
        this.#render(this.#pendingState, { reason: this.#pendingReason });
      } catch (error) {
        this.#onError?.(error);
      }
    });
  }

  destroy() {
    if (this.#animationFrame !== null) cancelAnimationFrame(this.#animationFrame);
    this.#animationFrame = null;
  }
}
