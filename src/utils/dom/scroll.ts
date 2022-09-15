// TODO: скролить, пока есть куда. т.е. если после таргета ещё есть место
// TODO: должен возвращать промис
// TODO: время высчитывать исходя из расстояния

import { isFits, getDistance, getPosition } from './';

interface Settings {
  type?: 'none' | 'linear' | 'ease'
  alignY?: 'top' | 'center' | 'bottom'
  alignX?: 'left' | 'center' | 'right'
  ifNeed?: boolean
  container?: HTMLElement
};

export default function scroll(target: HTMLLIElement, settings?: Settings) {
  const {
    type,
    alignY,
    alignX,
    ifNeed,
    container, // TODO: add description -> scrollable container
  }: Settings = {
    type: 'none',
    alignY: 'top',
    alignX: 'left',
    ifNeed: true,
    container: document.body,
    ...settings,
  };

  if (ifNeed && isFits(target, container)) return;

  const {
    x: scrollOffsetX,
    y: scrollOffsetY,
  } = getDistance(container, target.parentElement!);

  let {
    x: distanceX,
    y: distanceY,
  } = getDistance(target, container);

  const {
    width: containerWidth,
    height: containerHeight,
  } = getPosition(container);

  const {
    width: targetWidth,
    height: targetHeight,
  } = getPosition(target);

  if (alignX === 'center') {
    distanceX -= (containerWidth / 2) - (targetWidth / 2);
  } else if (alignX === 'right') {
    distanceX -= containerWidth - targetWidth;
  }

  if (alignY === 'center') {
    distanceY -= (containerHeight / 2) - (targetHeight / 2);
  } else if (alignY === 'bottom') {
    distanceY -= containerHeight - targetHeight;
  }

  switch (type) {
    case 'none':
      container.scrollTop = scrollOffsetY + distanceY;
      container.scrollLeft = scrollOffsetX + distanceX;
      break;

    case 'linear':
      const STEP = 5;

      let progress = 0;
      let id: null | number = null;

      const r = () => {
        progress += STEP;

        if (progress < 100) {
          container.scrollLeft = scrollOffsetX + ((distanceX * progress) / 100);
          container.scrollTop = scrollOffsetY + ((distanceY * progress) / 100);

          id = requestAnimationFrame(r);
        } else if (id !== null) {
          container.scrollLeft = scrollOffsetX + distanceX;
          container.scrollTop = scrollOffsetY + distanceY;

          cancelAnimationFrame(id);
        }
      };

      r();

      break;

    case 'ease':
      break;
  }
};
