import { YahooFinance } from "../models/yahoofinance.js";

async function testConnection() {
  try {
    const assetType = await YahooFinance.getAssetType('XDWD');
    if(!assetType) {
      throw Error('Not found');
    } else if (assetType !== 'ETF') {
      throw Error('Could identify it as an ETF');
    }
    console.log('Asset type fetched successfully:', assetType);
    process.exit(0); // Success
  } catch (error) {
    console.error('Failed to fetch asset type:', error);
    process.exit(1); // Failure
  }
}

testConnection();