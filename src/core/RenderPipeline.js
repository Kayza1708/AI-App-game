export class RenderPipeline {
  #animationFrame = null;
  #pendingState = null;
  #render;

  constructor(render) {
    this.#render = render;
  }

  request(state) {
    this.#pendingState = state;
    if (this.#animationFrame !== null) return;
    this.#animationFrame = requestAnimationFrame(() => {
      this.#animationFrame = null;
      this.#render(this.#pendingState);
    });
  }

  destroy() {
    if (this.#animationFrame !== null) cancelAnimationFrame(this.#animationFrame);
    this.#animationFrame = null;
  }
}
