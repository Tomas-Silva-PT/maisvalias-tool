import { Asset } from "./asset.js";
import { Tax } from "./tax.js";
import { Fee } from "./fee.js";
import { Broker } from "./brokers/broker.js";
import { DateTime } from "luxon";

// class Transaction {
//     date: DateTime;
//     type: string;
//     asset: Asset;
//     shares: number;
//     netAmount: number;
//     netAmountCurrency: string;
//     taxes?: Tax[];
//     fees?: Fee[];
//     broker: Broker;
//     exchangeRate?: number;
//     constructor(date: DateTime, type: string, ticker: string, isin: string, shares: number, assetCurrency: string, netAmount: number, netAmountCurrency: string, broker: Broker, taxes?: Tax[], fees?: Fee[], exchangeRate?: number) {
//         this.date = date;
//         this.type = type;
//         this.asset = new Asset(ticker, isin, assetCurrency);
//         this.shares = shares;
//         this.netAmount = netAmount; // Em caso de compra, corresponde ao valor pago pelo ativo + despesas e encargos (custo de compra final); em caso de venda, corresponde ao valor recebido pela venda do ativo - despesas e encargos (receita líquida).
//         this.netAmountCurrency = netAmountCurrency;
//         this.taxes = taxes;
//         this.fees = fees;
//         this.broker = broker;
//         if (exchangeRate && !isNaN(exchangeRate)) this.exchangeRate = exchangeRate;
//     }

//     toString(): string {
//         return `Transaction(Date: ${this.date.toFormat("yyyy-MM-dd HH:mm:ss")}, Ticker: ${this.asset.ticker}, ISIN: ${this.asset.isin}, Shares: ${this.shares}, Net Amount: ${this.netAmount}, Exchange Rate: ${this.exchangeRate})`;
//     }

//     equals(other: Transaction): boolean {
//         return (
//             this.date.equals(other.date) &&
//             this.type === other.type &&
//             this.asset.equals(other.asset) &&
//             this.shares === other.shares &&
//             this.netAmount === other.netAmount &&
//             this.netAmountCurrency === other.netAmountCurrency &&
//             this.broker.isEquals(this.broker, other.broker) &&
//             this.exchangeRate === other.exchangeRate
//         );
//     }

// }

type TransactionType = "Buy" | "Sell" | "Dividend" | "Interest";

type Transaction = {
    date: DateTime;
    type: TransactionType;
    description?: string;

    asset?: Asset;        // opcional
    shares?: number;      // opcional

    amount: number; // Em caso de compra, corresponde ao valor pago pelo ativo + despesas e encargos (custo de compra final); em caso de venda, corresponde ao valor recebido pela venda do ativo - despesas e encargos (receita líquida).
    currency: string;

    broker: Broker;
    taxes?: Tax[];
    fees?: Fee[];
    exchangeRate?: number;
}

function transactionEquals(t1: Transaction, t2: Transaction): boolean {
    return (
        t1.date.equals(t2.date) &&
        t1.type === t2.type &&
        (t1.asset && t2.asset
            ? t1.asset.equals(t2.asset)
            : t1.asset === t2.asset) &&
        t1.shares === t2.shares &&
        t1.amount === t2.amount &&
        t1.currency === t2.currency &&
        t1.broker.isEquals(t1.broker, t2.broker) &&
        t1.exchangeRate === t2.exchangeRate
    );
}

type MatchedTransaction = {
    buy: Transaction;
    sell: Transaction;
    shares: number;
}

type RealizedTransaction = {
    buy: Transaction;
    sell: Transaction;
    buyFees: number;
    sellFees: number;
    buyTaxes: number;
    sellTaxes: number;
    realizedValue: number;
    acquiredValue: number;
    currency: string;
}

type DividendTransaction = {
    transaction: Transaction;
    amount: number;
    fees: number;
    taxes: number;
    currency: string;
}



export { TransactionType, Transaction, MatchedTransaction, transactionEquals };