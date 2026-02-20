import { CapitalGainEvent } from "../models/taxevent";
import { MatchedTransaction, Transaction } from "../models/transaction";

interface CapitalGainsCalculator {
    calculate(transaction: MatchedTransaction[], year?: number, currency?: string): Promise<CapitalGainEvent[]>;
    match(transaction: Transaction[]): MatchedTransaction[];
}

export { CapitalGainsCalculator };