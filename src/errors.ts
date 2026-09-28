import type {TaxYear} from './types.js';

export type PkTaxErrorCode =
  'UNSUPPORTED_TAX_YEAR' | 'INVALID_INCOME' | 'INVALID_INPUT';

// Symbol.for is shared across every copy of this package in one process, so
// an error from the CommonJS build still matches the ESM build's classes.
const BRAND = Symbol.for('pk-tax.error');

/** Base class for every error this package throws. */
export class PkTaxError extends Error {
  /**
   * The class's name as a string literal, not `Function.name`: consumers'
   * minifiers rename classes, and `error.name` must stay stable in their logs.
   */
  static readonly errorName: string = 'PkTaxError';

  readonly code: PkTaxErrorCode;

  constructor(code: PkTaxErrorCode, message: string) {
    super(message);
    this.name = (new.target as typeof PkTaxError).errorName;
    this.code = code;
    Object.defineProperty(this, BRAND, {value: true});
  }

  /**
   * Plain `instanceof` fails when an app loads two copies of pk-tax (its own
   * ESM import plus a dependency's `require()`), because each copy has its
   * own classes. Fall back to the shared brand and the error's name.
   */
  static override [Symbol.hasInstance](value: unknown): boolean {
    if (Function.prototype[Symbol.hasInstance].call(this, value)) return true;
    if (typeof value !== 'object' || value === null || !(BRAND in value)) {
      return false;
    }
    return (
      this.errorName === PkTaxError.errorName ||
      (value as {name?: unknown}).name === this.errorName
    );
  }
}

export class UnsupportedTaxYearError extends PkTaxError {
  static override readonly errorName: string = 'UnsupportedTaxYearError';

  readonly taxYear: unknown;
  readonly supportedTaxYears: readonly TaxYear[];

  constructor(taxYear: unknown, supportedTaxYears: readonly TaxYear[]) {
    super(
      'UNSUPPORTED_TAX_YEAR',
      `Unsupported tax year ${describeValue(taxYear)}. ` +
        `Supported tax years: ${supportedTaxYears.join(', ')}.`
    );
    this.taxYear = taxYear;
    this.supportedTaxYears = supportedTaxYears;
  }
}

export class InvalidIncomeError extends PkTaxError {
  static override readonly errorName: string = 'InvalidIncomeError';

  readonly value: unknown;

  /** `requirement` completes "<field> must be …". */
  constructor(
    field: string,
    value: unknown,
    requirement = 'a finite number >= 0'
  ) {
    super(
      'INVALID_INCOME',
      `${field} must be ${requirement}, got ${describeValue(value)}`
    );
    this.value = value;
  }
}

export class InvalidInputError extends PkTaxError {
  static override readonly errorName: string = 'InvalidInputError';

  constructor(message: string) {
    super('INVALID_INPUT', message);
  }
}

/** Renders any value for an error message without ever throwing. */
export function describeValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'bigint') return `${value}n`;
  // Objects are named by tag: String() throws on null-prototype objects, and
  // would print new String('2026-27') as a bare, valid-looking year.
  if (typeof value === 'object' && value !== null) {
    return Object.prototype.toString.call(value);
  }
  return String(value);
}
