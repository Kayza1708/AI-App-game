import { Application } from './Application.js';

import { captureRuntimeException } from './RuntimeDiagnostics.js';

export function renderFatalError(error, host, diagnostics = {}) {
  if (!host) return;
  globalThis.console?.error('AI Singularity failed to start.', error);
  host.innerHTML = `<main class="startup-error" role="alert"><h1>AI SINGULARITY</h1><h2>Startup recovery</h2><p>The interface could not initialize. Your save has not been deleted.</p><button type="button" onclick="location.reload()">RETRY</button><details><summary>Technical details</summary><pre></pre></details></main>`;
  const captured = captureRuntimeException(error, diagnostics);
  host.querySelector('pre').textContent = `${captured.stack}\n\nRuntime diagnostics\n${safeStringify(diagnostics)}`;
}

export function bootstrap(host, ApplicationClass = Application) {
  if (!host) return null;
  try {
    const instance = new ApplicationClass(host, { onRuntimeError: (error, diagnostics) => renderFatalError(error, host, diagnostics) });
    instance.start();
    return instance;
  } catch (error) {
    renderFatalError(error, host);
    return null;
  }
}

function safeStringify(value) { try { return JSON.stringify(value, null, 2); } catch { return '[diagnostics could not be serialized]'; } }
