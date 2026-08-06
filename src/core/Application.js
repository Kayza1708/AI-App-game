import { createDefaultState } from '../data/defaultState.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AppShell } from '../ui/AppShell.js';
import { EventBus } from './EventBus.js';
import { GameLoop } from './GameLoop.js';
import { RenderPipeline } from './RenderPipeline.js';
import { StateStore } from './StateStore.js';
import { buyHardware, optimizeCode, tickGame, trainModel } from '../systems/GameSystem.js';

export class Application {
  #eventBus = new EventBus();
  #gameLoop;
  #renderPipeline;
  #saveSystem;
  #shell;
  #store;
  #unsubscribers = [];
  #started = false;

  constructor(root) {
    this.#store = new StateStore(createDefaultState(), this.#eventBus);
    this.#saveSystem = new SaveSystem(this.#store);
    this.#shell = new AppShell(root, this.#eventBus);
    this.#renderPipeline = new RenderPipeline((state) => this.#shell.render(state));
    this.#gameLoop = new GameLoop((deltaMs) => this.#tick(deltaMs));
  }

  start() {
    if (this.#started) return;
    this.#started = true;
    const save = this.#saveSystem.load();
    if (save) this.#store.replace(save, 'load');
    this.#bindEvents();
    this.#shell.mount(this.#store.getState());
    this.#gameLoop.start();
    this.#saveSystem.startAutosave();
    window.addEventListener('beforeunload', this.#handleUnload);
  }

  stop() {
    if (!this.#started) return;
    this.#started = false;
    this.#saveSystem.save();
    this.#saveSystem.stopAutosave();
    this.#gameLoop.stop();
    this.#renderPipeline.destroy();
    this.#unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.#unsubscribers = [];
    this.#eventBus.clear();
    window.removeEventListener('beforeunload', this.#handleUnload);
  }

  #bindEvents() {
    this.#unsubscribers.push(
      this.#eventBus.on('state:changed', ({ state }) => this.#renderPipeline.request(state)),
      this.#eventBus.on('navigation:selected', (viewId) => {
        this.#store.update((state) => ({
          ...state,
          ui: { ...state.ui, activeView: viewId, sidebarOpen: false },
        }), 'navigation');
      }),
      this.#eventBus.on('navigation:toggled', () => {
        this.#store.update((state) => ({
          ...state,
          ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
        }), 'navigation');
      }),
      this.#eventBus.on('hardware:buy', (itemId) => this.#store.update((state) => buyHardware(state, itemId), 'hardware')),
      this.#eventBus.on('model:train', () => this.#store.update(trainModel, 'training')),
      this.#eventBus.on('compute:optimize', () => this.#store.update(optimizeCode, 'manual')),
    );
  }

  #tick(deltaMs) {
    this.#store.update((state) => tickGame(state, deltaMs), 'game-loop');
  }

  #handleUnload = () => this.stop();
}
