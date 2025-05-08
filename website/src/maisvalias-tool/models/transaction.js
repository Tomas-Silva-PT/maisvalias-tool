var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Asset } from "./asset.js";
class Transaction {
    constructor(date, time, type, ticker, isin, shares, assetCurrency, netAmount, netAmountCurrency, taxes, fees, broker) {
        this.date = date;
        this.time = time;
        this.type = type;
        this.asset = new Asset(ticker, isin, assetCurrency);
        this.shares = shares;
        this.netAmount = netAmount;
        this.netAmountCurrency = netAmountCurrency;
        this.taxes = taxes;
        this.fees = fees;
        this.broker = broker;
    }
    fetchData(assetBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.asset.fetchData(assetBuffer);
        });
    }
    toString() {
        return `Transaction(Date: ${this.date}, Time: ${this.time}, Ticker: ${this.asset.ticker}, ISIN: ${this.asset.isin}, Shares: ${this.shares}, Net Amount: ${this.netAmount})`;
    }
    equals(other) {
        return (this.date === other.date &&
            this.time === other.time &&
            this.type === other.type &&
            this.asset.equals(other.asset) &&
            this.shares === other.shares &&
            this.netAmount === other.netAmount &&
            this.netAmountCurrency === other.netAmountCurrency &&
            this.broker.isEquals(this.broker, other.broker));
    }
}
export { Transaction };
