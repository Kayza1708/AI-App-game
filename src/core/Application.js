import { createDefaultState } from '../data/defaultState.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AppShell } from '../ui/AppShell.js';
import { EventBus } from './EventBus.js';
import { GameLoop } from './GameLoop.js';
import { RenderPipeline } from './RenderPipeline.js';
import { StateStore } from './StateStore.js';
import { acquireModel, advanceTutorial, buyEnergyBuilding, buyGemShopItem, buyHardware, buyMarketing, buyTechNode, buyUpgrade, claimLoginReward, claimObjective, claimRetentionMission, claimRewardedAd, dismissPatentDiscovery, improveModel, optimizeCode, resolveWorldEvent, setAllocation, setPrice, startDevelopmentCycle, tickGame, toggleModelDeployment, trainModel } from '../systems/GameSystem.js';

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
      this.#eventBus.on('allocation:set', ({ category, value }) => this.#store.update((state) => setAllocation(state, category, value), 'allocation')),
      this.#eventBus.on('market:price', (value) => this.#store.update((state) => setPrice(state, value), 'market')),
      this.#eventBus.on('market:marketing', () => this.#store.update(buyMarketing, 'market')),
      this.#eventBus.on('model:acquire', (modelId) => this.#store.update((state) => acquireModel(state, modelId), 'model')),
      this.#eventBus.on('upgrade:buy', (upgradeId) => this.#store.update((state) => buyUpgrade(state, upgradeId), 'upgrade')),
      this.#eventBus.on('objective:claim', (objectiveId) => this.#store.update((state) => claimObjective(state, objectiveId), 'objective')),
      this.#eventBus.on('tutorial:advance', () => this.#store.update(advanceTutorial, 'tutorial')),
      this.#eventBus.on('tech:buy', (nodeId) => this.#store.update((state) => buyTechNode(state, nodeId), 'tech')),
      this.#eventBus.on('cycle:start', () => this.#store.update(startDevelopmentCycle, 'development-cycle')),
      this.#eventBus.on('world:resolve', (choiceIndex) => this.#store.update((state) => resolveWorldEvent(state, choiceIndex), 'world-event')),
      this.#eventBus.on('energy:buy', (buildingId) => this.#store.update((state) => buyEnergyBuilding(state, buildingId), 'energy')),
      this.#eventBus.on('premium:buy', (itemId) => this.#store.update((state) => buyGemShopItem(state, itemId), 'premium')),
      this.#eventBus.on('premium:ad', (reward) => this.#store.update((state) => claimRewardedAd(state, reward), 'rewarded-ad')),
      this.#eventBus.on('model:improve', ({ modelId, path }) => this.#store.update((state) => improveModel(state, modelId, path), 'model')),
      this.#eventBus.on('model:deploy', (modelId) => this.#store.update((state) => toggleModelDeployment(state, modelId), 'model')),
      this.#eventBus.on('retention:login', () => this.#store.update(claimLoginReward, 'retention')),
      this.#eventBus.on('retention:claim', (missionId) => this.#store.update((state) => claimRetentionMission(state, missionId), 'retention')),
      this.#eventBus.on('patent:dismiss', () => this.#store.update(dismissPatentDiscovery, 'patent')),
    );
  }

  #tick(deltaMs) {
    this.#store.update((state) => tickGame(state, deltaMs), 'game-loop');
  }

  #handleUnload = () => this.stop();
}
