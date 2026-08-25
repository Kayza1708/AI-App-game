import { GAME_VERSION, SAVE_VERSION } from '../data/defaultState.js';
import { ANALYTICS_SCHEMA_VERSION } from '../dev/telemetry-events.js';
import { createDefaultEconomySnapshot, economySnapshot } from '../systems/GameSystem.js';
import { validateGameState } from './GameStateContract.js';

let lastException = null;

export function createRuntimeDiagnostics({ state, screen = 'startup', root = null } = {}) {
  let economy = createDefaultEconomySnapshot();
  let validationStatus = 'not available';
  try {
    if (state) {
      economy = economySnapshot(state);
      validateGameState(state, economy);
      validationStatus = 'valid';
    }
  } catch (error) {
    validationStatus = error.message;
  }
  const overlays = root ? [...root.querySelectorAll('.event-backdrop')] : [];
  const reward = state?.rewards?.queue?.[0] ?? null;
  return {
    screen, currentModal: overlays[0]?.dataset?.modalType ?? null,
    rewardQueueLength: state?.rewards?.queue?.length ?? 0,
    rewardQueue: state?.rewards?.queue ?? [], offlinePending: Boolean(state?.offline?.rewardPending || reward?.category === 'offline'),
    overlayCount: overlays.length, pointerLock: globalThis.document?.pointerLockElement ? 'locked' : 'unlocked',
    focusedElement: globalThis.document?.activeElement?.tagName ?? null,
    lastException, lastEconomySnapshot: economy, lastNormalizedState: state ?? null,
    stateVersion: state?.version ?? null, saveVersion: SAVE_VERSION, gameVersion: GAME_VERSION,
    telemetryVersion: ANALYTICS_SCHEMA_VERSION, validationStatus,
  };
}

export function captureRuntimeException(error, context = {}) {
  const location = parseStackLocation(error?.stack);
  lastException = {
    name: error?.name ?? 'Error', message: error?.message ?? String(error),
    stack: error?.stack ?? String(error), ...location, timestamp: Date.now(), ...context,
  };
  globalThis.console?.error('AI Singularity runtime exception', lastException);
  return lastException;
}

export function getLastRuntimeException() { return lastException; }

function parseStackLocation(stack = '') {
  const match = String(stack).match(/(?:https?:\/\/[^\s]+|file:\/\/[^\s]+|\/?[^\s(]+\.js):(\d+):(\d+)/u);
  return { file: match?.[0]?.split(/:\d+:\d+$/u)[0] ?? null, line: Number(match?.[1] ?? 0) || null, column: Number(match?.[2] ?? 0) || null };
}
