import { DateTime } from "luxon";
import { BaseApi } from "./baseapi";
import { ExchangeRate, ExchangeRateApi } from "./api";



class YahooFinance extends BaseApi implements ExchangeRateApi{

  async getExchangeRates(fromCurrency: string, toCurrency: string, dates: DateTime[]): Promise<ExchangeRate[]> {
    // console.log("Getting exchange rate batch...");
    const ticker = `${fromCurrency}${toCurrency}=X`;

    let exchangeRates: ExchangeRate[] = [];

    // Divide the interval into years
    const intervals = this._splitIntervalByYear(dates);

    // Check: if no. intervals is bigger than the no. of dates. If yes, then it's better to make API calls for each date
    // We want to minimize the amount of API calls
    if (intervals.length < dates.length) {
      console.log("[Yahoo] Fetching exchange rates by intervals...");
      for (let interval of intervals) {
        const from = this.adjustToBusinessDay(interval.from);
        const to = this.adjustToBusinessDay(interval.to);
        to.plus({ days: 1 });
        let unixFromDate = Math.floor(from.toMillis() / 1000);
        let unixToDate = Math.floor(to.toMillis() / 1000);
        let data;
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${unixFromDate}&period2=${unixToDate}&interval=1d`;
        data = await this.get(url);

        console.log(`[Yahoo] Data for ${ticker} from ${from} (${unixFromDate}) to ${to} (${unixToDate}): `, data);

        // ZIP it
        const timestamps = data.chart.result[0].timestamp;
        const quotes = data.chart.result[0].indicators.quote[0];

        if (!timestamps || !quotes) {
          console.warn(`[Yahoo] No data returned for ${ticker} from ${from} to ${to}. Skipping...`);
          throw new Error(`[Yahoo] No data returned for ${ticker} from ${from} to ${to}. Skipping...`);
        }

        //console.log("Yahoo timestamps: " + timestamps);

        const zipped: ExchangeRate[] = timestamps.map((ts: number, index: number) => {
          const date = new Date(ts * 1000);
          return {
            timestamp: ts,
            date: DateTime.fromISO(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`),
            // open: quotes.open[index],
            // close: quotes.close[index],
            // high: quotes.high[index],
            // low: quotes.low[index]
            value: quotes.close[index]
          }
        });
        exchangeRates = exchangeRates.concat(exchangeRates, zipped);
      }
    } else {
      console.log("[Yahoo] Fetching exchange rates by specific dates...");
      for (const date of dates) {
        let unixDate = Math.floor(this.adjustToBusinessDay(date).toMillis() / 1000);
        let data;
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${unixDate}&period2=${unixDate}&interval=1d`;
        data = await this.get(url);

        // ZIP it
        const timestamps = data.chart.result[0].timestamp;
        const quotes = data.chart.result[0].indicators.quote[0];

        if (!timestamps || !quotes) {
          console.warn(`[Yahoo] No data returned for ${ticker} from ${date} to ${date}. Skipping...`);
          throw new Error(`[Yahoo] No data returned for ${ticker} from ${date} to ${date}. Skipping...`);
        }

        const zipped: ExchangeRate[] = timestamps.map((ts: number, index: number) => {
          const date = new Date(ts * 1000);
          return {
            timestamp: ts,
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
            // open: quotes.open[index],
            // close: quotes.close[index],
            // high: quotes.high[index],
            // low: quotes.low[index]
            value: quotes.close[index]
          }
        });
        exchangeRates = exchangeRates.concat(zipped);
      }
    }

    return exchangeRates;
  }

  // async getExchangeRate(fromCurrency: string, toCurrency: string, date: DateTime): Promise<number> {
  //   console.log("Getting exchange rate...");
  //   const ticker = `${fromCurrency}${toCurrency}=X`;
  //   // console.log("fromCurrency: " + fromCurrency + ", toCurrency: " + toCurrency + ", date: " + date);
  //   let exchangeDate = this.adjustToBusinessDay(date);
  //   let nextExchangeDate = this.adjustToBusinessDay(date.plus({ days: 1 }));

  //   let unixDate = Math.floor(exchangeDate.toMillis() / 1000);
  //   let unixNextDate = Math.floor(nextExchangeDate.toMillis() / 1000);
  //   let data;
  //   let url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${unixDate}&period2=${unixNextDate}&interval=1d`;
  //   data = await this.get(url);
  //   let exchangeRate =
  //     data["chart"]["result"][0]["indicators"]["quote"][0]["close"][0];
  //   return parseFloat(exchangeRate);
  // }

  async searchBatch(queries: string[]): Promise<any> {
    let data;
    let query = queries.join(",");
    let url = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}&corsDomain=finance.yahoo.com`;
    data = await this.get(url);
    return data;
  }

  async search(query: string): Promise<any> {
    let data;
    let url = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}&corsDomain=finance.yahoo.com`;
    console.log("[Yahoo] Searching...");
    data = await this.get(url);
    return data;
  }

  async _delayedFetch(url: string, delay?: number, fallbackDelay?: number): Promise<any> {
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

  async getAssetTypeBatch(isins: string[], BATCHSIZE: number = 7): Promise<Record<string, string>> {
    console.log("[Yahoo] Getting asset type batch...");
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

  async getAssetType(isin: string): Promise<string> {
    console.log("[Yahoo] Getting asset type...");
    let data = await this.search(isin);
    // console.log("Quote Type: " + data.quotes[0].quoteType);
    return data.quotes[0].quoteType;
  }
}

export { YahooFinance, ExchangeRate };
