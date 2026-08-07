export const ANALYTICS_SCHEMA_VERSION = 1;
export const MAX_EVENTS = 10_000;
export const EVENT_CATEGORIES = ['session','purchase','progression','economy','active-play','world','ui','developer'];

export function createTelemetryEvent(input, context) {
  const timestamp = Math.max(context.lastTimestamp ?? 0, Number(input.timestamp ?? Date.now()));
  const event = {
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    id: input.id ?? `event-${context.sequence}`,
    timestamp,
    sessionSeconds: Math.max(context.lastSessionSeconds ?? 0, Number(input.sessionSeconds ?? context.sessionSeconds ?? 0)),
    runSeconds: Math.max(0, Number(input.runSeconds ?? 0)),
    developmentCycle: Math.max(0, Number(input.developmentCycle ?? 0)),
    category: EVENT_CATEGORIES.includes(input.category) ? input.category : 'session',
    type: String(input.type), source: String(input.source ?? 'system'), label: String(input.label ?? input.type),
    severity: ['info','warning','critical'].includes(input.severity) ? input.severity : 'info',
    meaningful: Boolean(input.meaningful), reward: Boolean(input.reward), popup: Boolean(input.popup),
    amount: Number(input.amount ?? 0), cost: Number(input.cost ?? 0),
    before: primitiveSnapshot(input.before), after: primitiveSnapshot(input.after), metadata: primitiveSnapshot(input.metadata),
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
  return event?.schemaVersion === ANALYTICS_SCHEMA_VERSION && typeof event.id === 'string' && Number.isFinite(event.timestamp) && Number.isFinite(event.sessionSeconds) && event.sessionSeconds >= 0 && typeof event.type === 'string' && EVENT_CATEGORIES.includes(event.category);
}
