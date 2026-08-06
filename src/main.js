import './styles/main.css';
import { Application } from './core/Application.js';

const root = document.querySelector('#app');
if (!root) throw new Error('Application root was not found.');

const application = new Application(root);
application.start();

if (import.meta.hot) import.meta.hot.dispose(() => application.stop());
