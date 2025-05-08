var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class YahooFinance {
    static getExchangeRate(fromCurrency, toCurrency, date) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Getting exchange rate...");
            const ticker = `${fromCurrency}${toCurrency}=X`;
            let exchangeDate = new Date(date);
            let nextExchangeDate = new Date(date);
            nextExchangeDate.setDate(nextExchangeDate.getDate() + 1);
            let unixDate = Math.floor(exchangeDate.getTime() / 1000);
            let unixNextDate = Math.floor(nextExchangeDate.getTime() / 1000);
            let data;
            let url;
            try {
                if (this.corsProblem) {
                    throw new Error("CORS problem");
                }
                url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${unixDate}&period2=${unixNextDate}&interval=1d`;
                let response = yield fetch(url);
                data = yield response.json();
            }
            catch (error) {
                this.corsProblem = true;
                url =
                    "https://api.allorigins.win/get?url=" +
                        encodeURIComponent("https://query1.finance.yahoo.com/v8/finance/chart/" +
                            ticker +
                            "?period1=" +
                            unixDate +
                            "&period2=" +
                            unixDate +
                            "&interval=1d");
                data = yield this._delayedFetch(url, 500, 10000);
            }
            if (data.contents)
                data = JSON.parse(data.contents);
            let exchangeRate = data["chart"]["result"][0]["indicators"]["quote"][0]["close"][0];
            return parseFloat(exchangeRate);
        });
    }
    static search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let data;
            let url;
            console.log("Searching...");
            try {
                if (this.corsProblem) {
                    throw new Error("CORS problem");
                }
                console.log("Query: " + query);
                url = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}`; //&lang=pt-BR&region=BR&corsDomain=finance.yahoo.com&callback=`;
                let response = yield fetch(url);
                data = yield response.json();
            }
            catch (error) {
                this.corsProblem = true;
                console.log("Query: " + query);
                url =
                    "https://api.allorigins.win/get?url=" +
                        encodeURIComponent("https://query2.finance.yahoo.com/v1/finance/search?q=" + query);
                data = yield this._delayedFetch(url, 500, 10000);
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
    static getAssetType(isin) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Getting asset type...");
            let data = yield this.search(isin);
            if (data.contents)
                data = JSON.parse(data.contents);
            return data.quotes[0].quoteType;
        });
    }
}
YahooFinance.corsProblem = false;
export { YahooFinance };
