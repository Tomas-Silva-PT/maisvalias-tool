import { DividendForUser } from "../../models/dividend.js";
import { DividendTransaction } from "../../models/transaction.js";

class DividendsFormatter {
  constructor() { }

  format(dividends : DividendTransaction[]): DividendForUser[] {
    let result: DividendForUser[] = [];

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

        const dividendToUser: DividendForUser = {
          "Ticker": yearGroup[0].transaction.asset.ticker,
          "Ano rendimento": yearGroup[0].transaction.date.substring(0, 4),
          "Código Rendimento": "E11 - Dividendos ou lucros - sem retenção em Portugal",
          "País da fonte": `${countryDomiciled?.code} - ${countryDomiciled?.namePt}`,
          "Rendimento Bruto": totalGrossAmount,
          "Imposto Pago no Estrangeiro - No país da fonte": totalExpenses,
        }

        result.push(dividendToUser);
      }
    }

    return result;
  }

}
export { DividendsFormatter };
