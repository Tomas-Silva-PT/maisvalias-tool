import { YahooFinance } from "../models/yahoofinance.js";

async function testConnection() {
  try {
    const rate = await YahooFinance.getExchangeRate('USD', 'EUR', '2025-05-15');
    console.log('Exchange rate fetched successfully:', rate);
    process.exit(0); // Success
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    process.exit(1); // Failure
  }
}

testConnection();