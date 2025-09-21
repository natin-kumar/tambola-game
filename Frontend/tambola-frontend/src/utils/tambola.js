// src/utils/tambola.js
import { shuffle } from 'lodash';

/**
 * Generates a single, valid Tambola ticket.
 * @returns {Array<Array<{value: number, clicked: boolean} | null>>}
 */
export const generateValidTicket = () => {
    // This is the same robust ticket generation logic you provided.
    // I've kept it as is because it's very well-written.
    const ticket = Array.from({ length: 3 }, () => Array(9).fill(null));
    const columnRanges = [
        [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
        [50, 59], [60, 69], [70, 79], [80, 90]
    ];
    let rowCounts = [0, 0, 0], colCounts = Array(9).fill(0);
    for (let c = 0; c < 9; c++) {
        let r;
        do { r = Math.floor(Math.random() * 3); } while (rowCounts[r] >= 5);
        ticket[r][c] = 0; rowCounts[r]++; colCounts[c]++;
    }
    for (let i = 0; i < 6; i++) {
        let r, c;
        do { r = Math.floor(Math.random() * 3); c = Math.floor(Math.random() * 9); }
        while (ticket[r][c] !== null || rowCounts[r] >= 5 || colCounts[c] >= 2);
        ticket[r][c] = 0; rowCounts[r]++; colCounts[c]++;
    }
    for (let c = 0; c < 9; c++) {
        const [min, max] = columnRanges[c];
        const possibleNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        const shuffledNumbers = shuffle(possibleNumbers);
        let numIndex = 0;
        for (let r = 0; r < 3; r++) {
            if (ticket[r][c] === 0) ticket[r][c] = shuffledNumbers[numIndex++];
        }
    }
    for (let c = 0; c < 9; c++) {
        const colValues = [];
        for (let r = 0; r < 3; r++) if (ticket[r][c] !== null) colValues.push(ticket[r][c]);
        colValues.sort((a, b) => a - b);
        let valIndex = 0;
        for (let r = 0; r < 3; r++) if (ticket[r][c] !== null) ticket[r][c] = colValues[valIndex++];
    }
    return ticket.map(row => row.map(num => (num ? { value: num, clicked: false } : null)));
};


// --- New Prize Validation Functions ---

const isNumberCalled = (num, calledNumbers) => calledNumbers.has(num.value);

export const validatePrize = (prize, ticket, calledNumbers) => {
    const ticketNumbers = ticket.flat().filter(Boolean);

    switch (prize) {
        case 'Early Five': {
            const clickedCount = ticketNumbers.filter(n => isNumberCalled(n, calledNumbers)).length;
            return clickedCount >= 5;
        }
        case 'Top Row': {
            const topRowNumbers = ticket[0].filter(Boolean);
            return topRowNumbers.every(n => isNumberCalled(n, calledNumbers));
        }
        case 'Middle Row': {
            const middleRowNumbers = ticket[1].filter(Boolean);
            return middleRowNumbers.every(n => isNumberCalled(n, calledNumbers));
        }
        case 'Bottom Row': {
            const bottomRowNumbers = ticket[2].filter(Boolean);
            return bottomRowNumbers.every(n => isNumberCalled(n, calledNumbers));
        }
        case 'All Corners': {
            const firstRow = ticket[0].filter(Boolean);
            const lastRow = ticket[2].filter(Boolean);
            const corners = [firstRow[0], firstRow[firstRow.length - 1], lastRow[0], lastRow[lastRow.length - 1]];
            return corners.every(c => c && isNumberCalled(c, calledNumbers));
        }
        case 'Full House': {
            return ticketNumbers.every(n => isNumberCalled(n, calledNumbers));
        }
        default:
            return false;
    }
};