/** Web Animations is optional in embedded browsers; feedback must never block play. */
export function animateElement(element, keyframes, options) {
  if (typeof element?.animate !== 'function') return null;
  try { return element.animate(keyframes, options); } catch { return null; }
}
