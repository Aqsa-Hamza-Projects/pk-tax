import type {SalaryTaxRules} from '../../types.js';

/**
 * Salaried individuals, tax year 2026-27 (FBR "Tax Year 2027").
 * Section 149 slabs from Division I, Part I of the First Schedule, as amended
 * by the Finance Act, 2026, which also withdrew the salaried surcharge.
 */
export const salaryRules2026_27: SalaryTaxRules = {
  country: 'PK',
  taxYear: '2026-27',
  taxpayerType: 'salaried',
  slabs: [
    {over: 0, upTo: 600_000, fixedTax: 0, rate: 0},
    {over: 600_000, upTo: 1_200_000, fixedTax: 0, rate: 0.01},
    {over: 1_200_000, upTo: 2_200_000, fixedTax: 6_000, rate: 0.11},
    {over: 2_200_000, upTo: 3_200_000, fixedTax: 116_000, rate: 0.2},
    {over: 3_200_000, upTo: 4_100_000, fixedTax: 316_000, rate: 0.25},
    {over: 4_100_000, upTo: 5_600_000, fixedTax: 541_000, rate: 0.29},
    {over: 5_600_000, upTo: 7_000_000, fixedTax: 976_000, rate: 0.32},
    {over: 7_000_000, upTo: null, fixedTax: 1_424_000, rate: 0.35},
  ],
  surcharge: null,
  source: {
    authority: 'FBR',
    document:
      'Withholding Income Tax Rate Card, updated up to June 30, 2026 as per Finance Act, 2026',
    url: 'https://download1.fbr.gov.pk/Docs/202681113864992WithholdingTaxRatesCard2027.pdf',
    legislation: 'Finance Act, 2026',
    officialTaxYear: 2027,
    effectiveFrom: '2026-07-01',
    effectiveTo: '2027-06-30',
  },
};
