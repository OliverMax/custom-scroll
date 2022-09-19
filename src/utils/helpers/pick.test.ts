import pick from "./pick";

const target = {
  a: 1,
  b: {
    c: 2,
  },
};

test('Pick object keys', () => {
  expect(pick(target, 'b')).toStrictEqual({ b: target.b });
});
