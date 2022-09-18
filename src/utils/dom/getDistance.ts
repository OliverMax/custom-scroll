import getPosition from './getPosition';

type Argument = HTMLElement | { x: number, y: number };

export default function getDistance(from: Argument, to: Argument) {
  let fromTop,
      fromLeft,
      toTop,
      toLeft;
  
  if (from instanceof HTMLElement) {
    ({ top: fromTop, left: fromLeft } = getPosition(from));
  } else {
    ({ x: fromTop, y: fromLeft } = from);
  }

  if (to instanceof HTMLElement) {
    ({ top: toTop, left: toLeft } = getPosition(to));
  } else {
    ({ x: toTop, y: toLeft } = to);
  }

  return {
    x: fromLeft - toLeft,
    y: fromTop - toTop,
  };
}
