import { Asset } from "./asset.js";
class Transaction {
    constructor(date, time, type, ticker, isin, shares, assetCurrency, netAmount, netAmountCurrency, broker, taxes, fees, exchangeRate) {
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
        if (exchangeRate && !isNaN(exchangeRate))
            this.exchangeRate = exchangeRate;
    }
    toString() {
        return `Transaction(Date: ${this.date}, Time: ${this.time}, Ticker: ${this.asset.ticker}, ISIN: ${this.asset.isin}, Shares: ${this.shares}, Net Amount: ${this.netAmount}, Exchange Rate: ${this.exchangeRate})`;
    }
    equals(other) {
        return (this.date === other.date &&
            this.time === other.time &&
            this.type === other.type &&
            this.asset.equals(other.asset) &&
            this.shares === other.shares &&
            this.netAmount === other.netAmount &&
            this.netAmountCurrency === other.netAmountCurrency &&
            this.broker.isEquals(this.broker, other.broker) &&
            this.exchangeRate === other.exchangeRate);
    }
}
export { Transaction };
