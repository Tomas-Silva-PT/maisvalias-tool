import { AllOriginsProxy } from "./proxies/AllOriginsProxy.js";
import { Proxy } from "./proxies/Proxy.js";
import { YahooSynoProxy } from "./proxies/YahooSynoProxy.js";

type ExchangeRate = {
  "timestamp": number,
  "date": string,
  "open": number,
  "close": number,
  "high": number,
  "low": number
}

class YahooFinance {
  static corsProblem = false;

  static proxies: Proxy[] = [new AllOriginsProxy(), new YahooSynoProxy()];
  static numRetriesCycles : number = 5;

  static _splitIntervalByYear(startDate: Date, endDate: Date) {
    const result = [];

    let current = new Date(startDate);

    while (current <= endDate) {
      const year = current.getFullYear();

      const startOfPeriod = new Date(current);
      const endOfYear = new Date(year + 1, 0, 1); // Jan 1 of next year
      const endOfPeriod = new Date(Math.min(endOfYear.getTime(), endDate.getTime()));

      result.push({
        year,
        from: new Date(startOfPeriod),
        to: new Date(endOfPeriod),
      });

      // Move to the next period
      current = new Date(endOfPeriod.getTime());
      current.setDate(current.getDate() + 1); // next day
    }

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

  static async getExchangeRateBatch(fromCurrency: string, toCurrency: string, fromDate: string, toDate: string): Promise<ExchangeRate[]> {
    console.log("Getting exchange rate batch...");
    const ticker = `${fromCurrency}${toCurrency}=X`;

    let exchangeRates: ExchangeRate[] = [];

    // Divide the interval into years
    const intervals = this._splitIntervalByYear(new Date(fromDate), new Date(toDate));

    if (intervals.length > 0) { }

    //console.log("Intervals: " + JSON.stringify(intervals));
    for (let interval of intervals) {
      //console.log("[before] From: " + interval.from + ", To: " + interval.to);
      const from = new Date(interval.from.toUTCString())
      const to = new Date(interval.to.toUTCString())
      to.setDate(to.getDate() + 1);
      let unixFromDate = Math.floor(from.getTime() / 1000);
      let unixToDate = Math.floor(to.getTime() / 1000);
      //console.log("[before] From: " + unixFromDate + ", To: " + unixToDate);
      let data;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${unixFromDate}&period2=${unixToDate}&interval=1d`;
      data = await this.get(url);

      // ZIP it
      const timestamps = data.chart.result[0].timestamp;
      const quotes = data.chart.result[0].indicators.quote[0];

      //console.log("Yahoo timestamps: " + timestamps);

      const zipped: ExchangeRate[] = timestamps.map((ts: number, index: number) => {
        const date = new Date(ts * 1000);
        //console.log("Timestamp: " + ts + ", Index: " + index + "Date: " + date);
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


    // console.log("Exchange Rates [Batch]: " + JSON.stringify(exchangeRates));

    // console.log("Mass Exchange Rate: " + JSON.stringify(zipped));
    return exchangeRates;
  }

  static async getExchangeRate(fromCurrency: string, toCurrency: string, date: string): Promise<number> {
    console.log("Getting exchange rate...");
    const ticker = `${fromCurrency}${toCurrency}=X`;
    // console.log("fromCurrency: " + fromCurrency + ", toCurrency: " + toCurrency + ", date: " + date);
    let exchangeDate = new Date(date);
    let nextExchangeDate = new Date(date);
    nextExchangeDate.setDate(nextExchangeDate.getDate() + 1);

    let unixDate = Math.floor(exchangeDate.getTime() / 1000);
    let unixNextDate = Math.floor(nextExchangeDate.getTime() / 1000);
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
