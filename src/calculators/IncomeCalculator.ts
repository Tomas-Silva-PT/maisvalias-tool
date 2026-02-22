import { IncomeEvent } from "../models/taxevent";
import { MatchedTransaction, Transaction } from "../models/transaction";

interface IncomeCalculator {
    calculate(transaction: Transaction[], year?: number, currency?: string): Promise<IncomeEvent[]>;
}

export { IncomeCalculator };