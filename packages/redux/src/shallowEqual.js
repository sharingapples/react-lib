export default function shallowEqual(previous, next) {
  if (previous === next) return true;

  if (previous === null || next === null
    || typeof previous !== 'object' || typeof next !== 'object') {
    return false;
  }

  if (Array.isArray(previous)) {
    if (!Array.isArray(next)) return false;
    if (previous.length !== next.length) return false;
    for (let i = 0; i < previous.length; i += 1) {
      if (next[i] !== previous[i]) return false;
    }
  }

  const prevKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return false;

  for (let i = 0; i < prevKeys.length; i += 1) {
    if (previous[prevKeys[i]] !== next[nextKeys[i]]) {
      return false;
    }
  }

  return true;
}
