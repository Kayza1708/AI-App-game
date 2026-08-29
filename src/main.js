import './styles/main.css';
import { bootstrap } from './core/bootstrap.js';

const root = globalThis.document?.querySelector('#app') ?? null;

const application = root ? bootstrap(root) : null;

if (import.meta.hot) import.meta.hot.dispose(() => application?.stop());
