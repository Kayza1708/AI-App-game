const MAX_FRAME_DELTA_MS = 250;

export class GameLoop {
  #animationFrame = null;
  #lastTimestamp = 0;
  #onTick;
  #running = false;

  constructor(onTick) {
    this.#onTick = onTick;
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
    this.#onTick(deltaMs);
    this.#animationFrame = requestAnimationFrame(this.#frame);
  };
}
