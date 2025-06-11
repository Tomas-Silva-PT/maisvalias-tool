import { MatchedTransaction, RealizedTransaction, Transaction } from "../models/transaction";

interface CapitalGainsCalculator {
    calculate(transaction: MatchedTransaction[], year?: number, currency?: string): Promise<RealizedTransaction[]>;
    match(transaction: Transaction[]): MatchedTransaction[];
}

export { CapitalGainsCalculator };