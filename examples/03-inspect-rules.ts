import {getTaxRules, getTaxSlabs} from '../dist/index.js';

console.table(getTaxSlabs({taxYear: '2026-27'}));

const rules = getTaxRules('2025-26');
console.log('2025-26 surcharge:', rules.surcharge);
console.log('2025-26 source   :', rules.source);
