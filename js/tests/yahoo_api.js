import yahooFinance from 'yahoo-finance2';

const query = 'EURUSD=X';
const queryOptions = { period1: '2024-02-01', period2: '2024-02-01' };
const result = await yahooFinance.chart(query, queryOptions);
console.log(result);