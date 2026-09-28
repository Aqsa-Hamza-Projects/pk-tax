import {describe, it, expect} from 'vitest';
import {
  hasSalaryRules,
  listSalaryTaxYears,
  resolveSalaryRules,
} from '../src/pakistan/salary/index.js';
import {UnsupportedTaxYearError} from '../src/errors.js';

describe('salary rule registry', () => {
  it('lists exactly the supported years, sorted', () => {
    expect(listSalaryTaxYears()).toEqual(['2025-26', '2026-27']);
  });

  it('returns a fresh array each time', () => {
    const years = listSalaryTaxYears();
    years.push('2025-26');
    expect(listSalaryTaxYears()).toEqual(['2025-26', '2026-27']);
  });

  it('resolves each year to its own rule set', () => {
    expect(resolveSalaryRules('2025-26').taxYear).toBe('2025-26');
    expect(resolveSalaryRules('2026-27').taxYear).toBe('2026-27');
  });

  it.each([
    '2035-36',
    '2026-2027',
    'TY2027',
    '',
    2027,
    undefined,
    null,
    'constructor',
    '__proto__',
    'toString',
    'hasOwnProperty',
  ])('rejects %j as unsupported', (taxYear) => {
    expect(hasSalaryRules(taxYear)).toBe(false);
    expect(() => resolveSalaryRules(taxYear)).toThrow(UnsupportedTaxYearError);
  });

  it('reports the supported years on the error', () => {
    try {
      resolveSalaryRules('2035-36');
      expect.unreachable();
    } catch (error) {
      expect((error as UnsupportedTaxYearError).supportedTaxYears).toEqual([
        '2025-26',
        '2026-27',
      ]);
    }
  });

  it('deep-freezes every rule set', () => {
    for (const year of listSalaryTaxYears()) {
      const rules = resolveSalaryRules(year);
      expect(Object.isFrozen(rules)).toBe(true);
      expect(Object.isFrozen(rules.slabs)).toBe(true);
      expect(rules.slabs.every((slab) => Object.isFrozen(slab))).toBe(true);
      expect(Object.isFrozen(rules.source)).toBe(true);
    }
  });
});
