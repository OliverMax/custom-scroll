export default function linear(
    distance: number,
    callback: (value: number) => void,
    STEP = 3,
): Promise<void> {
    let animationId: null | number = null;
    let animationProgress = 0;

    window.onwheel = stopAnimation;

    const recursion = (resolve = () => {}) => {
        animationProgress += STEP;

        if (animationProgress < 100) {
            callback((distance * animationProgress) / 100);
            animationId = requestAnimationFrame(() => recursion(resolve));
        } else {
            callback(distance);
            resolve();
            stopAnimation();
        }
    };

    function stopAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }

    return new Promise(recursion);
}
