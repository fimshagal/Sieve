export const getHarmonyAverage = (array: number[]): number => {
    if (!array.length) return 0;

    let amount = 0;

    for (let item of array) {
        if (item === 0) return 0;
        amount += 1 / item;
    }

    return array.length / amount;
};