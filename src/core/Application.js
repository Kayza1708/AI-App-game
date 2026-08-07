import { createDefaultState, WORLD_EVENTS } from '../data/defaultState.js';
import { isDeveloperMode, TelemetryService } from '../dev/telemetry-service.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { AppShell } from '../ui/AppShell.js';
import { EventBus } from './EventBus.js';
import { GameLoop } from './GameLoop.js';
import { RenderPipeline } from './RenderPipeline.js';
import { StateStore } from './StateStore.js';
import { acquireModel, advanceTutorial, buyEnergyBuilding, buyGemShopItem, buyHardware, buyMarketing, buyTechNode, buyUpgrade, claimLoginReward, claimObjective, claimRetentionMission, claimRewardedAd, dismissPatentDiscovery, improveModel, optimizeCode, patentResearchRequired, resolveWorldEvent, setAllocation, setPrice, startDevelopmentCycle, tickGame, toggleModelDeployment, trainModel, trainingRequiredForState } from '../systems/GameSystem.js';

export class Application {
  #eventBus = new EventBus();
  #gameLoop;
  #renderPipeline;
  #saveSystem;
  #shell;
  #store;
  #unsubscribers = [];
  #started = false;
  #devMode;
  #telemetry;

  constructor(root) {
    this.#devMode = isDeveloperMode();
    this.#telemetry = this.#devMode ? new TelemetryService() : null;
    this.#store = new StateStore(createDefaultState(), this.#eventBus);
    this.#saveSystem = new SaveSystem(this.#store);
    this.#shell = new AppShell(root, this.#eventBus, { devMode: this.#devMode, telemetry: this.#telemetry });
    this.#renderPipeline = new RenderPipeline((state) => this.#shell.render(state));
    this.#gameLoop = new GameLoop((deltaMs) => this.#tick(deltaMs));
  }

  start() {
    if (this.#started) return;
    this.#started = true;
    const save = this.#saveSystem.load();
    if (save) this.#store.replace(save, 'load');
    this.#telemetryCall(() => {
      this.#telemetry?.start(this.#store.getState());
      this.#telemetry?.record({ category: 'session', type: save ? 'save-loaded' : 'save-created', source: 'save', label: save ? 'Save loaded' : 'New save created' }, this.#store.getState());
    });
    this.#bindEvents();
    this.#shell.mount(this.#store.getState());
    this.#gameLoop.start();
    this.#saveSystem.startAutosave();
    window.addEventListener('beforeunload', this.#handleUnload);
    document.addEventListener('visibilitychange', this.#handleVisibility);
  }

  stop() {
    if (!this.#started) return;
    this.#started = false;
    this.#saveSystem.save();
    this.#telemetryCall(() => this.#telemetry?.end(this.#store.getState()));
    this.#saveSystem.stopAutosave();
    this.#gameLoop.stop();
    this.#renderPipeline.destroy();
    this.#unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.#unsubscribers = [];
    this.#eventBus.clear();
    window.removeEventListener('beforeunload', this.#handleUnload);
    document.removeEventListener('visibilitychange', this.#handleVisibility);
  }

  #bindEvents() {
    this.#unsubscribers.push(
      this.#eventBus.on('state:changed', ({ source, state }) => {
        this.#telemetryCall(() => this.#telemetry?.observe(this.#telemetry.lastState ?? state, state, source));
        this.#renderPipeline.request(state);
      }),
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
      this.#eventBus.on('developer:cheat', (payload) => this.#applyDeveloperCheat(payload)),
      this.#eventBus.on('developer:opened', () => this.#telemetryCall(() => this.#telemetry?.record({ category: 'ui', type: 'developer-dashboard-opened', source: 'developer', label: 'Developer Analytics opened' }, this.#store.getState()))),
      this.#eventBus.on('developer:tooltip', (label) => this.#telemetryCall(() => this.#telemetry?.record({ category: 'ui', type: 'tooltip-opened', source: 'tooltip', label }, this.#store.getState()))),
    );
  }

  #tick(deltaMs) {
    this.#telemetryCall(() => this.#telemetry?.flushClickBurst(this.#store.getState()));
    this.#store.update((state) => tickGame(state, deltaMs * (this.#telemetry?.timeScale ?? 1)), 'game-loop');
  }

  #handleUnload = () => this.stop();
  #handleVisibility = () => this.#telemetryCall(() => document.hidden ? this.#telemetry?.pause(this.#store.getState()) : this.#telemetry?.resume(this.#store.getState()));

  #telemetryCall(callback) {
    try { return callback(); } catch (error) { globalThis.console?.error('Developer telemetry failed; gameplay will continue.', error); return null; }
  }

  #applyDeveloperCheat({ type, eventId, value }) {
    if (!this.#devMode) return;
    this.#telemetry.markCheat(type, this.#store.getState(), { eventId });
    this.#store.update((state) => {
      if (type === 'credits') return { ...state, resources: { ...state.resources, credits: state.resources.credits + 1_000_000 } };
      if (type === 'compute') return { ...state, resources: { ...state.resources, compute: state.resources.compute + 100_000 } };
      if (type === 'research') return { ...state, resources: { ...state.resources, research: state.resources.research + 100_000 } };
      if (type === 'gems') return { ...state, resources: { ...state.resources, gems: state.resources.gems + 100 } };
      if (type === 'intelligence') return { ...state, meta: { ...state.meta, intelligence: state.meta.intelligence + 100 } };
      if (type === 'set-model-level') return { ...state, model: { ...state.model, level: Math.max(1, Math.floor(value || 1)) } };
      if (type === 'complete-training') return { ...state, model: { ...state.model, trainingActive: true, trainingProgress: trainingRequiredForState(state) - 0.001 } };
      if (type === 'advance-patent') return { ...state, patents: { ...state.patents, progress: patentResearchRequired(state.patents.discovered.length) - 0.001 } };
      if (type === 'low-energy') return { ...state, hardware: { ...state.hardware, gpuServer: state.hardware.gpuServer + 100 }, energy: { ...state.energy, buildings: Object.fromEntries(Object.keys(state.energy.buildings).map((id) => [id, 0])) } };
      if (type === 'trigger-event') return { ...state, world: { ...state.world, activeEvent: WORLD_EVENTS.find(({ id }) => id === eventId) ?? WORLD_EVENTS[0] } };
      if (type === 'cycle-eligible') return { ...state, model: { ...state.model, level: Math.max(5, state.model.level) } };
      if (type === 'reset-run') { const fresh = createDefaultState(); return { ...fresh, resources: { ...fresh.resources, gems: state.resources.gems }, meta: state.meta, patents: state.patents, premium: state.premium, retention: state.retention, settings: state.settings, tutorial: { step: 10, completed: true } }; }
      return state;
    }, 'developer-cheat');
  }
}
