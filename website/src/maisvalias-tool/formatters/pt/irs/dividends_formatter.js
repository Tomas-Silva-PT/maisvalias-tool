// import { Statement } from "../../models/statement.js";
// import { Transaction } from "../../models/transaction.js";
import { Currency } from "../../../models/currency.js";

class PTDividendsFormatter {
  constructor() {}

  async format(statement, year, currency = "EUR") {
    // Obter transacoes referentes aos dividendos do ano a declarar
    const transactions = statement.getTransactions();
    const dividendTransactions = transactions.filter(
      (t) => t.type === "Dividend" && t.date.startsWith(year)
    );
    const dividends = [];
    const dividendsByAsset = {};

    // Agrupar dividendos por ativo
    dividendTransactions.forEach((transaction) => {
      if (!dividendsByAsset[transaction.asset.isin]) {
        dividendsByAsset[transaction.asset.isin] = [];
      }
      dividendsByAsset[transaction.asset.isin].push(transaction);
    });

    let listDividendsByAsset = Object.values(dividendsByAsset);
    for (let listAssetDividends of listDividendsByAsset) {
      let totalNetAmount = 0;
      let totalFeesAmount = 0;
      let totalTaxAmount = 0;
      let totalGrossAmount = 0;
      const currencyConverter = new Currency();

      for (let transaction of listAssetDividends) {
        const fees = transaction.fees;
        const taxes = transaction.taxes;

        for (let fee of fees) {
          if (fee.currency === currency) {
            totalFeesAmount += fee.amount;
          } else {
            totalFeesAmount += await currencyConverter.convert(
              fee.amount,
              fee.currency,
              currency,
              transaction.date
            );
          }
        }
        for (let tax of taxes) {
          if (tax.currency === currency) {
            totalTaxAmount += tax.amount;
          } else {
            totalTaxAmount += await currencyConverter.convert(
              tax.amount,
              tax.currency,
              currency,
              transaction.date
            );
          }
        }
        if (transaction.netAmountCurrency === currency) {
          totalNetAmount += transaction.netAmount;
        } else {
          totalNetAmount += await currencyConverter.convert(
            transaction.netAmount,
            transaction.netAmountCurrency,
            currency,
            transaction.date
          );
        }


      }
      // Calcular rendimento bruto
      // Devido às limitações em JavaScript de "float-point" errors, o valor do rendimento bruto deve ser arredondado para 2 casas decimais
      totalFeesAmount = parseFloat(totalFeesAmount.toFixed(2));
      totalTaxAmount  = parseFloat(totalTaxAmount.toFixed(2));
      const totalExpenses = parseFloat((totalFeesAmount + totalTaxAmount).toFixed(2));
      totalGrossAmount = totalNetAmount + totalExpenses;
      totalGrossAmount = parseFloat(totalGrossAmount.toFixed(2));


      const dividendTransaction = listAssetDividends[0];
      const countryDomiciled = dividendTransaction.asset.countryDomiciled;

      dividends.push({
        "Ticker": dividendTransaction.asset.ticker,
        "Código Rendimento":
          "E11 - Dividendos ou lucros - sem retenção em Portugal",
        "País da fonte": `${countryDomiciled.code} - ${countryDomiciled.namePt}`,
        "Rendimento Bruto": totalGrossAmount,
        "Imposto Pago no Estrangeiro - No país da fonte":
          totalExpenses,
      });
    }

    return dividends;
  }
}

export { PTDividendsFormatter };
