import { Asset, AssetBuffer } from "./asset";
import { Broker } from "../models/brokers/broker";
import { Tax } from "./tax";
import { Fee } from "./fee";

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
        this.asset.fetchData(assetBuffer);
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
            JSON.stringify(this.taxes) === JSON.stringify(other.taxes) &&
            this.broker === other.broker &&
            JSON.stringify(this.fees) === JSON.stringify(other.fees)
        );
    }

    hashCode() {
        return `${this.date}-${this.time}-${this.type}-${this.asset.ticker}-${this.asset.toString()}-${this.shares}-${this.netAmount}-${this.netAmountCurrency}-${this.broker}`.hashCode();
    }
}

export { Transaction };