export default function has(
  target: object,
  key: string | number | symbol,
  deep = false,
): boolean {
  return deep
    ? key in target
    : Object.prototype.hasOwnProperty.call(target, key);
}
