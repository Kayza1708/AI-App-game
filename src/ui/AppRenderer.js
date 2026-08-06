function formatRuntime(runtimeMs) {
  const totalSeconds = Math.floor(runtimeMs / 1_000);
  const hours = String(Math.floor(totalSeconds / 3_600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3_600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export class AppRenderer {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.runtimeElement = null;
    this.lastRenderedSecond = -1;
  }

  mount(state) {
    this.rootElement.innerHTML = `
      <main class="app-shell">
        <div class="ambient-grid" aria-hidden="true"></div>
        <header class="topbar">
          <a class="brand" href="/" aria-label="AI Singularity Startseite">
            <span class="brand-mark" aria-hidden="true"></span>
            <span>AI <strong>Singularity</strong></span>
          </a>
          <div class="system-status" role="status">
            <span class="status-dot" aria-hidden="true"></span>
            System online
          </div>
        </header>

        <section class="empty-state" aria-labelledby="foundation-title">
          <p class="eyebrow">Development cycle // 001</p>
          <h1 id="foundation-title">The foundation<br />is <span>online.</span></h1>
          <p class="intro">The core simulation is stable. All systems are ready for the first intelligence architecture.</p>
          <div class="diagnostics" aria-label="Systemdiagnose">
            <div><span>Core loop</span><strong>Stable</strong></div>
            <div><span>Persistence</span><strong>Active</strong></div>
            <div><span>Session runtime</span><strong data-runtime>${formatRuntime(state.meta.totalRuntimeMs)}</strong></div>
          </div>
        </section>

        <footer class="footer">
          <span>Milestone 01</span>
          <span>Awaiting next directive</span>
        </footer>
      </main>
    `;
    this.runtimeElement = this.rootElement.querySelector('[data-runtime]');
  }

  render(state) {
    const currentSecond = Math.floor(state.meta.totalRuntimeMs / 1_000);
    if (currentSecond === this.lastRenderedSecond) return;

    this.lastRenderedSecond = currentSecond;
    this.runtimeElement.textContent = formatRuntime(state.meta.totalRuntimeMs);
  }
}
