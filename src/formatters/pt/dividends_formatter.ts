import { DividendForUser } from "../../models/dividend.js";
import { DividendTransaction } from "../../models/transaction.js";

class DividendsFormatter {
  constructor() { }

  format(dividends: DividendTransaction[]): DividendForUser[] {
    let result: DividendForUser[] = [];

    for (const transaction of dividends) {

      const ticker = transaction.transaction.asset.ticker;
      const date = transaction.transaction.date;
      const amount = transaction.amount;
      const fees = transaction.fees;
      const taxes = transaction.taxes;
      const expenses = fees + taxes;
      const originalCurrency = transaction.transaction.netAmountCurrency;
      const exchangeRate = originalCurrency === "EUR" ? 1 : Math.round((transaction.transaction.exchangeRate || 1)*1000)/1000;


      const balance = Math.round((amount - expenses) * 100) / 100;

      const dividend: DividendForUser = {
        "Ticker": ticker,
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
export { DividendsFormatter };
