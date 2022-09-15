export default function getPosition(target: HTMLElement) {
  const { top, right, bottom, left, width, height } = target.getBoundingClientRect();
  return { top, right, bottom, left, width, height };
}
