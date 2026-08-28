const MAX_FRAME_DELTA_MS = 250;

export class GameLoop {
  #animationFrame = null;
  #lastTimestamp = 0;
  #onTick;
  #onError;
  #running = false;

  constructor(onTick, onError = null) {
    this.#onTick = onTick;
    this.#onError = onError;
  }

  start() {
    if (this.#running) return;
    this.#running = true;
    this.#lastTimestamp = performance.now();
    this.#animationFrame = requestAnimationFrame(this.#frame);
  }

  stop() {
    this.#running = false;
    if (this.#animationFrame !== null) cancelAnimationFrame(this.#animationFrame);
    this.#animationFrame = null;
  }

  #frame = (timestamp) => {
    if (!this.#running) return;
    const deltaMs = Math.min(timestamp - this.#lastTimestamp, MAX_FRAME_DELTA_MS);
    this.#lastTimestamp = timestamp;
    try {
      this.#onTick(deltaMs);
    } catch (error) {
      this.stop();
      this.#onError?.(error);
      return;
    }
    this.#animationFrame = requestAnimationFrame(this.#frame);
  };
}
