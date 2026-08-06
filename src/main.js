import './styles/main.css';
import { Game } from './core/Game.js';
import { SaveSystem } from './systems/SaveSystem.js';
import { AppRenderer } from './ui/AppRenderer.js';

const rootElement = document.querySelector('#app');

if (!rootElement) {
  throw new Error('Application root element was not found.');
}

const saveSystem = new SaveSystem();
const game = new Game({
  state: saveSystem.load(),
  saveSystem,
  renderer: new AppRenderer(rootElement),
});

game.start();

if (import.meta.hot) {
  import.meta.hot.dispose(() => game.stop());
}
