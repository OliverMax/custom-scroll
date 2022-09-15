export default function asyncRaf(callback = () => {}): Promise<void> {
  let id: null | number = null;

  const resolver = (resolve = () => {}) => {
    callback();
    // id = requestAnimationFrame(() => resolver(resolve));
  
    // cancelAnimationFrame(el.animationId);
    // resolve();
  };

  return new Promise(resolver);
}
