export default function keys<T extends object>(target: T) {
  return Object.keys(target) as Array<keyof T>;
}
