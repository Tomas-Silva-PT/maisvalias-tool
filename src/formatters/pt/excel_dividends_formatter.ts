import { DividendToExcel } from "../../models/dividend.js";
import { IncomeEvent } from "../../models/taxevent.js";

class ExcelDividendsFormatter {
    constructor() { }

    format(dividends: IncomeEvent[]): DividendToExcel[] {
        let result: DividendToExcel[] = [];

        for (const transaction of dividends) {

            const ticker = transaction.transaction.asset!!.ticker;
            const date = transaction.transaction.date;
            const isin = transaction.transaction.asset!!.isin;
            const amount = transaction.amount;
            const fees = transaction.fees;
            const taxes = transaction.taxes;
            const expenses = fees + taxes;
            const originalCurrency = transaction.transaction.currency;
            const exchangeRate = originalCurrency === "EUR" ? 1 : Math.round((transaction.transaction.exchangeRate || 1) * 1000) / 1000;

            const balance = Math.round((amount - expenses) * 100) / 100;

            const dividend: DividendToExcel = {
                "Ticker": ticker,
                "ISIN": isin,
                "Data": date.toISODate()!,
                "Valor": amount,
                "Despesas": expenses,
                "Moeda Original": originalCurrency,
                "Taxa de Câmbio": exchangeRate,
                "Balanço": balance,
            }

            result.push(dividend);
        }

        return result;
    }

}
export { ExcelDividendsFormatter };
