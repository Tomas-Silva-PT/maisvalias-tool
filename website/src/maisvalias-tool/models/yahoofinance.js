var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AllOriginsProxy } from "./proxies/AllOriginsProxy";
class YahooFinance {
    static _splitIntervalByYear(startDate, endDate) {
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
    static _convertTimeZone(date, timezone) {
        return new Date(date.toLocaleString("en-US", { timeZone: timezone }));
    }
    static getExchangeRateBatch(fromCurrency, toCurrency, fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Getting exchange rate batch...");
            const ticker = `${fromCurrency}${toCurrency}=X`;
            let exchangeRates = [];
            // Divide the interval into years
            const intervals = this._splitIntervalByYear(new Date(fromDate), new Date(toDate));
            if (intervals.length > 0) { }
            //console.log("Intervals: " + JSON.stringify(intervals));
            for (let interval of intervals) {
                // Yahoo uses dates in the Europe/London timezone, so we have to convert the dates accordingly (Europe/Lisbon -> Europe/London)
                //console.log("[before] From: " + interval.from + ", To: " + interval.to);
                const from = new Date(interval.from.toUTCString()); //this._convertTimeZone(new Date(interval.from), "Europe/London");
                const to = new Date(interval.to.toUTCString()); //this._convertTimeZone(new Date(interval.to), "Europe/London");
                to.setDate(to.getDate() + 1);
                let unixFromDate = Math.floor(from.getTime() / 1000);
                let unixToDate = Math.floor(to.getTime() / 1000);
                //console.log("[before] From: " + unixFromDate + ", To: " + unixToDate);
                let data;
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${unixFromDate}&period2=${unixToDate}&interval=1d`;
                try {
                    if (this.corsProblem) {
                        throw new Error("CORS problem");
                    }
                    let response = yield fetch(url);
                    data = yield response.json();
                }
                catch (error) {
                    this.corsProblem = true;
                    let proxy = new AllOriginsProxy();
                    data = yield proxy.get(url);
                    // data = await this._delayedFetch(url, 500, 10000);
                }
                if (data.contents)
                    data = JSON.parse(data.contents);
                // ZIP it
                const timestamps = data.chart.result[0].timestamp;
                const quotes = data.chart.result[0].indicators.quote[0];
                //console.log("Yahoo timestamps: " + timestamps);
                const zipped = timestamps.map((ts, index) => {
                    const date = new Date(ts * 1000);
                    //console.log("Timestamp: " + ts + ", Index: " + index + "Date: " + date);
                    return {
                        timestamp: ts,
                        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
                        open: quotes.open[index],
                        close: quotes.close[index],
                        high: quotes.high[index],
                        low: quotes.low[index]
                    };
                });
                exchangeRates = exchangeRates.concat(exchangeRates, zipped);
            }
            // console.log("Exchange Rates [Batch]: " + JSON.stringify(exchangeRates));
            // console.log("Mass Exchange Rate: " + JSON.stringify(zipped));
            return exchangeRates;
        });
    }
    static getExchangeRate(fromCurrency, toCurrency, date) {
        return __awaiter(this, void 0, void 0, function* () {
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
            try {
                if (this.corsProblem) {
                    throw new Error("CORS problem");
                }
                let response = yield fetch(url);
                data = yield response.json();
            }
            catch (error) {
                this.corsProblem = true;
                let proxy = new AllOriginsProxy();
                data = yield proxy.get(url);
                // data = await this._delayedFetch(url, 500, 10000);
            }
            if (data.contents)
                data = JSON.parse(data.contents);
            let exchangeRate = data["chart"]["result"][0]["indicators"]["quote"][0]["close"][0];
            return parseFloat(exchangeRate);
        });
    }
    static searchBatch(queries) {
        return __awaiter(this, void 0, void 0, function* () {
            let data;
            let query = queries.join(",");
            let url = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}&corsDomain=finance.yahoo.com`;
            // console.log("Searching...");
            try {
                if (this.corsProblem) {
                    throw new Error("CORS problem");
                }
                let response = yield fetch(url);
                data = yield response.json();
            }
            catch (error) {
                this.corsProblem = true;
                let proxy = new AllOriginsProxy();
                data = yield proxy.get(url);
                // data = await this._delayedFetch(url, 500, 10000);
            }
            return data;
        });
    }
    static search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let data;
            let url = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}&corsDomain=finance.yahoo.com`;
            console.log("Searching...");
            try {
                if (this.corsProblem) {
                    throw new Error("CORS problem");
                }
                // console.log("Query: " + query);
                let response = yield fetch(url);
                data = yield response.json();
            }
            catch (error) {
                this.corsProblem = true;
                // console.log("Query: " + query);
                let proxy = new AllOriginsProxy();
                data = yield proxy.get(url);
                // data = await this._delayedFetch(url, 500, 10000);
            }
            return data;
        });
    }
    static _delayedFetch(url, delay, fallbackDelay) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield new Promise((resolve) => setTimeout(resolve, delay));
                let response = yield fetch(url);
                let data = yield response.json();
                return data;
            }
            catch (error) {
                console.error("❌ Fetch failed:", error);
                console.warn("Retrying in 10 seconds...");
                yield new Promise((resolve) => setTimeout(resolve, fallbackDelay));
                return yield this._delayedFetch(url);
            }
        });
    }
    static getAssetTypeBatch(isins_1) {
        return __awaiter(this, arguments, void 0, function* (isins, BATCHSIZE = 7) {
            console.log("Getting asset type batch...");
            let assetTypes = {};
            for (let i = 0; i < isins.length; i += BATCHSIZE) {
                const batch = isins.slice(i, i + BATCHSIZE);
                let data = yield this.searchBatch(batch);
                if (data.contents)
                    data = JSON.parse(data.contents);
                data.quotes.forEach((quote, index) => {
                    assetTypes[isins[index + i]] = quote.quoteType;
                });
            }
            return assetTypes;
        });
    }
    static getAssetType(isin) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Getting asset type...");
            let data = yield this.search(isin);
            if (data.contents)
                data = JSON.parse(data.contents);
            // console.log("Quote Type: " + data.quotes[0].quoteType);
            return data.quotes[0].quoteType;
        });
    }
}
YahooFinance.corsProblem = false;
export { YahooFinance };
