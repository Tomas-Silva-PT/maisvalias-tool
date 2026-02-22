import { InterestGainToExcel } from "../../../models/interestGain.js";
import { IncomeEvent } from "../../../models/taxevent.js";

class ExcelInterestGainsFormatter {
    constructor() { }

    format(interestGains: IncomeEvent[]): InterestGainToExcel[] {
        let result: InterestGainToExcel[] = [];

        for (const transaction of interestGains) {

            const date = transaction.transaction.date;
            const amount = transaction.amount;
            const fees = transaction.fees;
            const taxes = transaction.taxes;
            const expenses = fees + taxes;
            const originalCurrency = transaction.transaction.currency;
            const exchangeRate = originalCurrency === "EUR" ? 1 : Math.round((transaction.transaction.exchangeRate || 1) * 1000) / 1000;

            const balance = Math.round((amount - expenses) * 100) / 100;

            const interest: InterestGainToExcel = {
                "Data": date.toISODate()!,
                "Valor": amount,
                "Despesas": expenses,
                "Moeda Original": originalCurrency,
                "Taxa de Câmbio": exchangeRate,
                "Balanço": balance,
            }

            result.push(interest);
        }

        return result;
    }

}
export { ExcelInterestGainsFormatter };
