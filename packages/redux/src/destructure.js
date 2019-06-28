const RESERVED_KEYWORDS = ['memoize', 'allIds', 'byId', 'length'];

export default function destructure(structure, method) {
  const result = Object.keys(structure).reduce((res, key) => {
    if (process.env.NODE_ENV === 'development') {
      if (RESERVED_KEYWORDS.includes(key)) throw new Error(`${key} used in the redux structure is a reserved keyword`);
    }

    res[key] = method(structure[key], key);
    return res;
  }, {});

  return result;
}
