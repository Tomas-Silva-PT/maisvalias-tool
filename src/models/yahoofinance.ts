import { DateTime } from "luxon";
import { AllOriginsProxy } from "./proxies/AllOriginsProxy.js";
import { Proxy } from "./proxies/Proxy.js";
import { YahooSynoProxy } from "./proxies/YahooSynoProxy.js";

type ExchangeRate = {
  "timestamp": number,
  "date": DateTime,
  "open": number,
  "close": number,
  "high": number,
  "low": number
}

type DateInterval = {
  year: number,
  from: DateTime,
  to: DateTime
}

class YahooFinance {
  static corsProblem = false;

  static proxies: Proxy[] = [new AllOriginsProxy(), new YahooSynoProxy()];
  static numRetriesCycles: number = 5;

  static _splitIntervalByYear(dates: DateTime[]) : DateInterval[] {
    const result : DateInterval[] = [];

    // Sort dates
    dates.sort((a, b) => a.toMillis() - b.toMillis());

    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    // console.log("Start Date: " + startDate + ", End Date: " + endDate);

    let current = startDate;

    while (current.toMillis() <= endDate.toMillis()) {
      const year = current.year;

      const startOfPeriod = current;
      const endOfYear = DateTime.local(year + 1, 1, 1); // Jan 1 of next year
      const endOfPeriod = endOfYear.toMillis() < endDate.toMillis() ? endOfYear : endDate;

      result.push({
        year,
        from: startOfPeriod,
        to: endOfPeriod,
      });

      // Move to the next period
      current = DateTime.fromMillis(endOfPeriod.toMillis()).plus({ days: 1 });
    }

    // console.log("Number of intervals: " + result.length);
    // console.log("Number of dates: " + dates.length);

    return result;
  }

  static async get(url: string): Promise<any> {
    let data;
    try {
      if (this.corsProblem) { throw new Error("CORS problem"); }
      let response = await fetch(url);
      data = await response.json();

    }
    catch (error) {
      this.corsProblem = true;
      let retries = 0;
      while (retries < this.proxies.length * this.numRetriesCycles) {
        const proxy = this.proxies[retries % this.proxies.length];
        try {
          data = await proxy.get(url);
          break;
        }
        catch (error) {
          console.warn(`Proxy failed: ${proxy.constructor.name}`, error);
        }
        retries++;
      }

      if (!data) throw new Error("All proxies failed to fetch the required data...");

    }
    if (data.contents) data = JSON.parse(data.contents);
    return data;
  }

  static async getExchangeRateBatch(fromCurrency: string, toCurrency: string, dates: DateTime[]): Promise<ExchangeRate[]> {
    // console.log("Getting exchange rate batch...");
    const ticker = `${fromCurrency}${toCurrency}=X`;

    let exchangeRates: ExchangeRate[] = [];

    // Divide the interval into years
    const intervals = this._splitIntervalByYear(dates);

    // Check: if no. intervals is bigger than the no. of dates. If yes, then it's better to make API calls for each date
    // We want to minimize the amount of API calls
    if (intervals.length < dates.length) {
      console.log("Fetching exchange rates by intervals...");
      for (let interval of intervals) {
        const from = interval.from;
        const to = interval.to;
        to.plus({ days: 1 });
        let unixFromDate = Math.floor(from.toMillis() / 1000);
        let unixToDate = Math.floor(to.toMillis() / 1000);
        let data;
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${unixFromDate}&period2=${unixToDate}&interval=1d`;
        data = await this.get(url);

        // ZIP it
        const timestamps = data.chart.result[0].timestamp;
        const quotes = data.chart.result[0].indicators.quote[0];

        //console.log("Yahoo timestamps: " + timestamps);

        const zipped: ExchangeRate[] = timestamps.map((ts: number, index: number) => {
          const date = new Date(ts * 1000);
          return {
            timestamp: ts,
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
            open: quotes.open[index],
            close: quotes.close[index],
            high: quotes.high[index],
            low: quotes.low[index]
          }
        });
        exchangeRates = exchangeRates.concat(exchangeRates, zipped);
      }
    } else {
      console.log("Fetching exchange rates by specific dates...");
      for (const date of dates) {
        let unixDate = Math.floor(date.toMillis() / 1000);
        let data;
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${unixDate}&period2=${unixDate}&interval=1d`;
        data = await this.get(url);

        // ZIP it
        const timestamps = data.chart.result[0].timestamp;
        const quotes = data.chart.result[0].indicators.quote[0];

        const zipped: ExchangeRate[] = timestamps.map((ts: number, index: number) => {
          const date = new Date(ts * 1000);
          return {
            timestamp: ts,
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
            open: quotes.open[index],
            close: quotes.close[index],
            high: quotes.high[index],
            low: quotes.low[index]
          }
        });
        exchangeRates = exchangeRates.concat(zipped);
      }
    }

    return exchangeRates;
  }

  static async getExchangeRate(fromCurrency: string, toCurrency: string, date: DateTime): Promise<number> {
    console.log("Getting exchange rate...");
    const ticker = `${fromCurrency}${toCurrency}=X`;
    // console.log("fromCurrency: " + fromCurrency + ", toCurrency: " + toCurrency + ", date: " + date);
    let exchangeDate = date;
    let nextExchangeDate = date.plus({ days: 1 });

    let unixDate = Math.floor(exchangeDate.toMillis() / 1000);
    let unixNextDate = Math.floor(nextExchangeDate.toMillis() / 1000);
    let data;
    let url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${unixDate}&period2=${unixNextDate}&interval=1d`;
    data = await this.get(url);
    let exchangeRate =
      data["chart"]["result"][0]["indicators"]["quote"][0]["close"][0];
    return parseFloat(exchangeRate);
  }

  static async searchBatch(queries: string[]): Promise<any> {
    let data;
    let query = queries.join(",");
    let url = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}&corsDomain=finance.yahoo.com`;
    data = await this.get(url);
    return data;
  }

  static async search(query: string): Promise<any> {
    let data;
    let url = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}&corsDomain=finance.yahoo.com`;
    console.log("Searching...");
    data = await this.get(url);
    return data;
  }

  static async _delayedFetch(url: string, delay?: number, fallbackDelay?: number): Promise<any> {
    try {
      await new Promise((resolve) => setTimeout(resolve, delay));
      let response = await fetch(url);
      let data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Fetch failed:", error);
      console.warn("Retrying in 10 seconds...");
      await new Promise((resolve) => setTimeout(resolve, fallbackDelay));
      return await this._delayedFetch(url);
    }
  }

  static async getAssetTypeBatch(isins: string[], BATCHSIZE: number = 7): Promise<Record<string, string>> {
    console.log("Getting asset type batch...");
    let assetTypes: Record<string, string> = {};
    for (let i = 0; i < isins.length; i += BATCHSIZE) {
      const batch = isins.slice(i, i + BATCHSIZE);
      let data = await this.searchBatch(batch);
      data.quotes.forEach((quote: any, index: number) => {
        assetTypes[isins[index + i]] = quote.quoteType;
      });
    }
    return assetTypes;
  }

  static async getAssetType(isin: string): Promise<string> {
    console.log("Getting asset type...");
    let data = await this.search(isin);
    // console.log("Quote Type: " + data.quotes[0].quoteType);
    return data.quotes[0].quoteType;
  }
}

export { YahooFinance, ExchangeRate };
