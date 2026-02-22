import { Currency } from "../models/currency";
import { IncomeEvent } from "../models/taxevent";
import { Transaction } from "../models/transaction";
import { IncomeCalculator } from "./IncomeCalculator";

class InterestGainsCalculator implements IncomeCalculator {
    async calculate(transactions: Transaction[], year?: number, currency: string = "EUR"): Promise<IncomeEvent[]> {
        const currencyConverter = new Currency();
        const interestTransactions = transactions.filter(
            (t) =>
                t.type === "Interest" && (!year || t.date.year === year)
        );
        const interestEvents: IncomeEvent[] = [];

        for (const transaction of interestTransactions) {
            const fees = transaction.fees;
            const taxes = transaction.taxes;
            let totalNetAmount = 0;
            let totalFeesAmount = 0;
            let totalTaxAmount = 0;
            let totalGrossAmount = 0;

            if (fees) {
                for (let fee of fees) {
                    if (fee.currency === currency) {
                        totalFeesAmount += fee.amount;
                    } else if (fee.exchangeRate) {
                        totalFeesAmount += fee.amount * fee.exchangeRate;
                    } else {
                        totalFeesAmount += await currencyConverter.convert(
                            fee.amount,
                            fee.currency,
                            currency,
                            transaction.date
                        );
                    }
                }
            }
            if (taxes) {
                for (let tax of taxes) {
                    if (tax.currency === currency) {
                        totalTaxAmount += tax.amount;
                    } else if (tax.exchangeRate) {
                        totalTaxAmount += tax.amount * tax.exchangeRate;
                    } else {
                        totalTaxAmount += await currencyConverter.convert(
                            tax.amount,
                            tax.currency,
                            currency,
                            transaction.date
                        );
                    }
                }
            }

            if (transaction.currency === currency) {
                totalNetAmount += transaction.amount;
            } else if (transaction.exchangeRate) {
                totalNetAmount += transaction.amount * transaction.exchangeRate;
            } else {
                totalNetAmount += await currencyConverter.convert(
                    transaction.amount,
                    transaction.currency,
                    currency,
                    transaction.date
                );
            }

            totalGrossAmount = totalNetAmount + (totalFeesAmount + totalTaxAmount);

            interestEvents.push({
                kind: "interest",
                transaction: transaction,
                amount: Math.round(totalGrossAmount * 100) / 100,
                fees: Math.round(totalFeesAmount * 100) / 100,
                taxes: Math.round(totalTaxAmount * 100) / 100,
                currency: currency
            })
        }

        return interestEvents;

    }


}

export { InterestGainsCalculator };