import has from "./has";

export default function pick<T extends object, K extends keyof T>(
  target: T,
  ...keys: K[]
) {
  return keys.reduce((acc, key) => {
    if (has(target, key, true)) {
      acc[key] = target[key];
    }

    return acc;
  }, {} as Pick<T, K>);
}
