import { Transaction } from "./transaction";

type CapitalGainEvent = {
    kind: "capitalGain";
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

type IncomeEvent = {
    kind: "dividend" | "interest";
    transaction: Transaction;
    amount: number;
    fees: number;
    taxes: number;
    currency: string;
}


type TaxEvent = CapitalGainEvent | IncomeEvent;

export { TaxEvent, CapitalGainEvent, IncomeEvent };