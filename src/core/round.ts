/**
 * Rounds a non-negative rupee amount to 2 decimal places, half-up.
 *
 * Binary floats carry noise (0.35 × 5,900,001 + 616,000 evaluates to
 * 2681000.3499999996), so the value is first trimmed to 15 significant digits.
 * That keeps a true half-paisa from rounding down.
 */
export function roundMoney(amount: number): number {
  const paisa = Number((amount * 100).toPrecision(15));
  return Math.round(paisa) / 100;
}
