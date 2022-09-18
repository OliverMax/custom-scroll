// https://www.mathway.com/ru/Graph
import { isFits, getDistance, getPosition } from '.';

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

  const scrollDirection = getScrollDirection();
  const destination = getDestination();

  // TODO: correct distance depend on available scroll space

  if (scrollDirection.x || scrollDirection.y) {
    const STEP = 3;

    let rafId: null | number = null;
    let progress = 0;
  
    container.onwheel = stopAnimation;
  
    switch (type) {
      case 'none': {
        scrollX(destination.x);
        scrollY(destination.y);
        break;
      }
  
      case 'linear': {
        const resolver = (resolve = () => {}) => {
          progress += STEP;
  
          if (progress < 100) {
            scrollX(scrollOffsetX + (distanceX * progress) / 100);
            scrollY(scrollOffsetY + (distanceY * progress) / 100);
  
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
        const getParabolaHeight = (percent: number) => 2 * Math.pow(percent, 2);
        const MAX_PARABOLA_HEIGHT = getParabolaHeight(100);

        // convert parabola height to percent 
        const toPercent = (height: number) => (200 * height) / MAX_PARABOLA_HEIGHT;
        
        let distancePercent;

        const resolver = (resolve = () => {}) => {
          progress += STEP;
          
          distancePercent = progress <= 50
            ? toPercent(getParabolaHeight(progress))
            : 50 + (50 - toPercent(getParabolaHeight(100 - progress)));
          
          scrollX(scrollOffsetX + (distanceX * distancePercent) / 100);
          scrollY(scrollOffsetY + (distanceY * distancePercent) / 100);

          if (progress < 100) {
            rafId = requestAnimationFrame(() => resolver(resolve));
          } else {
            resolve();
            stopAnimation();
          }
        };

        return new Promise(resolver);
      }
    }

    function stopAnimation() {
      if (rafId) {
        cancelAnimationFrame(rafId);
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
