# pk-tax

Pakistan income tax calculator for JavaScript and TypeScript. Salaried income
tax by **tax year**, with rules taken from FBR's published rate cards and
versioned as data — so the API stays the same while Pakistan's rules change
each budget.

- Tax years **2025-26** and **2026-27**, side by side
- Progressive slabs, the salaried surcharge, annual and monthly tax, net
  salary, effective and marginal rates
- Every rule set records its FBR source and effective dates
- Unsupported tax years throw — never a silent fallback to another year
- Zero runtime dependencies, ESM + CommonJS, fully typed

> **Disclaimer.** pk-tax is a software calculation aid. It is not an official
> FBR assessment, does not guarantee anyone's final tax liability and does not
> replace professional tax advice. Actual liability depends on taxpayer
> category, income sources, exemptions, deductions, credits, withholding and
> other facts this package does not model. Not affiliated with FBR.

## Install

```sh
npm install pk-tax
```

```sh
pnpm add pk-tax
```

```sh
yarn add pk-tax
```

```sh
bun add pk-tax
```

Works with both module systems — `import` gets the ES module build, `require()`
gets the CommonJS build, and TypeScript types resolve in every
`moduleResolution` mode (`node10`, `node16`, `bundler`):

```ts
import {calculateSalaryTax} from 'pk-tax'; // ESM
```

```js
const {calculateSalaryTax} = require('pk-tax'); // CommonJS
```

## Quick start

```ts
import {calculateSalaryTax} from 'pk-tax';

const result = calculateSalaryTax({
  annualSalary: 3_000_000,
  taxYear: '2026-27',
});
// {
//   taxYear: '2026-27',
//   taxpayerType: 'salaried',
//   grossIncome: 3000000,
//   taxableIncome: 3000000,
//   baseTax: 276000,
//   surcharge: 0,
//   annualTax: 276000,
//   monthlyTax: 23000,
//   annualNetIncome: 2724000,
//   monthlyNetIncome: 227000,
//   effectiveTaxRate: 0.092,
//   marginalTaxRate: 0.2,
//   slab: {over: 2200000, upTo: 3200000, fixedTax: 116000, rate: 0.2}
// }

calculateSalaryTax({monthlySalary: 250_000, taxYear: '2026-27'}); // same result
```

## Examples

### Payslip: monthly tax and take-home pay

```ts
import {calculateSalaryTax} from 'pk-tax';

const pkr = (n: number) => `Rs ${n.toLocaleString('en-PK')}`;
const r = calculateSalaryTax({monthlySalary: 350_000, taxYear: '2026-27'});

console.log(`Gross     ${pkr(350_000)}`); // Gross     Rs 350,000
console.log(`Tax       ${pkr(r.monthlyTax)}`); // Tax       Rs 47,500
console.log(`Take-home ${pkr(r.monthlyNetIncome)}`); // Take-home Rs 302,500
console.log(`${(r.effectiveTaxRate * 100).toFixed(2)}% effective`); // 13.57% effective
```

### Compare the same salary across tax years

```ts
import {calculateSalaryTax} from 'pk-tax';

for (const annualSalary of [1_800_000, 3_600_000, 6_000_000, 12_000_000]) {
  const before = calculateSalaryTax({annualSalary, taxYear: '2025-26'});
  const after = calculateSalaryTax({annualSalary, taxYear: '2026-27'});
  console.log(annualSalary, before.annualTax - after.annualTax);
}
// 1800000   0       — same slabs up to Rs 2.2M
// 3600000   50000
// 6000000   177000
// 12000000  511290  — includes the 2025-26 surcharge, withdrawn in 2026-27
```

### Tax year picker from user input

```ts
import {getSupportedTaxYears, isSupportedTaxYear} from 'pk-tax';

getSupportedTaxYears(); // ['2025-26', '2026-27'] — fill a <select> with these

const year = new URLSearchParams(location.search).get('year');
if (!isSupportedTaxYear(year)) {
  // '2027-28', 'abc', null … → ask the user to choose; never guess a year
}
```

### Show the slab table

