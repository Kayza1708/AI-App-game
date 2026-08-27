export class RenderPipeline {
  #animationFrame = null;
  #pendingState = null;
  #render;
  #onError;

  constructor(render, onError = null) {
    this.#render = render;
    this.#onError = onError;
  }

  request(state) {
    this.#pendingState = state;
    if (this.#animationFrame !== null) return;
    this.#animationFrame = requestAnimationFrame(() => {
      this.#animationFrame = null;
      try {
        this.#render(this.#pendingState);
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
