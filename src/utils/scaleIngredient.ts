const FRACTIONS: [number, string][] = [
  [0.125, '⅛'],
  [0.25,  '¼'],
  [0.333, '⅓'],
  [0.375, '⅜'],
  [0.5,   '½'],
  [0.625, '⅝'],
  [0.667, '⅔'],
  [0.75,  '¾'],
  [0.875, '⅞'],
];

export function formatFraction(value: number): string {
  if (value === 0) return '0';

  const whole = Math.floor(value);
  const decimal = value - whole;

  if (decimal < 0.0625) {
    return whole === 0 ? '0' : String(whole);
  }

  let closestFrac = '';
  let closestDiff = Infinity;

  for (const [frac, symbol] of FRACTIONS) {
    const diff = Math.abs(decimal - frac);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestFrac = symbol;
    }
  }

  if (closestDiff > 0.0625) {
    return value.toFixed(1);
  }

  if (whole === 0) return closestFrac;
  return `${whole}${closestFrac}`;
}

export function scaleIngredient(quantity: number, scale: number): string {
  const scaled = quantity * scale;
  return formatFraction(scaled);
}
