import { isFits, getDistance, getPosition } from './';

interface Settings {
  type?: 'none' | 'linear' | 'ease'
  alignY?: 'top' | 'center' | 'bottom'
  alignX?: 'left' | 'center' | 'right'
  ifNeed?: boolean
  container?: HTMLElement
};

export default function scroll(
  target: HTMLLIElement,
  settings?: Settings,
): Promise<void> | undefined | void {
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

  // !FIXME: сделать поправку на оставшееся место после блока
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

  const ANIMATION_STEP = 8;

  let animationId: null | number = null;
  let animationProgress = 0;

  // TODO: остановить скролл, если юзер начал скролить
  // TODO: rename
  const scrollToDestination = () => {
    container.scrollTop = scrollOffsetY + distanceY;
    container.scrollLeft = scrollOffsetX + distanceX;
  };

  switch (type) {
    case 'none': {
      return scrollToDestination();
    }

    case 'linear': {
      const resolver = (resolve = () => {}) => {
        animationProgress += ANIMATION_STEP;

        if (animationProgress < 100) {
          container.scrollLeft = scrollOffsetX + ((distanceX * animationProgress) / 100);
          container.scrollTop = scrollOffsetY + ((distanceY * animationProgress) / 100);

          animationId = requestAnimationFrame(() => resolver(resolve));
        } else if (animationId !== null) {
          scrollToDestination();
          resolve();
          cancelAnimationFrame(animationId);
        }
      };

      return new Promise(resolver);
    }

    case 'ease': {
      // TODO
      break;
    }
  }
};
