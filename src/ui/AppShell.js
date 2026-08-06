import { HARDWARE_CATALOG } from '../data/defaultState.js';
import { computePerSecond, hardwareCost, revenuePerUser, targetUsers, trainingRequired, xpRequired } from '../systems/GameSystem.js';
import { NAV_ITEMS, isKnownView } from './navigation.js';

export class AppShell {
  #eventBus;
  #root;
  #lastView = null;

  constructor(root, eventBus) { this.#root = root; this.#eventBus = eventBus; }

  mount(state) {
    this.#root.innerHTML = `<div class="app-shell">
      <header class="topbar"><button class="menu-button" type="button" data-action="toggle-menu" aria-label="Toggle navigation"><span></span><span></span></button>
        <a class="brand" href="#dashboard"><span class="brand-mark">AI</span><strong>AI SINGULARITY</strong></a>
        <div class="top-resources"><div><small>CREDITS</small><strong data-top-credits></strong></div><div><small>COMPUTE / SEC</small><strong data-top-compute></strong></div><div><small>USERS</small><strong data-top-users></strong></div><div><small>MODEL</small><strong data-top-model></strong></div></div>
      </header>
      <aside class="sidebar" data-sidebar><p class="sidebar-heading">Company interface</p><nav>${NAV_ITEMS.map((item, index) => `<a href="#${item.id}" class="nav-item" data-view="${item.id}"><span>0${index + 1}</span><div>${item.label}<small>${item.eyebrow}</small></div></a>`).join('')}</nav><div class="sidebar-footer"><small>PLAY TIME</small><strong data-session></strong><span>● AUTOSAVE ONLINE</span></div></aside>
      <main class="workspace" data-workspace></main>
      <footer class="statusbar"><span>BUILD 0.2.0</span><span data-save-status>Awaiting first save</span></footer>
    </div>`;
    this.#root.addEventListener('click', this.#handleClick);
    this.render(state);
  }

  render(state) {
    const view = isKnownView(state.ui.activeView) ? state.ui.activeView : 'dashboard';
    this.#root.querySelectorAll('[data-view]').forEach((node) => node.classList.toggle('is-active', node.dataset.view === view));
    this.#root.querySelector('[data-sidebar]').classList.toggle('is-open', state.ui.sidebarOpen);
    this.#text('[data-top-credits]', `◈ ${this.#number(state.resources.credits)}`);
    this.#text('[data-top-compute]', `${this.#number(computePerSecond(state))} C`);
    this.#text('[data-top-users]', this.#number(state.resources.users));
    this.#text('[data-top-model]', `LVL ${state.model.level}`);
    this.#text('[data-session]', this.#duration(state.statistics.playTimeMs));
    this.#text('[data-save-status]', state.session.lastSavedAt ? `SAVED ${new Date(state.session.lastSavedAt).toLocaleTimeString('en-GB')}` : 'AUTOSAVE READY');
    const workspace = this.#root.querySelector('[data-workspace]');
    if (this.#lastView !== view) { workspace.innerHTML = this.#view(view, state); this.#lastView = view; }
    this.#updateView(view, state);
  }

  #view(view, state) {
    const headings = { dashboard: ['COMMAND CENTER', 'From one machine to infinite intelligence.'], hardware: ['HARDWARE', 'Expand the infrastructure that powers your ambition.'], model: ['AI MODEL', 'Turn raw compute into a smarter product.'], company: ['COMPANY', 'Intelligence attracts attention. Attention creates revenue.'], statistics: ['STATISTICS', 'Every signal from your journey, measured.'] };
    const [title, subtitle] = headings[view];
    const body = {
      dashboard: `<div class="dashboard-grid"><section class="panel resource-panel"><p class="eyebrow">LIVE RESOURCES</p><div class="big-stat"><span>AVAILABLE COMPUTE</span><strong data-compute></strong><small data-compute-rate></small></div><div class="meter-row"><span>MODEL QUALITY</span><b data-quality></b></div></section><section class="panel optimize-panel"><div class="orb-wrap"><button class="optimize-button" data-action="optimize"><span>OPTIMIZE</span><strong>CODE</strong><small data-click-value></small></button></div><p>Tap to manually refine your stack and generate bonus compute.</p></section><section class="panel next-panel"><p class="eyebrow">NEXT OBJECTIVE</p><h3 data-next-objective></h3><p data-next-detail></p><button class="primary-button" data-action="jump-hardware">OPEN HARDWARE</button></section><section class="panel company-snapshot"><p class="eyebrow">COMPANY PULSE</p><div class="split-stats"><div><span>USERS</span><strong data-users></strong></div><div><span>REVENUE / SEC</span><strong data-revenue></strong></div></div></section></div>`,
      hardware: `<div class="hardware-grid">${HARDWARE_CATALOG.map((item) => `<article class="panel hardware-card" data-hardware-card="${item.id}"><div class="hardware-icon">${item.name.slice(0, 2).toUpperCase()}</div><div class="hardware-copy"><h3>${item.name}</h3><p>${item.description}</p><span>+${this.#number(item.computePerSecond)} compute / sec</span></div><div class="owned">OWNED <strong data-owned="${item.id}"></strong></div><button class="buy-button" data-buy="${item.id}"><span>BUY</span><strong data-cost="${item.id}"></strong></button></article>`).join('')}</div>`,
      model: `<div class="model-layout"><section class="panel model-core"><div class="model-visual"><span>NEURAL CORE</span><strong data-model-level></strong></div><div class="quality"><small>MODEL QUALITY</small><strong data-quality></strong><p>Quality continuously attracts new users.</p></div></section><section class="panel training-panel"><p class="eyebrow">TRAINING RUN</p><h3>Invest available compute</h3><p>Complete a training run to gain model XP and improve quality.</p><div class="progress-label"><span>TRAINING PROGRESS</span><strong data-training-label></strong></div><div class="progress"><i data-training-bar></i></div><button class="primary-button wide" data-action="train">INVEST COMPUTE</button><div class="progress-label"><span>LEVEL XP</span><strong data-xp-label></strong></div><div class="progress secondary"><i data-xp-bar></i></div></section></div>`,
      company: `<div class="company-grid"><section class="panel identity"><p class="eyebrow">COMPANY DESIGNATION</p><h2>${this.#escape(state.profile.companyName)}</h2><span>FOUNDED ${new Date(state.profile.createdAt).toLocaleDateString()}</span></section><section class="panel metric-card"><small>ACTIVE USERS</small><strong data-users></strong><p data-user-target></p></section><section class="panel metric-card"><small>REVENUE / USER</small><strong data-rpu></strong><p>Increases with model level</p></section><section class="panel metric-card accent"><small>REVENUE / SEC</small><strong data-revenue></strong><p>Automatically added to credits</p></section></div>`,
      statistics: `<div class="stats-grid">${[['credits','TOTAL CREDITS EARNED'],['compute','TOTAL COMPUTE PRODUCED'],['clicks','OPTIMIZE CLICKS'],['playtime','PLAY TIME'],['hardware','HARDWARE OWNED'],['quality','CURRENT MODEL QUALITY']].map(([key,label]) => `<section class="panel stat-card"><small>${label}</small><strong data-stat="${key}"></strong><i></i></section>`).join('')}</div>`,
    }[view];
    return `<header class="view-header"><p>AI SINGULARITY / ${title}</p><h1>${title}</h1><span>${subtitle}</span></header>${body}`;
  }

  #updateView(view, state) {
    const set = (selector, value) => this.#text(`[data-workspace] ${selector}`, value);
    const revenue = state.resources.users * revenuePerUser(state);
    if (view === 'dashboard') {
      set('[data-compute]', `${this.#number(state.resources.compute)} C`); set('[data-compute-rate]', `+${this.#number(computePerSecond(state))} per second`); set('[data-quality]', this.#number(state.model.quality)); set('[data-click-value]', `+${this.#number(1 + state.model.level * .35)} COMPUTE`); set('[data-users]', this.#number(state.resources.users)); set('[data-revenue]', `◈ ${this.#number(revenue)}`);
      const next = HARDWARE_CATALOG.find((item) => state.resources.credits < hardwareCost(item, state.hardware[item.id])) ?? HARDWARE_CATALOG.at(-1); set('[data-next-objective]', `Acquire ${next.name}`); set('[data-next-detail]', `${this.#number(hardwareCost(next, state.hardware[next.id]))} credits required for the next unit.`);
    } else if (view === 'hardware') HARDWARE_CATALOG.forEach((item) => { const cost = hardwareCost(item, state.hardware[item.id]); set(`[data-owned="${item.id}"]`, state.hardware[item.id]); set(`[data-cost="${item.id}"]`, `◈ ${this.#number(cost)}`); this.#root.querySelector(`[data-buy="${item.id}"]`).disabled = state.resources.credits < cost; });
    else if (view === 'model') { const training = trainingRequired(state.model.level), xp = xpRequired(state.model.level); set('[data-model-level]', `LEVEL ${state.model.level}`); set('[data-quality]', this.#number(state.model.quality)); set('[data-training-label]', `${this.#number(state.model.trainingProgress)} / ${this.#number(training)} C`); set('[data-xp-label]', `${this.#number(state.model.xp)} / ${this.#number(xp)} XP`); this.#width('[data-training-bar]', state.model.trainingProgress / training); this.#width('[data-xp-bar]', state.model.xp / xp); this.#root.querySelector('[data-action="train"]').disabled = state.resources.compute <= 0; }
    else if (view === 'company') { set('[data-users]', this.#number(state.resources.users)); set('[data-user-target]', `Trending toward ${this.#number(targetUsers(state))} users`); set('[data-rpu]', `◈ ${revenuePerUser(state).toFixed(3)}`); set('[data-revenue]', `◈ ${this.#number(revenue)}`); }
    else { const totalHardware = Object.values(state.hardware).reduce((a, b) => a + b, 0); const values = { credits: `◈ ${this.#number(state.statistics.totalCreditsEarned)}`, compute: `${this.#number(state.statistics.totalComputeProduced)} C`, clicks: this.#number(state.statistics.totalClicks), playtime: this.#duration(state.statistics.playTimeMs), hardware: this.#number(totalHardware), quality: this.#number(state.model.quality) }; Object.entries(values).forEach(([key, value]) => set(`[data-stat="${key}"]`, value)); }
  }

  #handleClick = (event) => { const view = event.target.closest('[data-view]'); if (view) this.#eventBus.emit('navigation:selected', view.dataset.view); const buy = event.target.closest('[data-buy]'); if (buy && !buy.disabled) this.#eventBus.emit('hardware:buy', buy.dataset.buy); const action = event.target.closest('[data-action]')?.dataset.action; if (action === 'toggle-menu') this.#eventBus.emit('navigation:toggled'); if (action === 'train') this.#eventBus.emit('model:train'); if (action === 'optimize') { this.#eventBus.emit('compute:optimize'); event.target.closest('.optimize-button').animate([{ transform: 'scale(.96)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 240 }); } if (action === 'jump-hardware') this.#eventBus.emit('navigation:selected', 'hardware'); };
  #text(selector, value) { const node = this.#root.querySelector(selector); if (node) node.textContent = value; }
  #width(selector, ratio) { const node = this.#root.querySelector(selector); if (node) node.style.width = `${Math.min(100, ratio * 100)}%`; }
  #number(value) { return new Intl.NumberFormat('en-US', { notation: Math.abs(value) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: Math.abs(value) < 100 ? 1 : 0 }).format(value); }
  #duration(ms) { const seconds = Math.floor(ms / 1000); return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map((v) => String(v).padStart(2, '0')).join(':'); }
  #escape(value) { const span = document.createElement('span'); span.textContent = value; return span.innerHTML; }
}
