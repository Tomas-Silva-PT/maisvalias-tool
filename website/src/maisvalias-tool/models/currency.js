var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// import yf from "yahoo-finance2";
import { YahooFinance } from "./yahoofinance.js";
class Currency {
    constructor() {
        this.buffer = [];
    }
    static getExchangeRates(fromCurrency, toCurrency, fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const exchangeRates = yield YahooFinance.getExchangeRateBatch(fromCurrency, toCurrency, fromDate, toDate);
            return exchangeRates;
        });
    }
    convert(value, fromCurrency, toCurrency, exchangeRateDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffered = this.buffer.find((p) => p[0] === fromCurrency &&
                p[1] === toCurrency &&
                p[2] === exchangeRateDate);
            if (buffered) {
                // console.log("Exchange Rate: " + buffered[3]);
                return value * buffered[3];
            }
            const exchangeRate = yield YahooFinance.getExchangeRate(fromCurrency, toCurrency, exchangeRateDate);
            this.buffer.push([
                fromCurrency,
                toCurrency,
                exchangeRateDate,
                exchangeRate,
            ]);
            // console.log("Exchange Rate: " + exchangeRate);
            return value * exchangeRate;
        });
    }
}
export { Currency };
