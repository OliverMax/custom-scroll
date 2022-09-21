export default function smooth(
    distance: number,
    callback: (value: number) => void,
    STEP = 3,
): Promise<void> {
    let animationId: null | number = null;
    let animationProgress = 0;

    window.onwheel = stopAnimation;

    const getParabolaHeight = (percent: number) => 2 * Math.pow(percent, 2);
    const MAX_PARABOLA_HEIGHT = getParabolaHeight(100);

    // convert parabola height to percent
    const heightToPercent = (height: number) => (200 * height) / MAX_PARABOLA_HEIGHT;

    let distancePercentage;

    const recursion = (resolve = () => {}) => {
        animationProgress += STEP;

        distancePercentage = animationProgress <= 50
            ? heightToPercent(getParabolaHeight(animationProgress))
            : 50 + (50 - heightToPercent(getParabolaHeight(100 - animationProgress)));

        callback((distance * distancePercentage) / 100);

        if (animationProgress < 100) {
            animationId = requestAnimationFrame(() => recursion(resolve));
        } else {
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
