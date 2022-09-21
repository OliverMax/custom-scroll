import { getDistance, getPosition, isFits } from '.';
import { axisRound } from '../helpers';
import { linear, smooth } from '../transitions';

interface Settings {
  type: 'none' | 'linear' | 'smooth'
  alignY: 'top' | 'center' | 'bottom'
  alignX: 'left' | 'center' | 'right'
  always: boolean
  target: HTMLElement
  container: HTMLElement
  scroll: HTMLElement
}

type SettingsWithoutNodes = Omit<Settings, 'target' | 'container' | 'scroll'>;
type OnlySettingsNodes = Pick<Settings, 'target' | 'container' | 'scroll'>;

const DEFAULT_SETTINGS: SettingsWithoutNodes = {
  type: 'smooth',
  alignY: 'center',
  alignX: 'center',
  always: false,
};

/**
 * Replacement of scrollIntoView logic
 * @param {Settings} settings
 * @param {Settings['type']} settings.type - scroll type
 * @param {Settings['alignY']} settings.alignY - vertical alignment
 * @param {Settings['alignX']} settings.alignX - horizontal alignment
 * @param {Settings['always']} settings.always - scroll even if the target is fully visible
 * @param {Settings['target']} settings.target - the target to which the scroll is applied
 * @param {Settings['container']} settings.container - the container relative to which the scroll occurs
 * @param {Settings['scroll']} settings.scroll - scrollable element
 *
 * @example - default settings
 * {
 *   type: 'smooth',
 *   alignY: 'center',
 *   alignX: 'center',
 *   always: false,
 * }
 */
export default function scrollToTarget(
    settings: Partial<SettingsWithoutNodes> & OnlySettingsNodes
): Promise<Awaited<void>[]> | void {
  const {
    type,
    alignY,
    alignX,
    always,
    container,
    scroll,
    target,
  }: Settings = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  if (!always && isFits(target, container)) return;

  // !WARN: Do not change the order of code execution

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

  const alignCorrection = getCorrectionByAligns();
  distance.x -= alignCorrection.x;
  distance.y -= alignCorrection.y;

  const destination = getDestination();

  applyCorrectionsBySides();

  distance.x = axisRound(distance.x);
  distance.y = axisRound(distance.y);

  if (distance.x !== 0 || distance.y !== 0) {
    switch (type) {
      case 'none': {
        scrollX(destination.x);
        scrollY(destination.y);
        break;
      }

      case 'linear': {
        return Promise.all([
          linear(distance.x, value => scrollX(scrollOffset.left + value)),
          linear(distance.y, value => scrollY(scrollOffset.top + value)),
        ]);
      }

      case 'smooth': {
        return Promise.all([
            smooth(distance.x, value => scrollX(scrollOffset.left + value)),
            smooth(distance.y, value => scrollY(scrollOffset.top + value)),
        ]);
      }
    }
  }

  function getCorrectionByAligns() {
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

  /**
   * Correct distance in case if scroll distance bigger than available scroll space.
   * Actual when target is close to sides: top, left, right, bottom
   */
  function applyCorrectionsBySides() {
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
  }

  function getScrollOffset() {
    let { x, y } = getDistance(container, scroll);

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
      container.scrollLeft = value;
    }
  }

  function scrollY(value: number) {
    if (distance.y !== 0) {
      container.scrollTop = value;
    }
  }
};
