# Changelog

All notable changes to **pk-tax**.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**How to maintain this file:** on each release, add a new
`## [x.y.z] — YYYY-MM-DD` section on top (matching the `package.json` bump),
grouped into _Added_ / _Changed_ / _Fixed_ / _Removed_. A release that adds or
corrects tax rules must say which tax year changed and cite the FBR source.

## [Unreleased]

## [0.0.2] — 2026-09-28

### Added

- README **Examples** section: a payslip (monthly tax and take-home), the
  same salary compared across tax years, a tax-year picker for user input,
  printing the slab table, and handling errors in a form — plus links to the
  runnable scripts in `examples/`.
- README install commands for pnpm, yarn and bun, and a note on ESM and
  CommonJS usage.

### Fixed

- `require('pk-tax/package.json')` (and the ESM equivalent) now works. The
  `exports` map only exposed `"."`, so tooling that reads a dependency's
  `package.json` — version checkers, React Native's Metro, some bundler
  plugins — failed with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

## [0.0.1] — 2026-09-28

First release.

### Added

- `calculateSalaryTax({annualSalary | monthlySalary, taxYear})` — salaried
  income tax with base tax, surcharge, annual and monthly tax, annual and
  monthly net income, effective and marginal rate, and the slab applied.
- `getTaxSlabs`, `getTaxRules`, `getSupportedTaxYears`, `isSupportedTaxYear`.
- `MAX_ANNUAL_INCOME` (Rs 1 trillion): larger incomes throw
  `InvalidIncomeError` rather than return a result that has lost paisa
  precision.
- Typed errors: `PkTaxError`, `UnsupportedTaxYearError`, `InvalidIncomeError`,
  `InvalidInputError`, each with a stable `code` and a fixed `name` that
  survives minification. `instanceof` also matches errors thrown by a second
  copy of the package (e.g. the CJS and ESM builds loaded side by side).
- Tax-year rule sets:
  - **2025-26** (FBR Tax Year 2026, Finance Act 2025): six slabs, 0–35%, plus
    the 9% salaried surcharge above Rs 10,000,000.
    Source: [FBR Withholding Tax Rate Card, June 2025](https://download1.fbr.gov.pk/Docs/20258181281745641WHT-RateCard.pdf).
  - **2026-27** (FBR Tax Year 2027, Finance Act 2026): eight slabs, 0–35%, no
    salaried surcharge.
    Source: [FBR Withholding Tax Rate Card, June 2026](https://download1.fbr.gov.pk/Docs/202681113864992WithholdingTaxRatesCard2027.pdf).
- Dual ESM + CJS build via tsup, `.d.ts`/`.d.cts` declarations, zero runtime
  dependencies.
