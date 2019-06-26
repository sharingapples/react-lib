import { record } from '../src';

describe('record specification', () => {
  it('checks for standard api', () => {
    const example = record('example', 1);
    expect(example.name).toBe('example');
    expect(typeof example.getReducer).toBe('function');
    expect(typeof example.getActor).toBe('function');
    expect(typeof example.getSelector).toBe('function');
  });
});
