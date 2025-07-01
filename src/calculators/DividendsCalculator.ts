import { Currency } from "../models/currency";
import { DividendTransaction, Transaction } from "../models/transaction";
import { DateTime } from "luxon";

class DividendsCalculator {
    async calculate(transactions: Transaction[], year?: number, currency: string = "EUR"): Promise<DividendTransaction[]> {
        const currencyConverter = new Currency();
        const dividendTransactions = transactions.filter(
            (t) =>
                t.type === "Dividend" && (!year || t.date.year === year)
        );
        const dividends: DividendTransaction[] = [];

        for (const transaction of dividendTransactions) {
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
                        console.log("Converting dividend fee");
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
                        console.log("Converting dividend tax");
                        totalTaxAmount += await currencyConverter.convert(
                            tax.amount,
                            tax.currency,
                            currency,
                            transaction.date
                        );
                    }
                }
            }

            if (transaction.netAmountCurrency === currency) {
                totalNetAmount += transaction.netAmount;
            } else if (transaction.exchangeRate) {
                totalNetAmount += transaction.netAmount * transaction.exchangeRate;
            } else {
                console.log("Converting dividend amount");
                totalNetAmount += await currencyConverter.convert(
                    transaction.netAmount,
                    transaction.netAmountCurrency,
                    currency,
                    transaction.date
                );
            }

            totalGrossAmount = totalNetAmount + (totalFeesAmount + totalTaxAmount);

            dividends.push({
                transaction: transaction,
                amount: Math.round(totalGrossAmount * 100) / 100,
                fees: Math.round(totalFeesAmount * 100) / 100,
                taxes: Math.round(totalTaxAmount * 100) / 100,
                currency: currency
            })
        }

        return dividends;

    }


}

export { DividendsCalculator };