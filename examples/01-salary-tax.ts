import {calculateSalaryTax, getSupportedTaxYears} from '../dist/index.js';

// Same salary, every supported year: the API stays identical, the rules change.
for (const taxYear of getSupportedTaxYears()) {
  for (const annualSalary of [1_000_000, 3_000_000, 12_000_000]) {
    const r = calculateSalaryTax({annualSalary, taxYear});
    console.log(
      `${taxYear}  salary ${annualSalary.toLocaleString('en-PK')}  ` +
        `tax ${r.annualTax.toLocaleString('en-PK')}  ` +
        `(surcharge ${r.surcharge.toLocaleString('en-PK')})  ` +
        `effective ${(r.effectiveTaxRate * 100).toFixed(2)}%  ` +
        `marginal ${(r.marginalTaxRate * 100).toFixed(2)}%`
    );
  }
}
