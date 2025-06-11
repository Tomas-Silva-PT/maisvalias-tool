import { DividendToIRS } from "../../../models/dividend.js";
import { DividendTransaction } from "../../../models/transaction.js";

class PTDividendsFormatter {
  constructor() { }

  format(dividends : DividendTransaction[]): DividendToIRS[] {
    let result: DividendToIRS[] = [];

    const dividendsByAsset: Record<string, Record<string, DividendTransaction[]>> = {};

    // Agrupar dividendos por ativo e ano
    for (const dividend of dividends) {
      const isin = dividend.transaction.asset.isin;
      const year = dividend.transaction.date.substring(0, 4);
      dividendsByAsset[isin] ??= {};
      dividendsByAsset[isin][year] ??= [];
      dividendsByAsset[isin][year].push(dividend);
    }

    for (const assetGroup of Object.values(dividendsByAsset)) {
      for (const yearGroup of Object.values(assetGroup)) {
        let totalFeesAmount = 0;
        let totalTaxAmount = 0;
        let totalGrossAmount = 0;

        totalGrossAmount = yearGroup.reduce((total, transaction) => { return total + transaction.amount; }, 0);
        totalFeesAmount = yearGroup.reduce((total, transaction) => { return total + transaction.fees; }, 0);
        totalTaxAmount = yearGroup.reduce((total, transaction) => { return total + transaction.taxes; }, 0);

        totalFeesAmount = parseFloat(totalFeesAmount.toFixed(2));
        totalTaxAmount = parseFloat(totalTaxAmount.toFixed(2));
        const totalExpenses = parseFloat(
          (totalFeesAmount + totalTaxAmount).toFixed(2)
        );

        totalGrossAmount = parseFloat(totalGrossAmount.toFixed(2));

        const countryDomiciled = yearGroup[0].transaction.asset.countryDomiciled;

        const dividendForIRS: DividendToIRS = {
          "Ano rendimento": yearGroup[0].transaction.date.substring(0, 4),
          "Código Rendimento": "E11 - Dividendos ou lucros - sem retenção em Portugal",
          "País da fonte": `${countryDomiciled?.code} - ${countryDomiciled?.namePt}`,
          "Rendimento Bruto": totalGrossAmount,
          "Imposto Pago no Estrangeiro - No país da fonte": totalExpenses,
        }

        result.push(dividendForIRS);
      }
    }

    // Como na AT a chave de cada linha é o país da fonte e o código de rendimento, temos de agrupar segundo isso
    result = result.reduce((acc: DividendToIRS[], curr: DividendToIRS) => {
      let ref = acc.find((dividend) => dividend["Código Rendimento"] === curr["Código Rendimento"] &&
        dividend["País da fonte"] === curr["País da fonte"] &&
        dividend["Ano rendimento"] === curr["Ano rendimento"]);
      if (ref) {
        ref["Rendimento Bruto"] += curr["Rendimento Bruto"];
        ref["Imposto Pago no Estrangeiro - No país da fonte"] += curr["Imposto Pago no Estrangeiro - No país da fonte"];
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);
    
    return result;


    // // console.log("dividendsByAsset", dividendsByAsset);
    // let listDividendsByAsset = Object.values(dividendsByAsset);
    // for (let listAssetDividends of listDividendsByAsset) {
    //   let listDividendsByAssetAndYear = Object.values(listAssetDividends);
    //   for (let listDividends of listDividendsByAssetAndYear) {
    //     let totalNetAmount = 0;
    //     let totalFeesAmount = 0;
    //     let totalTaxAmount = 0;
    //     let totalGrossAmount = 0;

    //     for (let transaction of listDividends) {
    //       const fees = transaction.fees;
    //       const taxes = transaction.taxes;

    //       if (fees) {
    //         for (let fee of fees) {
    //           if (fee.currency === currency) {
    //             totalFeesAmount += fee.amount;
    //           } else if (fee.exchangeRate) {
    //             totalFeesAmount += fee.amount * fee.exchangeRate;
    //           } else {
    //             console.log("Converting dividend fee");
    //             totalFeesAmount += await currencyConverter.convert(
    //               fee.amount,
    //               fee.currency,
    //               currency,
    //               transaction.date
    //             );
    //           }
    //         }
    //       }
    //       if (taxes) {
    //         for (let tax of taxes) {
    //           if (tax.currency === currency) {
    //             totalTaxAmount += tax.amount;
    //           } else if (tax.exchangeRate) {
    //             totalTaxAmount += tax.amount * tax.exchangeRate;
    //           } else {
    //             console.log("Converting dividend tax");
    //             totalTaxAmount += await currencyConverter.convert(
    //               tax.amount,
    //               tax.currency,
    //               currency,
    //               transaction.date
    //             );
    //           }
    //         }
    //       }

    //       if (transaction.netAmountCurrency === currency) {
    //         totalNetAmount += transaction.netAmount;
    //       } else if (transaction.exchangeRate) {
    //         totalNetAmount += transaction.netAmount * transaction.exchangeRate;
    //       } else {
    //         console.log("Converting dividend amount");
    //         totalNetAmount += await currencyConverter.convert(
    //           transaction.netAmount,
    //           transaction.netAmountCurrency,
    //           currency,
    //           transaction.date
    //         );
    //       }
    //     }
    //     // Calcular rendimento bruto
    //     // Devido às limitações em JavaScript de "float-point" errors, o valor do rendimento bruto deve ser arredondado para 2 casas decimais
    //     totalFeesAmount = parseFloat(totalFeesAmount.toFixed(2));
    //     totalTaxAmount = parseFloat(totalTaxAmount.toFixed(2));

    //     const totalExpenses = parseFloat(
    //       (totalFeesAmount + totalTaxAmount).toFixed(2)
    //     );
    //     totalGrossAmount = totalNetAmount + totalExpenses;
    //     totalGrossAmount = parseFloat(totalGrossAmount.toFixed(2));

    //     const dividendTransaction = listDividends[0];
    //     const countryDomiciled = dividendTransaction.asset.countryDomiciled;

    //     // if(dividendTransaction.asset.ticker == "MDT") {
    //     //   console.log("totalFeesAmount", totalFeesAmount);
    //     //   console.log("totaltaxamount", totalTaxAmount);
    //     // }

    //     let entry: DividendForUser = {
    //       Ticker: dividendTransaction.asset.ticker,
    //       "Ano rendimento": dividendTransaction.date.substring(0, 4),
    //       "Código Rendimento":
    //         "E11 - Dividendos ou lucros - sem retenção em Portugal",
    //       "País da fonte": `${countryDomiciled?.code} - ${countryDomiciled?.namePt}`,
    //       "Rendimento Bruto": totalGrossAmount,
    //       "Imposto Pago no Estrangeiro - No país da fonte": totalExpenses,
    //     };

    //     dividends.push(entry);
    //   }
    // }

    // // Como na AT a chave de cada linha é o país da fonte e o código de rendimento, temos de agrupar segundo isso
    // // Se quiseres ignorar este facto para poderes mostrar os dividendos por ativo, comenta o seguinte bloco de código
    // const dividendsForUser = dividends;
    // let dividendsForIRS = dividends.reduce((acc: Dividend[], curr) => {
    //   let ref = acc.find(
    //     (dividend) =>
    //       dividend["Código Rendimento"] === curr["Código Rendimento"] &&
    //       dividend["País da fonte"] === curr["País da fonte"] &&
    //       dividend["Ano rendimento"] === curr["Ano rendimento"]
    //   );
    //   if (ref) {
    //     ref["Rendimento Bruto"] += curr["Rendimento Bruto"];
    //     ref["Imposto Pago no Estrangeiro - No país da fonte"] +=
    //       curr["Imposto Pago no Estrangeiro - No país da fonte"];
    //   } else {
    //     const { Ticker, ...rest } = curr;
    //     acc.push(rest);
    //   }
    //   return acc;
    // }, []);

    // return {
    //   toUser: dividendsForUser,
    //   toIRS: dividendsForIRS,
    // };
  }
}

export { PTDividendsFormatter };
