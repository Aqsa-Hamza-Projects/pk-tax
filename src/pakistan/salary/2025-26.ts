import type {SalaryTaxRules} from '../../types.js';

/**
 * Salaried individuals, tax year 2025-26 (FBR "Tax Year 2026").
 * Section 149 slabs from Division I, Part I of the First Schedule, and the 9%
 * salaried surcharge from the proviso to section 4AB, as amended by the
 * Finance Act, 2025.
 */
export const salaryRules2025_26: SalaryTaxRules = {
  country: 'PK',
  taxYear: '2025-26',
  taxpayerType: 'salaried',
  slabs: [
    {over: 0, upTo: 600_000, fixedTax: 0, rate: 0},
    {over: 600_000, upTo: 1_200_000, fixedTax: 0, rate: 0.01},
    {over: 1_200_000, upTo: 2_200_000, fixedTax: 6_000, rate: 0.11},
    {over: 2_200_000, upTo: 3_200_000, fixedTax: 116_000, rate: 0.23},
    {over: 3_200_000, upTo: 4_100_000, fixedTax: 346_000, rate: 0.3},
    {over: 4_100_000, upTo: null, fixedTax: 616_000, rate: 0.35},
  ],
  surcharge: {rate: 0.09, incomeThreshold: 10_000_000},
  source: {
    authority: 'FBR',
    document:
      'Withholding Income Tax Rate Card, updated up to June 30, 2025 as per Finance Act, 2025',
    url: 'https://download1.fbr.gov.pk/Docs/20258181281745641WHT-RateCard.pdf',
    legislation: 'Finance Act, 2025',
    officialTaxYear: 2026,
    effectiveFrom: '2025-07-01',
    effectiveTo: '2026-06-30',
  },
};
