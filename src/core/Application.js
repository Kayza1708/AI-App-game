import { createDefaultState, WORLD_EVENTS } from '../data/defaultState.js';
import { BALANCE, skillUnlocked } from '../config/balance.js';
import { isDeveloperMode, TelemetryService } from '../dev/telemetry-service.js';
import { DeveloperResetService } from '../dev/developer-reset-service.js';
import { SaveSystem } from '../systems/PersistentSaveSystem.js';
import { AppShell } from '../ui/AppShell.js';
import { EventBus } from './EventBus.js';
import { GameLoop } from './GameLoop.js';
import { RenderPipeline } from './RenderPipeline.js';
import { StateStore } from './StateStore.js';
import { ensureGameState, validateGameState } from './GameStateContract.js';
import { captureRuntimeException } from './RuntimeDiagnostics.js';
import { acceptWorldEventConsequences, acquireModel, advanceTutorial, buyTrainingDoublePoints, finishTrainingWithGems, reconcileTutorial, skipTutorial, buyGemShopItem, buyHardware, buyHardwareBulk, buyMarketing, buyPatentSlot, buyUpgrade, claimLoginReward, claimObjective, dismissPatentDiscovery, economySnapshot, modelAvailablePoints, modelImprovementCost, optimizeCode, patentResearchRequired, resolveWorldEvent, setAllocation, setPrice, startBreakthrough, startDevelopmentCycle, tickGame, toggleModelDeployment, togglePatentEquipped, trainModel, technologyPurchaseEligibility, trainingRequiredForState, upgradeModelSkill, purchaseTechnology, upgradePatent } from '../systems/GameSystem.js';
import { acquireItem, buyGemConvenience, equipItem, openCache, toggleItemFavorite, unequipItem, useConsumable } from '../systems/InventorySystem.js';
import { claimMission, ensureMissions } from '../systems/MissionSystem.js';
import { activateGemBoost, RewardedBoostService } from '../systems/RewardedBoostService.js';
import { reconcileOffline } from '../systems/OfflineProgressSystem.js';
import { dismissReward } from '../systems/RewardQueue.js';
import { earnGems } from '../systems/GemSystem.js';

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
  #developerReset;
  #freshDeveloperReset = false;
  #onRuntimeError;
  #rewardedBoosts = new RewardedBoostService();

  constructor(root, { onRuntimeError = null } = {}) {
    this.#onRuntimeError = onRuntimeError;
    this.#devMode = isDeveloperMode();
    // Recording is a runtime responsibility. Gating it behind Developer Mode
    // produced empty exports for real human sessions; only its dashboard is gated.
    this.#telemetry = new TelemetryService();
    this.#developerReset = this.#devMode ? new DeveloperResetService() : null;
    this.#freshDeveloperReset = this.#developerReset?.consumeFreshResetMarker() ?? false;
    const normalizeState = (candidate) => {
      if (this.#devMode) validateGameState(candidate);
      const normalized = reconcileTutorial(ensureGameState(candidate));
      if (this.#devMode) validateGameState(normalized, economySnapshot(normalized));
      return normalized;
    };
    this.#store = new StateStore(createDefaultState(), this.#eventBus, normalizeState);
    this.#saveSystem = new SaveSystem(this.#store);
    this.#shell = new AppShell(root, this.#eventBus, { devMode: this.#devMode, telemetry: this.#telemetry });
    this.#renderPipeline = new RenderPipeline((state, context) => this.#shell.render(state, context), (error) => this.#handleRuntimeError(error));
    this.#gameLoop = new GameLoop((deltaMs) => this.#tick(deltaMs), (error) => this.#handleRuntimeError(error));
  }

  start() {
    if (this.#started) return;
    this.#started = true;
    const save = this.#saveSystem.load();
    if (save) this.#store.replace(save, 'load');
    this.#syncHashNavigation();
    const requestedBalanceRun=new URLSearchParams(globalThis.location?.search??'').get('balanceRun');if(requestedBalanceRun)this.#store.update((state)=>({...state,balanceRun:{id:requestedBalanceRun,startedAt:Date.now(),natural:true}}),'balance-run-start');
    if (save) this.#store.update((state) => reconcileOffline(state), 'offline-progress');
    this.#store.update((state) => ensureMissions(state), 'mission-period');
    if (this.#devMode) validateGameState(this.#store.getState(), economySnapshot(this.#store.getState()));
    this.#telemetryCall(() => {
      this.#telemetry?.start(this.#store.getState(), { silent: this.#freshDeveloperReset });
      if (!this.#freshDeveloperReset) this.#telemetry?.record({ category: 'session', type: save ? 'save-loaded' : 'save-created', source: 'save', label: save ? 'Save loaded' : 'New save created' }, this.#store.getState());
      const offline=this.#store.getState().offline.results;if(offline?.effectiveDurationMs)this.#telemetry?.record({category:'retention',type:'offline-progress-applied',source:'offline',label:'Offline progress applied',meaningful:true,metadata:offline},this.#store.getState());if(offline?.effectiveDurationMs)this.#telemetry?.record({category:'retention',type:'welcome-back-shown',source:'offline',label:'Welcome Back shown',popup:true,metadata:{durationMs:offline.durationMs}},this.#store.getState());
    });
    this.#bindEvents();
    try {
      this.#shell.mount(this.#store.getState());
    } catch (error) {
      this.#shell.unmount();
      this.#unsubscribers.forEach((unsubscribe) => unsubscribe());
      this.#unsubscribers = [];
      this.#eventBus.clear();
      this.#started = false;
      throw error;
    }
    this.#gameLoop.start();
    this.#saveSystem.startAutosave();
    window.addEventListener('beforeunload', this.#handleUnload);
    window.addEventListener('hashchange', this.#handleHashChange);
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
    this.#shell.unmount();
    this.#unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.#unsubscribers = [];
    this.#eventBus.clear();
    window.removeEventListener('beforeunload', this.#handleUnload);
    window.removeEventListener('hashchange', this.#handleHashChange);
    document.removeEventListener('visibilitychange', this.#handleVisibility);
  }

  #bindEvents() {
    this.#unsubscribers.push(
      this.#eventBus.on('state:changed', ({ source, previousState, state }) => {
        this.#telemetryCall(() => this.#telemetry?.observe(previousState, state, source));
        this.#renderPipeline.request(state, source);
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
      this.#eventBus.on('hardware:buy', (payload) => this.#store.update((state) => typeof payload==='string'?buyHardware(state,payload):buyHardwareBulk(state,payload.itemId,payload.mode,payload.mode==='max'?'MAX':`x${payload.mode}`), 'hardware')),
      this.#eventBus.on('model:train', () => this.#store.update(trainModel, 'training')),
      this.#eventBus.on('model:finish-training', () => this.#store.update(finishTrainingWithGems, 'training-gem-finish')),
      this.#eventBus.on('model:double-points', () => this.#store.update(buyTrainingDoublePoints, 'training-gem-double')),
      this.#eventBus.on('compute:optimize', () => this.#store.update(optimizeCode, 'manual')),
      this.#eventBus.on('allocation:set', ({ category, value }) => this.#store.update((state) => setAllocation(state, category, value), 'allocation')),
      this.#eventBus.on('market:price', (value) => this.#store.update((state) => setPrice(state, value), 'market')),
      this.#eventBus.on('market:marketing', () => this.#store.update(buyMarketing, 'market')),
      this.#eventBus.on('model:acquire', (modelId) => this.#store.update((state) => acquireModel(state, modelId), 'model')),
      this.#eventBus.on('upgrade:buy', (upgradeId) => this.#store.update((state) => buyUpgrade(state, upgradeId), 'upgrade')),
      this.#eventBus.on('objective:claim', (objectiveId) => this.#store.update((state) => claimObjective(state, objectiveId), 'objective')),
      this.#eventBus.on('tutorial:advance', () => this.#store.update(advanceTutorial, 'tutorial')),
      this.#eventBus.on('tutorial:skip', () => this.#store.update(skipTutorial, 'tutorial-skip')),
      this.#eventBus.on('tech:select',({nodeId,diagnostic={}})=>this.#store.update((state)=>{const eligibility=technologyPurchaseEligibility(state,nodeId),valid=Boolean(eligibility.node);return{...state,ui:{...state.ui,selectedTechnologyId:valid?nodeId:state.ui.selectedTechnologyId,lastTechInteraction:{...diagnostic,selectedNodeId:nodeId,availableINT:state.meta.intelligence,cost:eligibility.node?.cost??null,prerequisitesMet:eligibility.prerequisitesMet,affordable:eligibility.affordable,purchaseHandlerReached:false,purchaseSucceeded:false,stateUpdated:valid,newSelectedNodeId:valid?nodeId:state.ui.selectedTechnologyId,detailPanelUpdated:valid,failureReason:valid?eligibility.failureReason:'UNKNOWN_NODE'}}}},'tech-selection')),
      this.#eventBus.on('tech:buy', (nodeId) => this.#store.update((state) => {const eligibility=technologyPurchaseEligibility(state,nodeId),next=purchaseTechnology(state,nodeId),succeeded=next!==state;return{...next,ui:{...next.ui,selectedTechnologyId:nodeId,lastTechInteraction:{selectedNodeId:nodeId,availableINT:state.meta.intelligence,cost:eligibility.node?.cost??null,prerequisitesMet:eligibility.prerequisitesMet,affordable:eligibility.affordable,purchaseHandlerReached:true,purchaseSucceeded:succeeded,failureReason:succeeded?null:eligibility.failureReason}}}}, 'tech')),
      this.#eventBus.on('cycle:start', () => this.#store.update(startDevelopmentCycle, 'development-cycle')),
      this.#eventBus.on('breakthrough:start', () => this.#store.update(startBreakthrough, 'breakthrough')),
      this.#eventBus.on('world:fallback', () => this.#store.update(acceptWorldEventConsequences, 'world-event')),
      this.#eventBus.on('world:resolve', (choiceIndex) => this.#store.update((state) => resolveWorldEvent(state, choiceIndex), 'world-event')),
      this.#eventBus.on('premium:buy', (itemId) => this.#store.update((state) => buyGemShopItem(state, itemId), 'premium')),
      this.#eventBus.on('premium:ad', (reward) => this.#store.update((state) => this.#rewardedBoosts.activate(state, reward), 'rewarded-ad')),
      this.#eventBus.on('boost:activate', (boostId) => this.#store.update((state) => activateGemBoost(state, boostId), 'gem-boost')),
      this.#eventBus.on('model:improve', ({ modelId, skillId, interaction = {} }) => this.#store.update((state) => {const progress=state.model.progress?.[modelId],pointCost=modelImprovementCost(state,modelId,skillId),availablePoints=modelAvailablePoints(progress),validationPassed=Boolean(progress&&state.model.owned.includes(modelId)&&skillUnlocked(state,skillId)&&availablePoints>=pointCost),next=upgradeModelSkill(state,modelId,skillId),stateUpdated=next!==state,log={...interaction,modelId,skillId,availablePoints,pointCost,handlerReached:true,validationPassed,purchaseFunctionReached:true,stateUpdated,failureReason:stateUpdated?null:interaction.failureReason??(!progress?'MODEL_NOT_FOUND':!state.model.owned.includes(modelId)?'MODEL_NOT_OWNED':!skillUnlocked(state,skillId)?'SKILL_LOCKED':availablePoints<pointCost?'INSUFFICIENT_POINTS':'TRANSACTION_REJECTED')};if(this.#devMode)globalThis.console?.debug('MODEL SKILL CLICK',log);return stateUpdated?{...next,ui:{...next.ui,lastModelSkillInteraction:log}}:state}, 'model-skill')),
      this.#eventBus.on('model:deploy', (modelId) => this.#store.update((state) => toggleModelDeployment(state, modelId), 'model')),
      this.#eventBus.on('retention:login', () => this.#store.update(claimLoginReward, 'retention')),
      this.#eventBus.on('retention:claim', (missionId) => this.#store.update((state) => claimMission(state, missionId), 'mission')),
      this.#eventBus.on('item:equip', ({instanceId,modelId}) => this.#store.update((state)=>equipItem(state,instanceId,modelId),'item-equipped')),
      this.#eventBus.on('item:unequip', ({modelId,slotType}) => this.#store.update((state)=>unequipItem(state,modelId,slotType),'item-unequipped')),
      this.#eventBus.on('item:favorite', (instanceId) => this.#store.update((state)=>toggleItemFavorite(state,instanceId),'item-favorited')),
      this.#eventBus.on('item:dismiss', () => this.#store.update((state)=>({...state,inventory:{...state.inventory,newItem:null}}),'item-dismissed')),
      this.#eventBus.on('consumable:use', (id) => this.#store.update((state)=>useConsumable(state,id),'consumable-used')),
      this.#eventBus.on('cache:open', (id) => this.#store.update((state)=>openCache(state,id),'cache-opened')),
      this.#eventBus.on('gems:spend', (id) => this.#store.update((state)=>buyGemConvenience(state,id),'gems-spent')),
      this.#eventBus.on('reward:dismiss', (id) => this.#store.update((state)=>dismissReward(state,id),'reward-dismissed')),
      this.#eventBus.on('patent:dismiss', () => this.#store.update(dismissPatentDiscovery, 'patent')),
      this.#eventBus.on('patent:equip', (patentId) => this.#store.update((state) => togglePatentEquipped(state, patentId), 'patent-equip')),
      this.#eventBus.on('patent:upgrade', (patentId) => this.#store.update((state) => upgradePatent(state, patentId), 'patent-upgrade')),
      this.#eventBus.on('patent:slot', () => this.#store.update(buyPatentSlot, 'patent-slot')),
      this.#eventBus.on('developer:cheat', (payload) => this.#applyDeveloperCheat(payload)),
      this.#eventBus.on('developer:reset', () => this.#performDeveloperReset()),
      this.#eventBus.on('developer:clean-balance', () => this.#performCleanBalanceRun()),
      this.#eventBus.on('developer:opened', () => this.#telemetryCall(() => this.#telemetry?.record({ category: 'ui', type: 'developer-dashboard-opened', source: 'developer', label: 'Developer Analytics opened' }, this.#store.getState()))),
      this.#eventBus.on('developer:tooltip', (label) => this.#telemetryCall(() => this.#telemetry?.record({ category: 'ui', type: 'tooltip-opened', source: 'tooltip', label }, this.#store.getState()))),
      this.#eventBus.on('developer:tech-viewed', ({nodeId,interaction}) => this.#telemetryCall(() => this.#telemetry?.record({ category: 'technology', type: interaction==='tap'?'technology-node-selected':'technology-node-viewed', source: 'tech-tree', label: nodeId, metadata: { nodeId, interaction } }, this.#store.getState()))),
    );
  }

  #tick(deltaMs) {
    this.#telemetryCall(() => this.#telemetry?.flushClickBurst(this.#store.getState()));
    this.#store.update((state) => tickGame(state, deltaMs * (this.#telemetry?.timeScale ?? 1)), 'game-loop');
  }

  #handleUnload = () => this.stop();
  #handleHashChange = () => this.#syncHashNavigation();
  #syncHashNavigation() { const viewId=globalThis.location?.hash?.slice(1);if(!viewId||this.#store.getState().ui.activeView===viewId)return;this.#store.update((state)=>({...state,ui:{...state.ui,activeView:viewId,sidebarOpen:false}}),'navigation'); }
  #handleVisibility = () => { if(document.hidden){this.#gameLoop.stop();this.#saveSystem.save();this.#telemetryCall(()=>this.#telemetry?.pause(this.#store.getState()));return;}const before=this.#store.getState();this.#store.update((state)=>reconcileOffline(state),'offline-progress');const after=this.#store.getState();if(after!==before&&after.offline.results?.effectiveDurationMs)this.#telemetryCall(()=>this.#telemetry?.record({category:'retention',type:'offline-progress-applied',source:'offline',label:'Background progress applied',meaningful:true,metadata:after.offline.results},after));this.#telemetryCall(()=>this.#telemetry?.resume(after));this.#gameLoop.start(); };

  #telemetryCall(callback) {
    if (this.#telemetry?.disabled) return null;
    try { return callback(); } catch (error) { if (this.#telemetry) this.#telemetry.runtimeFailures.push({timestamp:Date.now(),message:error?.message??String(error)}); globalThis.console?.error('Developer telemetry operation failed; the live recorder remains active for recovery.', error); return null; }
  }

  #handleRuntimeError(error) {
    this.#gameLoop.stop();
    const diagnostics = this.#shell.diagnostics();
    captureRuntimeException(error, diagnostics);
    this.#onRuntimeError?.(error, diagnostics);
  }

  async #performDeveloperReset() {
    if (!this.#devMode || !window.confirm('Delete current save and restart from the beginning?')) return;
    await this.#developerReset.reset({
      telemetry: this.#telemetry,
      replaceState: () => this.#store.replace(createDefaultState(), 'developer-reset'),
      reload: () => {
        const location = new URL(window.location.href);
        location.searchParams.set('dev', '1');
        window.location.replace(location.toString());
      },
    });
  }

  async #performCleanBalanceRun(){if(!this.#devMode||!window.confirm('Start a clean natural balance run? This deletes the save and all analytics history.'))return;const id=`balance-${Date.now()}`;await this.#developerReset.reset({telemetry:this.#telemetry,replaceState:()=>{},reload:()=>{const location=new URL(window.location.href);location.searchParams.set('dev','1');location.searchParams.set('balanceRun',id);window.location.replace(location.toString())}})}

  #applyDeveloperCheat({ type, eventId, value }) {
    if (!this.#devMode) return;
    this.#telemetry.markCheat(type, this.#store.getState(), { eventId });
    this.#store.update((state) => {
      if (type === 'credits') return { ...state, resources: { ...state.resources, credits: state.resources.credits + 1_000_000 } };
      if (type === 'compute') return { ...state, resources: { ...state.resources, compute: state.resources.compute + 100_000 } };
      if (type === 'research') return { ...state, resources: { ...state.resources, research: state.resources.research + 100_000 } };
      if (type === 'gems') return earnGems(state,100,'developer');
      if (type === 'intelligence') return { ...state, meta: { ...state.meta, intelligence: state.meta.intelligence + 100, totalIntelligence: state.meta.totalIntelligence + 100 } };
      if (type === 'set-model-level') return { ...state, model: { ...state.model, level: Math.max(1, Math.floor(value || 1)) } };
      if (type === 'complete-training') return { ...state, model: { ...state.model, trainingActive: true, trainingProgress: trainingRequiredForState(state) - 0.001 } };
      if (type === 'advance-patent') return { ...state, patents: { ...state.patents, progress: patentResearchRequired(state.patents.discovered.length) - 0.001 } };
      if (type === 'trigger-event') return { ...state, world: { ...state.world, activeEvent: WORLD_EVENTS.find(({ id }) => id === eventId) ?? WORLD_EVENTS[0] } };
      if (type === 'cycle-eligible') return { ...state, run: { ...state.run, computeProduced: Math.max(BALANCE.intelligence.computeScale, state.run.computeProduced) } };
      if (type === 'unlock-items') return { ...state, meta: { ...state.meta, totalIntelligence: Math.max(15,state.meta.totalIntelligence) } };
      if (type === 'grant-common') return acquireItem(state,'efficient-transformer','developer',Date.now(),{bypassUnlock:true});
      if (type === 'grant-rare') return acquireItem(state,'scientific-corpus','developer',Date.now(),{bypassUnlock:true});
      if (type === 'grant-epic') return acquireItem(state,'photonic-accelerator','developer',Date.now(),{bypassUnlock:true});
      if (type === 'grant-legendary') return acquireItem(state,'quantum-tensor','developer',Date.now(),{bypassUnlock:true});
      if (type === 'grant-consumable') return { ...state, consumables: { ...state.consumables, 'quantum-chip': (state.consumables['quantum-chip']??0)+1 } };
      if (type === 'grant-cache') return { ...state, rewardCaches: { ...state.rewardCaches, 'weekly-cache': (state.rewardCaches['weekly-cache']??0)+1 } };
      if (type === 'clear-inventory') return { ...state, inventory: { ...state.inventory, instances: [], equipped: {}, newItem: null } };
      if (type === 'generate-missions') return ensureMissions({ ...state, missions: { ...state.missions, dailyPeriodId:null, weeklyPeriodId:null, monthlyPeriodId:null } });
      if (type === 'reset-run') { const fresh = createDefaultState(); return { ...fresh, resources: { ...fresh.resources, gems: state.resources.gems }, meta: state.meta, patents: state.patents, premium: state.premium, retention: state.retention, settings: state.settings, tutorial: { step: 10, completed: true } }; }
      return state;
    }, 'developer-cheat');
  }
}
