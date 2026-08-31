/** Clone the plain-data game state without requiring the structuredClone Web API. */
export function cloneState(value) {
  if (typeof globalThis.structuredClone === 'function') return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
