import { schema } from '../src';

const sampleRecs = [
  { id: 1, name: 'John', type: 'du' },
  { id: 2, name: 'Jane', type: 'mm' },
  { id: 3, name: 'Doe', type: 'y' },
];

describe('schema api check', () => {
  it('checks if a schema creates a valid instance', () => {
    const example = schema('example', 1);
    expect(example.name).toBe('example');
    expect(typeof example.getReducer).toBe('function');
    expect(typeof example.getActor).toBe('function');
    expect(typeof example.getSelector).toBe('function');
  });

  it('checks for reducers and actions', () => {
    const example = schema('example', 1);

    const reducer = example.getReducer();
    const actions = example.getAction();

    let state;
    const selector = example.getSelector(() => state);

    // Check insert record with a fresh state
    state = reducer(state, actions.insert({ id: 1, name: 'Temp' }));
    expect(selector.allIds()).toEqual([1]);
    expect(selector.get(1)).toEqual({ id: 1, name: 'Temp' });

    state = undefined;
    state = reducer(state, actions.populate(sampleRecs));
    expect(selector.allIds()).toEqual(sampleRecs.map(k => k.id));
    expect(selector.get(3)).toEqual(sampleRecs[2]);

    const insertRec = { id: 4, name: 'Insert', type: 'insert' };
    const updatedList = sampleRecs.map(k => k.id).concat(insertRec.id);
    state = reducer(state, actions.insert(insertRec));
    expect(selector.allIds()).toEqual(updatedList);
    expect(selector.get(insertRec.id)).toEqual(insertRec);

    // Inserting record will same id will do nothing
    state = reducer(state, actions.insert(insertRec));
    expect(selector.allIds()).toEqual(updatedList);
    expect(selector.get(insertRec.id)).toEqual(insertRec);

    // Update record
    const updateRec = { id: 2, name: 'Updated Jane' };
    state = reducer(state, actions.update(updateRec));
    expect(selector.allIds()).toEqual(updatedList);
    expect(selector.get(updateRec.id)).toEqual(Object.assign({}, sampleRecs[1], updateRec));

    // Replace record
    const replaceRec = { id: 1, name: 'Updated John' };
    state = reducer(state, actions.replace(replaceRec));
    expect(selector.allIds()).toEqual(updatedList);
    expect(selector.get(replaceRec.id)).toEqual(replaceRec);

    // Delete record
    state = reducer(state, actions.delete(2));
    expect(selector.allIds()).toEqual([1, 3, 4]);
    expect(selector.get(2)).toEqual(undefined);
  });

  it('checks for reducers and actions with batch', () => {
    const example = schema('example', 1);

    const reducer = example.getReducer();
    const actions = example.getAction();

    let state;
    const selector = example.getSelector(() => state);

    // Check batch insert
    state = reducer(state, actions.insert(sampleRecs));
    expect(selector.allIds()).toEqual(sampleRecs.map(k => k.id));
    expect(selector.get(3)).toEqual(sampleRecs[2]);

    // Check batch replace
    const replaceRec = sampleRecs.map(r => Object.assign({}, r, { name: `Replace ${r.name}` }));
    state = reducer(state, actions.replace(replaceRec));
    expect(selector.allIds()).toEqual(sampleRecs.map(k => k.id));
    expect(selector.get(3)).toEqual(replaceRec[2]);

    // check batch update
    state = reducer(state, actions.update(sampleRecs));
    expect(selector.allIds()).toEqual(sampleRecs.map(k => k.id));
    expect(selector.get(3)).toEqual(sampleRecs[2]);

    // check batch remove
    state = reducer(state, actions.delete([1, 2]));
    expect(selector.allIds()).toEqual([3]);
    expect(selector.get(1)).toEqual(undefined);
    expect(selector.get(2)).toEqual(undefined);
    expect(selector.get(3)).toEqual(sampleRecs[2]);
  });
});
