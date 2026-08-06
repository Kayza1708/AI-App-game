import { NAV_ITEMS, isKnownView } from './navigation.js';

const VIEW_COPY = {
  overview: ['01 / FOUNDATION', 'The future starts with an empty room.', 'Your intelligence company is ready to be defined. Core operational systems will come online in the next development phase.'],
  operations: ['02 / OPERATIONS', 'Operational layer standing by.', 'Infrastructure controls and company operations will be introduced as the simulation expands.'],
  intelligence: ['03 / INTELLIGENCE', 'Intelligence systems are offline.', 'Model development remains secured until the underlying company infrastructure is established.'],
  trajectory: ['04 / TRAJECTORY', 'The path is not yet visible.', 'Long-range objectives will emerge as your company approaches the frontier of machine intelligence.'],
};

export class AppShell {
  #eventBus;
  #root;

  constructor(root, eventBus) {
    this.#root = root;
    this.#eventBus = eventBus;
  }

  mount(state) {
    this.#root.innerHTML = `
      <div class="app-shell">
        <header class="topbar">
          <button class="icon-button menu-button" type="button" data-action="toggle-menu" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span></button>
          <a class="brand" href="#overview" aria-label="AI Singularity overview"><span class="brand-mark" aria-hidden="true"><i></i></span><span><strong>AI</strong> SINGULARITY</span></a>
          <div class="system-state"><span></span> SYSTEM NOMINAL</div>
          <div class="topbar-meta"><span class="meta-label">LOCAL TIME</span><strong data-clock>--:--:--</strong></div>
        </header>
        <aside class="sidebar" data-sidebar>
          <div class="sidebar-heading">Company interface</div>
          <nav aria-label="Primary navigation">
            ${NAV_ITEMS.map((item, index) => `<a class="nav-item" href="#${item.id}" data-view="${item.id}"><span class="nav-number">0${index + 1}</span><span class="nav-label">${item.label}<small>${item.eyebrow}</small></span><span class="nav-line"></span></a>`).join('')}
          </nav>
          <div class="sidebar-footer"><span class="meta-label">SESSION</span><strong data-session>00:00:00</strong><small>Autosave enabled</small></div>
        </aside>
        <main class="workspace" data-workspace tabindex="-1"></main>
        <footer class="statusbar"><span>BUILD 0.1.0</span><span class="status-divider"></span><span data-save-status>Awaiting first save</span></footer>
      </div>`;
    this.#bindEvents();
    this.render(state);
  }

  render(state) {
    const activeView = isKnownView(state.ui.activeView) ? state.ui.activeView : 'overview';
    const [index, title, description] = VIEW_COPY[activeView];
    this.#root.querySelectorAll('[data-view]').forEach((element) => {
      const active = element.dataset.view === activeView;
      element.classList.toggle('is-active', active);
      active ? element.setAttribute('aria-current', 'page') : element.removeAttribute('aria-current');
    });
    this.#root.querySelector('[data-sidebar]').classList.toggle('is-open', state.ui.sidebarOpen);
    this.#root.querySelector('[data-action="toggle-menu"]').setAttribute('aria-expanded', String(state.ui.sidebarOpen));
    this.#root.querySelector('[data-workspace]').innerHTML = `
      <section class="hero" aria-labelledby="view-title">
        <div class="hero-grid" aria-hidden="true"></div><div class="signal-orbit" aria-hidden="true"><span></span><i></i></div>
        <div class="hero-content"><p class="section-index">${index}</p><h1 id="view-title">${title}</h1><p class="hero-description">${description}</p>
          <div class="foundation-card"><span class="card-icon" aria-hidden="true">◇</span><div><small>COMPANY DESIGNATION</small><strong>${this.#escape(state.profile.companyName)}</strong></div><span class="card-state">READY</span></div>
        </div><div class="phase-marker"><span>PHASE</span><strong>00</strong><small>ORIGIN</small></div>
      </section>`;
    this.#root.querySelector('[data-session]').textContent = this.#formatDuration(state.session.elapsedMs);
    this.#root.querySelector('[data-clock]').textContent = new Date().toLocaleTimeString('en-GB');
    this.#root.querySelector('[data-save-status]').textContent = state.session.lastSavedAt ? `Saved ${new Date(state.session.lastSavedAt).toLocaleTimeString('en-GB')}` : 'Awaiting first save';
  }

  #bindEvents() {
    this.#root.addEventListener('click', (event) => {
      const link = event.target.closest('[data-view]');
      if (link) this.#eventBus.emit('navigation:selected', link.dataset.view);
      if (event.target.closest('[data-action="toggle-menu"]')) this.#eventBus.emit('navigation:toggled');
    });
  }

  #formatDuration(durationMs) {
    const seconds = Math.floor(durationMs / 1000);
    return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map((value) => String(value).padStart(2, '0')).join(':');
  }

  #escape(value) {
    const element = document.createElement('span');
    element.textContent = value;
    return element.innerHTML;
  }
}
