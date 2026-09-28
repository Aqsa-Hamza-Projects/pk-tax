import {calculateSalaryTax} from '../dist/index.js';

const result = calculateSalaryTax({monthlySalary: 250_000, taxYear: '2026-27'});

console.log('Monthly salary  :', 250_000);
console.log('Monthly tax     :', result.monthlyTax);
console.log('Monthly take-home:', result.monthlyNetIncome);
console.log('Full result     :', result);
