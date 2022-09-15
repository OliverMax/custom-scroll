import getPosition from './getPosition';

export default function isFits(
  target: HTMLElement,
  container: HTMLElement = document.body,
): boolean {
  const {
    top: targetTop,
    right: targetRight,
    bottom: targetBottom,
    left: targetLeft,
  } = getPosition(target);

  const {
    top: containerTop,
    right: containerRight,
    bottom: containerBottom,
    left: containerLeft,
  } = getPosition(container);

  return (
    targetLeft >= containerLeft &&
    targetRight <= containerRight &&
    targetTop >= containerTop &&
    targetBottom <= containerBottom
  );  
}
