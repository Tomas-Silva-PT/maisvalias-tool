// import yf from "yahoo-finance2";
import { DateTime } from "luxon";
import { ExchangeRate, YahooFinance } from "./apis/yahoofinance.js";
import { BancoPortugal } from "./apis/bancoportugal.js";
import { ExchangeRateApiEngine } from "./apis/api.js";

const apiEngine = new ExchangeRateApiEngine([new BancoPortugal(), new YahooFinance()]);

class Currency {
  buffer: any[];
  constructor() {
    this.buffer = [];
  }

  static async getExchangeRates(fromCurrency: string, toCurrency: string, dates: DateTime[]): Promise<ExchangeRate[]> {
    const exchangeRates = await apiEngine.getExchangeRates(fromCurrency, toCurrency, dates);
    return exchangeRates;
  }

  async convert(value: number, fromCurrency: string, toCurrency: string, exchangeRateDate: DateTime): Promise<number> {
    const buffered = this.buffer.find(
      (p) =>
        p[0] === fromCurrency &&
        p[1] === toCurrency &&
        p[2] === exchangeRateDate
    );
    if (buffered) {
      // console.log("Value: " + value);
      // console.log("Using buffered exchange rate for " + fromCurrency + " to " + toCurrency + " on " + exchangeRateDate.toISODate());
      return value * buffered[3];
    }

    const rates = await apiEngine.getExchangeRates(fromCurrency, toCurrency, [exchangeRateDate]);
    console.log("Rates for " + exchangeRateDate.toISODate() + " and " + fromCurrency + " to " + toCurrency + ": " + JSON.stringify(rates));
    const exchangeRate = rates[0].value;

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
