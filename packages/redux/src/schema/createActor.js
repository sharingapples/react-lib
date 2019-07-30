import { actor as normalizedActor } from './normalized';

export default function createActor(schema, dispatch) {
  const actor = normalizedActor(schema, dispatch);
  return actor;
}
