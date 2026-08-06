import { AUTO_SAVE_INTERVAL_MS, GAME_TICK_MS, MAX_FRAME_DELTA_MS } from './constants.js';

export class Game {
  constructor({ state, saveSystem, renderer }) {
    this.state = state;
    this.saveSystem = saveSystem;
    this.renderer = renderer;
    this.accumulatorMs = 0;
    this.autoSaveElapsedMs = 0;
    this.lastFrameTime = 0;
    this.animationFrameId = null;
    this.isRunning = false;
    this.frame = this.frame.bind(this);
    this.handlePageExit = this.handlePageExit.bind(this);
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.renderer.mount(this.state);
    window.addEventListener('pagehide', this.handlePageExit);
    this.animationFrameId = requestAnimationFrame(this.frame);
  }

  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('pagehide', this.handlePageExit);
    this.saveSystem.save(this.state);
  }

  frame(currentTime) {
    if (!this.isRunning) return;

    const frameDeltaMs = Math.min(currentTime - this.lastFrameTime, MAX_FRAME_DELTA_MS);
    this.lastFrameTime = currentTime;
    this.accumulatorMs += frameDeltaMs;

    while (this.accumulatorMs >= GAME_TICK_MS) {
      this.update(GAME_TICK_MS);
      this.accumulatorMs -= GAME_TICK_MS;
    }

    this.renderer.render(this.state);
    this.animationFrameId = requestAnimationFrame(this.frame);
  }

  update(deltaMs) {
    this.state.meta.totalRuntimeMs += deltaMs;
    this.autoSaveElapsedMs += deltaMs;

    if (this.autoSaveElapsedMs >= AUTO_SAVE_INTERVAL_MS) {
      this.saveSystem.save(this.state);
      this.autoSaveElapsedMs = 0;
    }
  }

  handlePageExit() {
    this.saveSystem.save(this.state);
  }
}
