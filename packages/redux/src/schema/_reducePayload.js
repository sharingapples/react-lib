// eslint-disable-next-line no-underscore-dangle
export default function _reduce(payload, fn) {
  if (Array.isArray(payload)) {
    return payload.reduce((res, rec) => fn(rec) || res, false);
  }
  return fn(payload);
}
