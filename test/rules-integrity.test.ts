import {describe, it, expect} from 'vitest';
import {
  listSalaryTaxYears,
  resolveSalaryRules,
} from '../src/pakistan/salary/index.js';

describe.each(listSalaryTaxYears())('%s rule set', (taxYear) => {
  const rules = resolveSalaryRules(taxYear);
  const startYear = Number(taxYear.slice(0, 4));

  it('identifies itself', () => {
    expect(rules.country).toBe('PK');
    expect(rules.taxYear).toBe(taxYear);
    expect(rules.taxpayerType).toBe('salaried');
  });

  it('starts at 0 and ends open-ended', () => {
    expect(rules.slabs[0]?.over).toBe(0);
    expect(rules.slabs.at(-1)?.upTo).toBeNull();
    expect(rules.slabs.slice(0, -1).every((s) => s.upTo !== null)).toBe(true);
  });

  it('has contiguous, ascending slabs', () => {
    for (let i = 1; i < rules.slabs.length; i++) {
      const previous = rules.slabs[i - 1];
      const current = rules.slabs[i];
      expect(current?.over).toBe(previous?.upTo);
      expect(current?.over).toBeGreaterThan(previous?.over ?? Infinity);
    }
  });

  it('has rates between 0 and 1', () => {
    for (const slab of rules.slabs) {
      expect(slab.rate).toBeGreaterThanOrEqual(0);
      expect(slab.rate).toBeLessThanOrEqual(1);
    }
  });

  it('has each fixedTax equal to the tax accumulated below it', () => {
    let accumulated = 0;
    for (const slab of rules.slabs) {
      expect(slab.fixedTax).toBeCloseTo(accumulated, 6);
      if (slab.upTo !== null)
        accumulated += slab.rate * (slab.upTo - slab.over);
    }
  });

  it('has a valid surcharge rule or none', () => {
    if (rules.surcharge === null) return;
    expect(rules.surcharge.rate).toBeGreaterThan(0);
    expect(rules.surcharge.rate).toBeLessThan(1);
    expect(rules.surcharge.incomeThreshold).toBeGreaterThan(0);
  });

  it('records an FBR source whose dates match the tax year', () => {
    expect(rules.source.authority).toBe('FBR');
    expect(rules.source.url).toMatch(/^https:\/\/download1\.fbr\.gov\.pk\//);
    expect(rules.source.document.length).toBeGreaterThan(0);
    expect(rules.source.legislation).toBe(`Finance Act, ${startYear}`);
    expect(rules.source.officialTaxYear).toBe(startYear + 1);
    expect(rules.source.effectiveFrom).toBe(`${startYear}-07-01`);
    expect(rules.source.effectiveTo).toBe(`${startYear + 1}-06-30`);
  });
});

describe('year-specific facts', () => {
  it('2025-26 has six slabs and a 9% surcharge above Rs 10M', () => {
    const rules = resolveSalaryRules('2025-26');
    expect(rules.slabs).toHaveLength(6);
    expect(rules.surcharge).toEqual({rate: 0.09, incomeThreshold: 10_000_000});
  });

  it('2026-27 has eight slabs and no surcharge', () => {
    const rules = resolveSalaryRules('2026-27');
    expect(rules.slabs).toHaveLength(8);
    expect(rules.surcharge).toBeNull();
  });
});
