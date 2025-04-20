import { Asset, AssetBuffer } from "./asset.js";
import { Trading212 } from "./brokers/trading212.js";
import { Tax } from "./tax.js";
import { Fee } from "./fee.js";

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

    async fetchData(assetBuffer) {
        await this.asset.fetchData(assetBuffer);
    }

    toString() {
        return `Transaction(Date: ${this.date}, Time: ${this.time}, Ticker: ${this.asset.ticker}, ISIN: ${this.asset.isin}, Shares: ${this.shares}, Net Amount: ${this.netAmount})`;
    }

    toDict() {
        return {
            date: this.date,
            time: this.time,
            type: this.type,
            asset: this.asset,
            shares: this.shares,
            amount: this.netAmount,
            amount_currency: this.netAmountCurrency,
            taxes: this.taxes,
            broker: this.broker,
            fees: this.fees,
        };
    }

    equals(other) {
        return (
            this.date === other.date &&
            this.time === other.time &&
            this.type === other.type &&
            this.asset.equals(other.asset) &&
            this.shares === other.shares &&
            this.netAmount === other.netAmount &&
            this.netAmountCurrency === other.netAmountCurrency &&
            Tax.isEquals(this.taxes, other.taxes) &&
            Trading212.isEquals(this.broker, other.broker) &&
            Fee.isEquals(this.fees, other.fees)
        );
    }

    hashCode() {
        return `${this.date}-${this.time}-${this.type}-${this.asset.ticker}-${this.asset.toString()}-${this.shares}-${this.netAmount}-${this.netAmountCurrency}-${this.broker}`.hashCode();
    }
}

export { Transaction };