import {describe, it, expect, beforeAll} from 'vitest';
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const run = (cmd: string, args: string[]) =>
  execFileSync(cmd, args, {cwd: root, stdio: 'pipe'}).toString();

describe('examples', () => {
  beforeAll(() => {
    if (!existsSync(new URL('../dist/index.js', import.meta.url))) {
      execFileSync('npm', ['run', 'build'], {cwd: root, stdio: 'pipe'});
    }
  }, 120_000);

  it.each([
    'examples/01-salary-tax.ts',
    'examples/02-monthly-salary.ts',
    'examples/03-inspect-rules.ts',
    'examples/04-error-handling.ts',
  ])('%s runs and exits 0 (TypeScript via tsx)', (file) => {
    expect(() => run('npx', ['tsx', file])).not.toThrow();
  });

  it('05-commonjs.cjs computes the right tax via require()', () => {
    expect(run('node', ['examples/05-commonjs.cjs'])).toContain('276000');
  });

  it('errors from the CJS build match the ESM build via instanceof', () => {
    const script = [
      "import * as esm from './dist/index.js';",
      "import {createRequire} from 'node:module';",
      "const cjs = createRequire(import.meta.url)('./dist/index.cjs');",
      "try { cjs.calculateSalaryTax({annualSalary: 1, taxYear: 'x'}); }",
      'catch (e) { console.log(e instanceof esm.UnsupportedTaxYearError); }',
    ].join('\n');
    expect(run('node', ['--input-type=module', '-e', script]).trim()).toBe(
      'true'
    );
  });

  it('06-esm.mjs computes the right tax via import', () => {
    expect(run('node', ['examples/06-esm.mjs'])).toContain('276000');
  });
});
