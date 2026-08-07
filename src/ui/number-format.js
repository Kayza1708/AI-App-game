const SUFFIXES = ['', 'K', 'M', 'B', 'T'];

export function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) return value === Infinity ? '∞' : '0';
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);
  if (absolute < 1000) return `${sign}${trim(absolute.toFixed(absolute < 100 ? digits : 0))}`;
  const group = Math.floor(Math.log10(absolute) / 3);
  const scaled = absolute / 1000 ** group;
  const suffix = group < SUFFIXES.length ? SUFFIXES[group] : alphabeticSuffix(group - SUFFIXES.length);
  return `${sign}${trim(scaled.toFixed(scaled < 100 ? digits : 0))}${suffix}`;
}

function alphabeticSuffix(index) {
  const first = Math.floor(index / 26);
  const second = index % 26;
  return String.fromCharCode(97 + first) + String.fromCharCode(97 + second);
}
function trim(value) { return value.replace(/\.0+$|(?<=\.[0-9]*[1-9])0+$/u, ''); }
