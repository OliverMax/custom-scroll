import has from './has';

const target = {
  a: 1,
  b: 2,
  c: 3,
};

test('', () => {
  expect(has(target, 'a')).toBe(true);
});
