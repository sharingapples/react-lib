import { schema } from '../src';

describe('schema api check', () => {
  it('checks if a schema creates a valid instance', () => {
    const example = schema('example', 1);
    expect(example.name).toBe('example');
    expect(typeof example.getReducer).toBe('function');
    expect(typeof example.getActor).toBe('function');
    expect(typeof example.getSelector).toBe('function');
  });
});
