import { actor as normalizedActor } from './normalized';

export default function createActor(schema, dispatch, groupBys) {
  return {
    ...normalizedActor(schema, dispatch),
  };
}
