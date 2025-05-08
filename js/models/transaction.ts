import { Asset, AssetBuffer } from "./asset.js";
import { Tax } from "./tax.js";
import { Fee } from "./fee.js";
import { Broker } from "./brokers/broker.js";

class Transaction {
    date: string;
    time: string;
    type: string;
    asset: Asset;
    shares: number;
    netAmount: number;
    netAmountCurrency: string;
    taxes: Tax[];
    fees: Fee[];
    broker: Broker;
    constructor(date : string, time : string, type : string, ticker : string, isin : string, shares : number, assetCurrency : string, netAmount : number, netAmountCurrency : string, taxes : Tax[], fees : Fee[], broker : Broker) {
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

    async fetchData(assetBuffer : AssetBuffer) : Promise<any> {
        await this.asset.fetchData(assetBuffer);
    }

    toString() : string {
        return `Transaction(Date: ${this.date}, Time: ${this.time}, Ticker: ${this.asset.ticker}, ISIN: ${this.asset.isin}, Shares: ${this.shares}, Net Amount: ${this.netAmount})`;
    }

    equals(other : Transaction) : boolean {
        return (
            this.date === other.date &&
            this.time === other.time &&
            this.type === other.type &&
            this.asset.equals(other.asset) &&
            this.shares === other.shares &&
            this.netAmount === other.netAmount &&
            this.netAmountCurrency === other.netAmountCurrency &&
            this.broker.isEquals(this.broker, other.broker)
        );
    }

}

export { Transaction };