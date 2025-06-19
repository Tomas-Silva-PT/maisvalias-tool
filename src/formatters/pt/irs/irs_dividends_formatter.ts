import { DividendToIRS } from "../../../models/dividend.js";
import { DividendTransaction } from "../../../models/transaction.js";

class PTDividendsFormatter {
  constructor() { }

  format(dividends: DividendTransaction[]): DividendToIRS[] {
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
        let totalNetAmount = 0;
        let totalGrossAmount = 0;

        totalNetAmount = yearGroup.reduce((total, transaction) => { return total + transaction.amount; }, 0);
        totalFeesAmount = yearGroup.reduce((total, transaction) => { return total + transaction.fees; }, 0);
        totalTaxAmount = yearGroup.reduce((total, transaction) => { return total + transaction.taxes; }, 0);

        totalFeesAmount = parseFloat(totalFeesAmount.toFixed(2));
        totalTaxAmount = parseFloat(totalTaxAmount.toFixed(2));
        const totalExpenses = parseFloat(
          (totalFeesAmount + totalTaxAmount).toFixed(2)
        );

        totalNetAmount = parseFloat(totalNetAmount.toFixed(2));
        totalGrossAmount = Math.round((totalNetAmount + totalExpenses) * 100) / 100;

        let countryDomiciled = yearGroup[0].transaction.asset.countryDomiciled;

        // Para ações domiciliadas em Portugal e adquiridas em corretoras estrangeiras, o país da fonte deve ser o da corretora
        if (countryDomiciled?.code === "620") {
          countryDomiciled = yearGroup[0].transaction.broker.country;
        }

        const anoRendimento = yearGroup[0].transaction.date.substring(0, 4);
        const codigoRendimento = "E11 - Dividendos ou lucros - sem retenção em Portugal";
        let paisFonte = "";
        if(countryDomiciled?.code) {
          paisFonte = `${countryDomiciled?.code} - ${countryDomiciled?.namePt}`;
        } 
        const rendimentoBruto = totalGrossAmount;
        const impostoPagoNoEstrangeiro = totalExpenses;

        const dividendForIRS: DividendToIRS = {
          "Ano rendimento": anoRendimento,
          "Código Rendimento": codigoRendimento,
          "País da fonte": paisFonte,
          "Rendimento Bruto": rendimentoBruto,
          "Imposto Pago no Estrangeiro - No país da fonte": impostoPagoNoEstrangeiro,
        };

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

  }
}

export { PTDividendsFormatter };
