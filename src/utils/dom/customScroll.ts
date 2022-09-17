// TODO: split code, refactor
import { isFits, getDistance, getPosition } from '.';

interface Settings {
  type?: 'none' | 'linear' | 'ease'
  alignY?: 'top' | 'center' | 'bottom'
  alignX?: 'left' | 'center' | 'right'
  ifNeed?: boolean
  container?: HTMLElement
};

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

  const scrollDirection = getScrollDirection();
  const destination = getDestination();

  // correct distance depend on available scroll space
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
  }

  if (scrollDirection.x || scrollDirection.y) {
    const ANIMATION_STEP = 8;

    let rafId: null | number = null;
    let animationProgress = 0;
  
    container.onwheel = stopAnimation;
  
    switch (type) {
      case 'none': {
        scrollX(destination.x);
        scrollY(destination.y);
      }
  
      case 'linear': {
        const resolver = (resolve = () => {}) => {
          animationProgress += ANIMATION_STEP;
  
          if (animationProgress < 100) {
            // TODO?: replace by using destination instead full calculations
            scrollX(scrollOffsetX + ((distanceX * animationProgress) / 100));
            scrollY(scrollOffsetY + ((distanceY * animationProgress) / 100));
  
            rafId = requestAnimationFrame(() => resolver(resolve));
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
        // TODO
        break;
      }
    }

    function stopAnimation() {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    }
  }

  // fn's
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

  function getScrollDirection() {
    let x: null | 'left' | 'right' = null;
    let y: null | 'top' | 'bottom' = null;
    
    if (distanceX > 0) {
      x = 'right';
    } else if (distanceX < 0) {
      x = 'left';
    }
  
    if (distanceY < 0) {
      y = 'top';
    } else if (distanceY > 0) {
      y = 'bottom';
    }

    return { x, y };
  }

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
  };

  function getDestination() {
    return {
      x: scrollOffsetX + distanceX,
      y: scrollOffsetY + distanceY,
    };
  }

  function scrollX(distance: number) {
    if (scrollDirection.x && Math.abs(distanceX) > 0) {
      container!.scrollLeft = distance;
    }
  }

  function scrollY(distance: number) {
    if (scrollDirection.y && Math.abs(distanceY) > 0) {
      container!.scrollTop = distance;
    }
  }
};