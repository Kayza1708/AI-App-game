import { Application } from './Application.js';

export function renderFatalError(error, host) {
  if (!host) return;
  globalThis.console?.error('AI Singularity failed to start.', error);
  host.innerHTML = `<main class="startup-error" role="alert"><h1>AI SINGULARITY</h1><h2>Startup recovery</h2><p>The interface could not initialize. Your save has not been deleted.</p><button type="button" onclick="location.reload()">RETRY</button><details><summary>Technical details</summary><pre></pre></details></main>`;
  host.querySelector('pre').textContent = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

export function bootstrap(host, ApplicationClass = Application) {
  if (!host) return null;
  try {
    const instance = new ApplicationClass(host, { onRuntimeError: (error) => renderFatalError(error, host) });
    instance.start();
    return instance;
  } catch (error) {
    renderFatalError(error, host);
    return null;
  }
}
