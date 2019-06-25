import { selector as normalizedSelector } from './normalized';

export default function createSelector(getState, groupBys) {
  const normalizedGetState = () => {
    const state = getState();
    return state && state._;
  };

  return {
    ...normalizedSelector(normalizedGetState),
  };
}
