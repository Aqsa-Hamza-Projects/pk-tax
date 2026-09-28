# Examples

Runnable proof that `pk-tax` works from a plain build output, in all three
module systems.

Run all of them (builds first): `npm run examples`

| File                   | Demonstrates                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `01-salary-tax.ts`     | `calculateSalaryTax` across every supported tax year          |
| `02-monthly-salary.ts` | Monthly salary input, monthly tax and take-home               |
| `03-inspect-rules.ts`  | `getTaxSlabs`, `getTaxRules` and the FBR source metadata      |
| `04-error-handling.ts` | `isSupportedTaxYear`, `UnsupportedTaxYearError`, `PkTaxError` |
| `05-commonjs.cjs`      | Plain-JS `require()` (CommonJS) consumer proof                |
| `06-esm.mjs`           | Plain-JS `import` (ESM) consumer proof                        |
