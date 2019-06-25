export function sum(fn) {
  return {
    get: value => value,
    include: (acc, record) => {
      return acc + fn(record);
    },
    exclude: (acc, record) => {
      return acc - fn(record);
    },
  };
}

export function count() {
  return {
    get: value => value,
    include: (acc) => {
      return acc + 1;
    },
    exclude: (acc) => {
      return acc - 1;
    },
  };
}

export function avg(fn) {
  return {
    get: value => value,
    include: (acc, record, idx, all) => {
      return (acc * (all.length - 1) + fn(record)) / all.length;
    },
    exclude: (acc, record, idx, all) => {
      return ((acc * (all.length)) - fn(record)) / (all.length - 1);
    },
  };
}
