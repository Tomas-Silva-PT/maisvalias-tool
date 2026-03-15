import { Asset } from "./asset.js";
import { Tax } from "./tax.js";
import { Fee } from "./fee.js";
import { Broker } from "./brokers/broker.js";
import { DateTime } from "luxon";

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



export { TransactionType, Transaction, MatchedTransaction, transactionEquals };