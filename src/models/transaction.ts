import { Asset } from "./asset.js";
import { Tax } from "./tax.js";
import { Fee } from "./fee.js";
import { Broker } from "./brokers/broker.js";
import { DateTime } from "luxon";

type TransactionType = "Buy" | "Sell" | "Dividend" | "Interest";

type Transaction = {
    id: number,
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
    matches?: Transaction[]; // campo específico para o caso de corretoras como a XTB que fornecem diretamente o match entre a compra e a venda, para evitar que sejam feitas suposições no processo de matching. Se este campo estiver preenchido, o processo de matching irá simplesmente usar as transações indicadas neste campo como correspondentes, sem fazer qualquer tipo de verificação adicional. Se este campo não estiver preenchido, o processo de matching irá tentar encontrar as correspondências com base nas regras definidas (por exemplo, FIFO).
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
        (t1.exchangeRate || t2.exchangeRate ? t1.exchangeRate === t2.exchangeRate : true)
    );
}

type MatchedTransaction = {
    buy: Transaction;
    sell: Transaction;
    shares: number;
}



export { TransactionType, Transaction, MatchedTransaction, transactionEquals };