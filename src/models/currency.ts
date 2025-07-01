// import yf from "yahoo-finance2";
import { DateTime } from "luxon";
import { ExchangeRate, YahooFinance } from "./yahoofinance.js";

class Currency {
  buffer: any[];
  constructor() {
    this.buffer = [];
  }

  static async getExchangeRates(fromCurrency: string, toCurrency: string, dates : DateTime[]) : Promise<ExchangeRate[]> {
    const exchangeRates = await YahooFinance.getExchangeRateBatch(fromCurrency, toCurrency, dates);
    return exchangeRates;
  }

  async convert(value : number, fromCurrency : string, toCurrency : string, exchangeRateDate : DateTime) : Promise<number> {
    const buffered = this.buffer.find(
      (p) =>
        p[0] === fromCurrency &&
        p[1] === toCurrency &&
        p[2] === exchangeRateDate
    );
    if (buffered) {
      // console.log("Exchange Rate: " + buffered[3]);
      return value * buffered[3];
    }

    const exchangeRate : number = await YahooFinance.getExchangeRate(fromCurrency, toCurrency, exchangeRateDate);
    this.buffer.push([
      fromCurrency,
      toCurrency,
      exchangeRateDate,
      exchangeRate,
    ]);
    // console.log("Exchange Rate: " + exchangeRate);
    return value * exchangeRate;
  }
}

export { Currency };
