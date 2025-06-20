import { YahooFinance } from "../models/yahoofinance.js";

async function testConnection() {
  try {
    const rate = await YahooFinance.getExchangeRateBatch('USD', 'EUR', ['2020-01-01', '2020-01-15']);
    if(!rate) {
      throw Error('Not found');
    }
    console.log('Exchange rates fetched successfully:', rate);
    process.exit(0); // Success
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    process.exit(1); // Failure
  }
}

testConnection();