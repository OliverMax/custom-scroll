export default function axisRound(value: number) {
  if (value === 0) return value;
  
  return Math[value > 0 ? 'floor' : 'ceil'](value);
}