```ts
import {getTaxRules, getTaxSlabs} from 'pk-tax';

for (const {over, upTo, rate} of getTaxSlabs({taxYear: '2026-27'})) {
  console.log(`${over} – ${upTo ?? 'and above'}: ${rate * 100}%`);
}
// 0 – 600000: 0%
// 600000 – 1200000: 1%
// …
// 7000000 – and above: 35%

getTaxRules('2026-27').source.url; // link your users to FBR's rate card
```

### Handle bad input in a form

```ts
import {calculateSalaryTax, PkTaxError} from 'pk-tax';

try {
  calculateSalaryTax({annualSalary: Number(form.salary), taxYear: form.year});
} catch (error) {
  if (!(error instanceof PkTaxError)) throw error;
  switch (error.code) {
    case 'INVALID_INCOME': // negative, NaN, or above Rs 1 trillion
    case 'UNSUPPORTED_TAX_YEAR': // e.g. '2027-28' before it is added
    case 'INVALID_INPUT': // no salary, or both annual and monthly
      showFieldError(error.message);
  }
}
```

### More runnable examples

The [`examples/`](https://github.com/Aqsa-Hamza-Projects/pk-tax/tree/main/examples)
folder on GitHub has complete scripts you can run with `npm run examples`:

| File                                                                                                            | Shows                                              |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| [`01-salary-tax.ts`](https://github.com/Aqsa-Hamza-Projects/pk-tax/blob/main/examples/01-salary-tax.ts)         | Three salaries across every supported tax year     |
| [`02-monthly-salary.ts`](https://github.com/Aqsa-Hamza-Projects/pk-tax/blob/main/examples/02-monthly-salary.ts) | Monthly salary input, monthly tax and take-home    |
| [`03-inspect-rules.ts`](https://github.com/Aqsa-Hamza-Projects/pk-tax/blob/main/examples/03-inspect-rules.ts)   | Slab table, surcharge rule and FBR source metadata |
| [`04-error-handling.ts`](https://github.com/Aqsa-Hamza-Projects/pk-tax/blob/main/examples/04-error-handling.ts) | Validating a tax year and catching typed errors    |
| [`05-commonjs.cjs`](https://github.com/Aqsa-Hamza-Projects/pk-tax/blob/main/examples/05-commonjs.cjs)           | Plain `require()` from CommonJS                    |
| [`06-esm.mjs`](https://github.com/Aqsa-Hamza-Projects/pk-tax/blob/main/examples/06-esm.mjs)                     | Plain `import` from an ES module                   |

## Supported tax years

Pakistan's tax year runs 1 July – 30 June. pk-tax names it `"2026-27"`; FBR
calls the same year "Tax Year 2027".

| `taxYear` | FBR name      | Law               | Slabs | Salaried surcharge            | Source                                                                                            |
| --------- | ------------- | ----------------- | ----- | ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `2025-26` | Tax Year 2026 | Finance Act, 2025 | 6     | 9% of tax above Rs 10,000,000 | [FBR rate card](https://download1.fbr.gov.pk/Docs/20258181281745641WHT-RateCard.pdf)              |
| `2026-27` | Tax Year 2027 | Finance Act, 2026 | 8     | none                          | [FBR rate card](https://download1.fbr.gov.pk/Docs/202681113864992WithholdingTaxRatesCard2027.pdf) |

## API

### `calculateSalaryTax(input)`

`input` is `{annualSalary, taxYear}` or `{monthlySalary, taxYear}` — exactly one
salary. A monthly salary is multiplied by 12 and taxed on the annual rules.

Annual income is capped at `MAX_ANNUAL_INCOME` (Rs 1 trillion, exported for
form validation). That is far above any real salary and keeps every amount
exact to the paisa; above it, `InvalidIncomeError` is thrown instead of an
imprecise result.

| Field              | Meaning                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `grossIncome`      | Annual gross salary                                                |
| `taxableIncome`    | Annual taxable income (equal to `grossIncome` — no deductions yet) |
| `baseTax`          | Tax from the slabs                                                 |
| `surcharge`        | Surcharge on the tax, when the year has one and it applies         |
| `annualTax`        | `baseTax + surcharge`                                              |
| `monthlyTax`       | `annualTax / 12`                                                   |
| `annualNetIncome`  | `grossIncome − annualTax`                                          |
| `monthlyNetIncome` | `annualNetIncome / 12`                                             |
| `effectiveTaxRate` | `annualTax / taxableIncome` (0 for zero income)                    |
| `marginalTaxRate`  | The applied slab's rate, surcharge included when it applies        |
| `slab`             | The slab that applied: `{over, upTo, fixedTax, rate}`              |

Rates are fractions (`0.2` = 20%). Rupee amounts are rounded to 2 decimal
places, half-up, after the whole calculation — never in between.

### `getTaxSlabs({taxYear, taxpayerType?})`

The slab table for a year. `taxpayerType` defaults to `'salaried'` (the only
type in this version). Each slab reads like the statute: for
`over < income ≤ upTo`, tax = `fixedTax + rate × (income − over)`; the last
slab has `upTo: null`.

### `getTaxRules(taxYear)`

The full rule set: slabs, surcharge rule and `source` (FBR document and URL,
Finance Act, FBR tax year, effective dates).

### `getSupportedTaxYears()` / `isSupportedTaxYear(value)`

The years this version supports, and a type guard for validating a year that
came from user input.

Everything these functions return is frozen.

## Things worth knowing

**Monthly figures are estimates.** `monthlyTax` assumes the same salary for the
whole year. Real payroll recomputes each month from year-to-date figures, so a
raise, bonus or mid-year join changes the actual deduction.

**The 2025-26 surcharge is a cliff.** In 2025-26 the 9% surcharge applies to
the _whole_ tax once income exceeds Rs 10,000,000, exactly as legislated:

| Annual salary (2025-26) | Tax          |
| ----------------------- | ------------ |
| Rs 10,000,000           | 2,681,000.00 |
| Rs 10,000,001           | 2,922,290.38 |

`marginalTaxRate` is the rate of the slab the income falls in, times
(1 + surcharge rate) when the surcharge applies to that income: 0.35 at exactly
Rs 10,000,000 and 0.3815 above it. It does not price the jump at the cliff
itself — at Rs 10,000,000 the next rupee costs about Rs 241,290.

The Finance Act 2026 withdrew this surcharge, so 2026-27 has no cliff.

## Errors

Every error extends `PkTaxError` and has a stable `code`:

| Class                     | `code`                 | Thrown when                                                                                      |
| ------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| `UnsupportedTaxYearError` | `UNSUPPORTED_TAX_YEAR` | The tax year has no rule set. Has `.taxYear` and `.supportedTaxYears`.                           |
| `InvalidIncomeError`      | `INVALID_INCOME`       | A salary is negative, `NaN`, infinite, not a number, or above `MAX_ANNUAL_INCOME`. Has `.value`. |
| `InvalidInputError`       | `INVALID_INPUT`        | Both or neither salary given, not an object, or unknown `taxpayerType`.                          |

```ts
import {calculateSalaryTax, UnsupportedTaxYearError} from 'pk-tax';

try {
  calculateSalaryTax({annualSalary: 3_000_000, taxYear: '2035-36' as never});
} catch (error) {
  if (error instanceof UnsupportedTaxYearError) {
    console.log(error.supportedTaxYears); // ['2025-26', '2026-27']
  }
}
```

`instanceof` also works when your app ends up with two copies of pk-tax — for
example your own `import` plus a dependency's `require()`, or two versions in
`node_modules`. Errors carry a shared brand, so a `PkTaxError` from either copy
matches the other copy's classes. `error.name` is a fixed string, so it
survives minification.

## Adding a new tax year

The engine does not change when the law does. For a new Finance Act:

1. Get FBR's rate card for the year and keep its URL.
2. Add `src/pakistan/salary/YYYY-YY.ts` with the slabs, surcharge (or `null`)
   and `source`.
3. Add the year to the `TaxYear` union in `src/types.ts` and to the registry in
   `src/pakistan/salary/index.ts` (the compiler flags a mismatch).
4. Add the year's hand-computed table to `test/fixtures/salary-expectations.ts`.
   Earlier years' tables must not change.
5. Update the supported-years table above and `CHANGELOG.md`; release a minor
   version.

## License

MIT © Aqsa LogicByte
