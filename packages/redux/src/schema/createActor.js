import { actor as normalizedActor } from './normalized';

export default function createActor(schema, dispatch, groupBys) {
  const actor = normalizedActor(schema, dispatch);
  groupBys.forEach((groupBy) => {
    actor[groupBy.name] = groupBy.getActor(dispatch);
  });

  return actor;
}
