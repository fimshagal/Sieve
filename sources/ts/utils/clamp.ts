export const clamp = (value: number, min: number, max: number) => {
    if (value < min) {
        value = min;
    }

    if (value > max) {
        value = max;
    }

    return value;
};