import { selector as normalizedSelector } from './normalized';

export default function createSelector(getState, groupBys) {
  const normalizedGetState = () => {
    const state = getState();
    return state && state._;
  };

  const selector = normalizedSelector(normalizedGetState);
  groupBys.forEach((groupBy) => {
    const groupByGetState = () => {
      const state = getState();
      return state && state[groupBy.name];
    };

    selector[groupBy.name] = groupBy.selector(groupByGetState);
  });

  return selector;
}
