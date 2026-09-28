export const MONTHS_PER_YEAR = 12;

export function annualize(monthly: number): number {
  return monthly * MONTHS_PER_YEAR;
}

export function deannualize(annual: number): number {
  return annual / MONTHS_PER_YEAR;
}
