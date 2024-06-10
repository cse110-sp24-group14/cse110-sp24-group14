import { expect, describe, test } from '@jest/globals';

/**
 * Counts the consecutive days given an array of dates
 * 
 * @param {string[]} daysArr - array of all dates user visited the page
 * @returns {number} consecutiveDays - the number of consecutive days visited
 * 
 * @example
 * // counts the number of consecutive days visited for these 4 dates (should be 3)
 * countStreak(['2024-06-06', '2024-06-05', '2024-06-04', '2024-06-02'])
 */
const countStreak = (daysArr) => {

    let consecutiveDays = 1;

    // We want descending order to compare consecutive days
    daysArr.sort((a, b) => new Date(b) - new Date(a));

    // Increment consecutiveDays until there is > 1 day difference
    for (let i = 1; i < daysArr.length; i++) {

        const prevDate = new Date(daysArr[i]);
        const currentDate = new Date(daysArr[i - 1]);
        const diffInDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);

        if (diffInDays === 1) {
            consecutiveDays++;
        } else {
            break; // Break if the sequence of consecutive days is broken
        }
    }

    return consecutiveDays;
};

describe('countStreak', () => {
    test('should return the correct streak count', () => {
        const dates = [
            '2024-06-06',
            '2024-06-05',
            '2024-06-04',
            '2024-06-02'
        ];

        expect(countStreak(dates)).toBe(3);
    });

    test('should return 1 for non-consecutive days', () => {
        const dates = [
            '2024-06-06',
            '2024-06-04',
            '2024-06-02'
        ];

        expect(countStreak(dates)).toBe(1);
    });
});