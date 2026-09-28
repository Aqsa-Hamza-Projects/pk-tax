const {calculateSalaryTax} = require('../dist/index.cjs');

console.log(
  calculateSalaryTax({annualSalary: 3000000, taxYear: '2026-27'}).annualTax
);
