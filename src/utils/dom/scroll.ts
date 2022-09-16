// TODO: split code

import { isFits, getDistance, getPosition } from './';

interface Settings {
  type?: 'none' | 'linear' | 'ease'
  alignY?: 'top' | 'center' | 'bottom'
  alignX?: 'left' | 'center' | 'right'
  ifNeed?: boolean
  container?: HTMLElement
};

type ScrollDirectionX = 'left' | 'right';
type ScrollDirectionY = 'top' | 'bottom';

// TODO: JSDoc
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

  const {
    scrollWidth,
    scrollHeight,
  } = target.parentElement!;

  const scrollSpaceLeft = targetX - containerX + scrollOffsetX;
  const scrollSpaceRight = scrollWidth - (scrollSpaceLeft + targetWidth);
  const scrollSpaceTop = targetY - containerY + scrollOffsetY;
  const scrollSpaceBottom = scrollHeight - (scrollSpaceTop + targetHeight);

  // corrections depends on align
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
  alignCorrectionX = Math.round(alignCorrectionX);
  alignCorrectionY = Math.round(alignCorrectionY);

  // apply align corrections
  distanceX -= alignCorrectionX;
  distanceY -= alignCorrectionY;

  // define scroll direction
  let SCROLL_DIRECTION_X: null | ScrollDirectionX = null;
  let SCROLL_DIRECTION_Y: null | ScrollDirectionY = null;
  
  if (distanceX > 0) {
    SCROLL_DIRECTION_X = 'right';
  } else if (distanceX < 0) {
    SCROLL_DIRECTION_X = 'left';
  }

  if (distanceY < 0) {
    SCROLL_DIRECTION_Y = 'top';
  } else if (distanceY > 0) {
    SCROLL_DIRECTION_Y = 'bottom';
  }

  // !FIXME: сделать поправку на оставшееся место после блока
  // correct distance depends on available scroll space

  if (SCROLL_DIRECTION_X || SCROLL_DIRECTION_Y) {
    const ANIMATION_STEP = 8;

    let animationId: null | number = null;
    let animationProgress = 0;
  
    // TODO: остановить скролл, если юзер начал скролить
  
    switch (type) {
      case 'none': {
        container.scrollTop = scrollOffsetY + distanceY;
        container.scrollLeft = scrollOffsetX + distanceX;
      }
  
      case 'linear': {
        // TODO: debounce. чекнуть флаг - вызывать или нет
        // TODO: можно остановить анимацию - отменой промиса
  
        const resolver = (resolve = () => {}) => {
          console.log('+');
          animationProgress += ANIMATION_STEP;
  
          if (animationProgress < 100) {
            container.scrollLeft = scrollOffsetX + ((distanceX * animationProgress) / 100);
            container.scrollTop = scrollOffsetY + ((distanceY * animationProgress) / 100);
  
            animationId = requestAnimationFrame(() => resolver(resolve));
          } else if (animationId !== null) {
            container.scrollTop = scrollOffsetY + distanceY;
            container.scrollLeft = scrollOffsetX + distanceX;
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
  }
};
