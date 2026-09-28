import {describe, it, expect} from 'vitest';
import {deepFreeze} from '../src/core/deep-freeze.js';

describe('deepFreeze', () => {
  it('freezes nested objects and arrays and returns the same reference', () => {
    const value = {a: {b: [1, {c: 2}]}};
    const frozen = deepFreeze(value);
    expect(frozen).toBe(value);
    expect(Object.isFrozen(value)).toBe(true);
    expect(Object.isFrozen(value.a)).toBe(true);
    expect(Object.isFrozen(value.a.b)).toBe(true);
    expect(Object.isFrozen(value.a.b[1])).toBe(true);
  });

  it('passes primitives and null through', () => {
    expect(deepFreeze(5)).toBe(5);
    expect(deepFreeze(null)).toBe(null);
  });
});
