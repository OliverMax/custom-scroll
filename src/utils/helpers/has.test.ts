import has from './has';

const target = {
  a: 1,
};

// @ts-ignore
Object.prototype.b = 4;

describe('Object has property', () => {
  test('object has property', () => {
    expect(has(target, 'a')).toBe(true);
  });

  test('object hasn\'t property', () => {
    expect(has(target, 'c')).toBe(false);
  });

  test('object has property in prototype', () => {
    expect(has(target, 'b', true)).toBe(true);
  });

  test('object hasn\'t property in prototype', () => {
    expect(has(target, 'c', true)).toBe(false);
  });
});
