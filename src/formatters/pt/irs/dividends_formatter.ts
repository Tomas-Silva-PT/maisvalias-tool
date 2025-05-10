import { Currency } from "../../../models/currency.js";
import { Dividend, DividendForUser } from "../../../models/dividend.js";
import { Statement } from "../../../models/statement.js";
import { Transaction } from "../../../models/transaction.js";

type Dividends = {
  toUser: DividendForUser[];
  toIRS: Dividend[];
};

class PTDividendsFormatter {
  constructor() {}

  async format(
    statement: Statement,
    year?: number,
    currency: string = "EUR"
  ): Promise<Dividends> {
    // Obter transacoes referentes aos dividendos do ano a declarar
    const transactions = statement.getTransactions();
    const dividendTransactions = transactions.filter(
      (t) =>
        t.type === "Dividend" && (!year || t.date.startsWith(year.toString()))
    );
    const dividends = [];
    const dividendsByAsset: Record<string, Record<string, Transaction[]>> = {};

    // Agrupar dividendos por ativo e ano
    dividendTransactions.forEach((transaction) => {
      if (!dividendsByAsset[transaction.asset.isin]) {
        dividendsByAsset[transaction.asset.isin] = {};
      }
      if (
        !dividendsByAsset[transaction.asset.isin][
          transaction.date.substring(0, 4)
        ]
      ) {
        dividendsByAsset[transaction.asset.isin][
          transaction.date.substring(0, 4)
        ] = [];
      }
      dividendsByAsset[transaction.asset.isin][
        transaction.date.substring(0, 4)
      ].push(transaction);
    });
    const currencyConverter = new Currency();
    // console.log("dividendsByAsset", dividendsByAsset);
    let listDividendsByAsset = Object.values(dividendsByAsset);
    for (let listAssetDividends of listDividendsByAsset) {
      let listDividendsByAssetAndYear = Object.values(listAssetDividends);
      for (let listDividends of listDividendsByAssetAndYear) {
        let totalNetAmount = 0;
        let totalFeesAmount = 0;
        let totalTaxAmount = 0;
        let totalGrossAmount = 0;

        for (let transaction of listDividends) {
          const fees = transaction.fees;
          const taxes = transaction.taxes;

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
          if (transaction.netAmountCurrency === currency) {
            totalNetAmount += transaction.netAmount;
          } else if (transaction.exchangeRate) {
            totalNetAmount += transaction.netAmount * transaction.exchangeRate;
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
        totalTaxAmount = parseFloat(totalTaxAmount.toFixed(2));

        const totalExpenses = parseFloat(
          (totalFeesAmount + totalTaxAmount).toFixed(2)
        );
        totalGrossAmount = totalNetAmount + totalExpenses;
        totalGrossAmount = parseFloat(totalGrossAmount.toFixed(2));

        const dividendTransaction = listDividends[0];
        const countryDomiciled = dividendTransaction.asset.countryDomiciled;

        // if(dividendTransaction.asset.ticker == "MDT") {
        //   console.log("totalFeesAmount", totalFeesAmount);
        //   console.log("totaltaxamount", totalTaxAmount);
        // }

        let entry: DividendForUser = {
          Ticker: dividendTransaction.asset.ticker,
          "Ano rendimento": dividendTransaction.date.substring(0, 4),
          "Código Rendimento":
            "E11 - Dividendos ou lucros - sem retenção em Portugal",
          "País da fonte": `${countryDomiciled?.code} - ${countryDomiciled?.namePt}`,
          "Rendimento Bruto": totalGrossAmount,
          "Imposto Pago no Estrangeiro - No país da fonte": totalExpenses,
        };

        dividends.push(entry);
      }
    }

    // Como na AT a chave de cada linha é o país da fonte e o código de rendimento, temos de agrupar segundo isso
    // Se quiseres ignorar este facto para poderes mostrar os dividendos por ativo, comenta o seguinte bloco de código
    const dividendsForUser = dividends;
    let dividendsForIRS = dividends.reduce((acc: Dividend[], curr) => {
      let ref = acc.find(
        (dividend) =>
          dividend["Código Rendimento"] === curr["Código Rendimento"] &&
          dividend["País da fonte"] === curr["País da fonte"] &&
          dividend["Ano rendimento"] === curr["Ano rendimento"]
      );
      if (ref) {
        ref["Rendimento Bruto"] += curr["Rendimento Bruto"];
        ref["Imposto Pago no Estrangeiro - No país da fonte"] +=
          curr["Imposto Pago no Estrangeiro - No país da fonte"];
      } else {
        const { Ticker, ...rest } = curr;
        acc.push(rest);
      }
      return acc;
    }, []);

    return {
      toUser: dividendsForUser,
      toIRS: dividendsForIRS,
    };
  }
}

export { PTDividendsFormatter };
