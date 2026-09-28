import {calculateSalaryTax} from '../dist/index.js';

console.log(
  calculateSalaryTax({annualSalary: 3000000, taxYear: '2026-27'}).annualTax
);
