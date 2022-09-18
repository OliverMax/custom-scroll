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

  const {
    x: scrollOffsetX,
    y: scrollOffsetY,
  } = getDistance(container, scroll);

  let {
    x: distanceX,
    y: distanceY,
  } = getDistance(target, container);

  const {
    left: containerX,
    top: containerY,
    width: containerWidth,
    height: containerHeight,
  } = getPosition(container);

  const {
    left: targetX,
    top: targetY,
    width: targetWidth,
    height: targetHeight,
  } = getPosition(target);

  const alignCorrection = getAlignCorrection();
  distanceX -= alignCorrection.x;
  distanceY -= alignCorrection.y;

  const destination = getDestination();

  // TODO: correct distance depend on available scroll space
  {
    // left
    if (destination.x < 0) {
      distanceX = -scrollOffsetX;
    }

    // top
    if (destination.y < 0) {
      distanceY = -scrollOffsetY;
    }

    // right
    // bottom
  }

  distanceX = axisRound(distanceX);
  distanceY = axisRound(distanceY);
  
  if (distanceX !== 0 || distanceY !== 0) {
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
            scrollX(scrollOffsetX + (distanceX * animationProgress) / 100);
            scrollY(scrollOffsetY + (distanceY * animationProgress) / 100);

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

          scrollX(scrollOffsetX + (distanceX * distancePercent) / 100);
          scrollY(scrollOffsetY + (distanceY * distancePercent) / 100);

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

  // @ts-ignore
  function getScrollSpace() {
    const { scrollWidth, scrollHeight } = scroll;

    const scrollSpaceLeft = targetX - containerX + scrollOffsetX;
    const scrollSpaceRight = scrollWidth - (scrollSpaceLeft + targetWidth);
    const scrollSpaceTop = targetY - containerY + scrollOffsetY;
    const scrollSpaceBottom = scrollHeight - (scrollSpaceTop + targetHeight);

    return {
      left: scrollSpaceLeft,
      top: scrollSpaceTop,
      right: scrollSpaceRight,
      bottom: scrollSpaceBottom,
    };
  }

  function getDestination() {
    return {
      x: scrollOffsetX + distanceX,
      y: scrollOffsetY + distanceY,
    };
  }

  function scrollX(distance: number) {
    if (distanceX !== 0) {
      container!.scrollLeft = distance;
    }
  }

  function scrollY(distance: number) {
    if (distanceY !== 0) {
      container!.scrollTop = distance;
    }
  }
};
