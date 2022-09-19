// TODO: tests
// TODO: refactoring. split code

import { getDistance, getPosition, isFits } from '.';
import { axisRound } from '../helpers';

interface Settings {
  type?: 'none' | 'linear' | 'ease'
  alignY?: 'top' | 'center' | 'bottom'
  alignX?: 'left' | 'center' | 'right'
  ifNeed?: boolean
  container?: HTMLElement
}

// TODO: JSDoc
export default function customScroll(
  target: HTMLLIElement,
  settings?: Settings,
): Promise<void> | void {
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

  const scroll = target.parentElement!;

  const distance = getDistance(target, container);

  const {
    width: containerWidth,
    height: containerHeight,
  } = getPosition(container);

  const {
    width: targetWidth,
    height: targetHeight,
  } = getPosition(target);

  const { scrollWidth, scrollHeight } = scroll;
  
  const scrollOffset = getScrollOffset();

  const alignCorrection = getAlignCorrection();
  distance.x -= alignCorrection.x;
  distance.y -= alignCorrection.y;

  const destination = getDestination();

  //  correct distance depend on available scroll space
  if (destination.x < 0) {
    distance.x = -scrollOffset.left;
  }

  if (destination.y < 0) {
    distance.y = -scrollOffset.top;
  }

  if (distance.x > scrollOffset.right) {
    distance.x = scrollOffset.right;
  }

  if (distance.y > scrollOffset.bottom) {
    distance.y = scrollOffset.bottom;
  }

  distance.x = axisRound(distance.x);
  distance.y = axisRound(distance.y);
  
  if (distance.x !== 0 || distance.y !== 0) {
    const ANIMATION_STEP = 3;

    let animationId: null | number = null;
    let animationProgress = 0;

    container.onwheel = stopAnimation;

    switch (type) {
      case 'none': {
        scrollX(destination.x);
        scrollY(destination.y);
        break;
      }

      case 'linear': {
        const resolver = (resolve = () => {}) => {
          animationProgress += ANIMATION_STEP;

          if (animationProgress < 100) {
            scrollX(scrollOffset.left + (distance.x * animationProgress) / 100);
            scrollY(scrollOffset.top + (distance.y * animationProgress) / 100);

            animationId = requestAnimationFrame(() => resolver(resolve));
          } else {
            scrollX(destination.x);
            scrollY(destination.y);

            resolve();
            stopAnimation();
          }
        };

        return new Promise(resolver);
      }

      case 'ease': {
        // https://www.mathway.com/ru/Graph

        const getParabolaHeight = (percent: number) => 2 * Math.pow(percent, 2);
        const MAX_PARABOLA_HEIGHT = getParabolaHeight(100);

        // convert parabola height to percent
        const toPercent = (height: number) => (200 * height) / MAX_PARABOLA_HEIGHT; // TODO: rename

        let distancePercent;

        const resolver = (resolve = () => {}) => {
          animationProgress += ANIMATION_STEP;

          distancePercent = animationProgress <= 50
            ? toPercent(getParabolaHeight(animationProgress))
            : 50 + (50 - toPercent(getParabolaHeight(100 - animationProgress)));

          scrollX(scrollOffset.left + (distance.x * distancePercent) / 100);
          scrollY(scrollOffset.top + (distance.y * distancePercent) / 100);

          if (animationProgress < 100) {
            animationId = requestAnimationFrame(() => resolver(resolve));
          } else {
            resolve();
            stopAnimation();
          }
        };

        return new Promise(resolver);
      }
    }

    function stopAnimation() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    }
  }

  function getAlignCorrection() {
    let alignCorrectionX = 0,
        alignCorrectionY = 0;

    if (alignX === 'center') {
      alignCorrectionX = (containerWidth / 2) - (targetWidth / 2);
    } else if (alignX === 'right') {
      alignCorrectionX = containerWidth - targetWidth;
    }

    if (alignY === 'center') {
      alignCorrectionY = (containerHeight / 2) - (targetHeight / 2);
    } else if (alignY === 'bottom') {
      alignCorrectionY = containerHeight - targetHeight;
    }

    // round corrections. because can't be 0.5px
    return {
      x: Math.round(alignCorrectionX),
      y: Math.round(alignCorrectionY),
    };
  }

  function getScrollOffset() {
    const { x, y } = getDistance(container!, scroll);

    return {
      left: x,
      top: y,
      right: Math.abs(x + containerWidth - scrollWidth),
      bottom: Math.abs(y + containerHeight - scrollHeight),
    };
  }

  function getDestination() {
    return {
      x: scrollOffset.left + distance.x,
      y: scrollOffset.top + distance.y,
    };
  }

  function scrollX(value: number) {
    if (distance.x !== 0) {
      container!.scrollLeft = value;
    }
  }

  function scrollY(value: number) {
    if (distance.y !== 0) {
      container!.scrollTop = value;
    }
  }
};
