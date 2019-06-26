export default function destructure(structure, method) {
  const result = Object.keys(structure).reduce((res, key) => {
    res[key] = method(structure[key], key);
    return res;
  }, {});

  return result;
}
