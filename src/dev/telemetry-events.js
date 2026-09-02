export const ANALYTICS_SCHEMA_VERSION = 3;
export const MAX_EVENTS = 10_000;
export const EVENT_CATEGORIES = ['session','run','purchase','progression','decision','economy','active-play','world','ui','developer','funnel','feature','balance','patent','collection','build','currency','retention'];

export function createTelemetryEvent(input, context) {
  const timestamp = Math.max(context.lastTimestamp ?? 0, Number(input.timestamp ?? Date.now()));
  const event = {
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    id: input.id ?? `event-${context.sequence}`,
    sessionId: String(input.sessionId ?? context.sessionId ?? 'unknown-session'),
    runtimeSessionId: String(input.runtimeSessionId ?? context.runtimeSessionId ?? input.sessionId ?? context.sessionId ?? 'unknown-session'),
    playthroughId: String(input.playthroughId ?? context.playthroughId ?? 'unknown-playthrough'),
    runId: String(input.runId ?? context.runId ?? 'unknown-run'),
    playerId: String(input.playerId ?? context.playerId ?? 'anonymous-local-player'),
    balanceRunId: input.balanceRunId ?? context.balanceRunId ?? null,
    saveVersion: Number(input.saveVersion ?? context.saveVersion ?? 0),
    gameVersion: String(input.gameVersion ?? context.gameVersion ?? 'unknown'),
    prestigeLevel: Number(input.prestigeLevel ?? context.prestigeLevel ?? 0),
    breakthroughLevel: Number(input.breakthroughLevel ?? context.breakthroughLevel ?? 0),
    timestamp,
    sessionSeconds: Math.max(context.lastSessionSeconds ?? 0, Number(input.sessionSeconds ?? context.sessionSeconds ?? 0)),
    playtime: Math.max(0, Number(input.playtime ?? context.playtime ?? 0)),
    sessionPlaytime: Math.max(context.lastSessionSeconds ?? 0, Number(input.sessionPlaytime ?? input.sessionSeconds ?? context.sessionSeconds ?? 0)),
    totalLifetimePlaytime: Math.max(0, Number(input.totalLifetimePlaytime ?? context.totalLifetimePlaytime ?? 0)),
    runSeconds: Math.max(0, Number(input.runSeconds ?? 0)),
    developmentCycle: Math.max(0, Number(input.developmentCycle ?? 0)),
    category: EVENT_CATEGORIES.includes(input.category) ? input.category : 'session',
    type: String(input.type), source: String(input.source ?? 'system'), label: String(input.label ?? input.type),
    severity: ['info','warning','critical'].includes(input.severity) ? input.severity : 'info',
    meaningful: Boolean(input.meaningful), reward: Boolean(input.reward), popup: Boolean(input.popup),
    amount: Number(input.amount ?? 0), cost: Number(input.cost ?? 0),
    before: primitiveSnapshot(input.before), after: primitiveSnapshot(input.after), metadata: primitiveSnapshot(input.metadata),
    playerSnapshot: primitiveSnapshot(input.playerSnapshot),
  };
  return Object.freeze(event);
}

export function primitiveSnapshot(value, depth = 0) {
  if (value === null || value === undefined) return value ?? null;
  if (['string','number','boolean'].includes(typeof value)) return value;
  if (depth > 4) return '[truncated]';
  if (Array.isArray(value)) return Object.freeze(value.slice(0, 100).map((item) => primitiveSnapshot(item, depth + 1)));
  if (typeof value === 'object') return Object.freeze(Object.fromEntries(Object.entries(value).slice(0, 100).map(([key,item]) => [key, primitiveSnapshot(item, depth + 1)])));
  return String(value);
}

export function validateTelemetryEvent(event) {
  return event?.schemaVersion === ANALYTICS_SCHEMA_VERSION && typeof event.id === 'string' && typeof event.sessionId === 'string' && typeof event.runId === 'string' && typeof event.playerId === 'string' && Number.isFinite(event.saveVersion) && typeof event.gameVersion === 'string' && Number.isFinite(event.timestamp) && Number.isFinite(event.sessionSeconds) && event.sessionSeconds >= 0 && Number.isFinite(event.totalLifetimePlaytime) && typeof event.type === 'string' && EVENT_CATEGORIES.includes(event.category);
}
