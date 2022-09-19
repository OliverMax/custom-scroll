import keys from './keys';

const target = {
  a: 1,
  b: 2,
};

test('Return\'s object keys', () => {
  expect(keys(target)).toStrictEqual(['a', 'b']);
});
