function processOddEven(data) {
    const { total_score } = data?.predictscore || {};
    if (typeof total_score !== 'number') return { error: 'Invalid score data' };

    const result = total_score % 2 === 0 ? 'Even' : 'Odd';
    return {
        market: 'odd-even',
        value: result,
        total_score,
    };
}

module.exports = { processOddEven };