import { FIFOCalculator } from "../../../calculators/FIFOCalculator.js";
import { CapitalGainsCalculator } from "../../../calculators/CapitalGainsCalculator.js";
import { CapitalGain } from "../../../models/capitalgain.js";
import { Statement } from "../../../models/statement.js";
import { RealizedTransaction } from "../../../models/transaction.js";

class PTCapitalGainsFormatter {
  constructor() {}

  format(transactions : RealizedTransaction[]): CapitalGain[] {

    let capitalGains: CapitalGain[] = [];

    for (const realizedTransaction of transactions) {
      const buy = realizedTransaction.buy;
      const sell = realizedTransaction.sell;
      const realizedValue = realizedTransaction.realizedValue;
      const acquiredValue = realizedTransaction.acquiredValue;
      const fees = realizedTransaction.fees;
      const taxes = realizedTransaction.taxes;


      let code : string = "";
      switch (realizedTransaction.buy.asset.assetType) {
        case "EQUITY":
          code = "G01";
          break;
        case "ETF":
          code = "G20";
          break;
      }

      let countryDomiciled = buy.asset.countryDomiciled;
      // Para ações domiciliadas em Portugal e adquiridas em corretoras estrangeiras, o país da fonte deve ser o da corretora
      if (countryDomiciled?.code === "620") {
        countryDomiciled = buy.broker.country;
      }

      let capitalGain: CapitalGain = {
        Ticker: sell.asset.ticker,
        "País da fonte": `${countryDomiciled?.code} - ${countryDomiciled?.namePt}`,
        Código: code,
        "Ano de Aquisição": new Date(buy.date).getFullYear(),
        "Mês de Aquisição": new Date(buy.date).getMonth() + 1,
        "Dia de Aquisição": new Date(buy.date).getDay(),
        "Valor de Aquisição": acquiredValue,
        "Ano de Realização": new Date(sell.date).getFullYear(),
        "Mês de Realização": new Date(sell.date).getMonth() + 1,
        "Dia de Realização": new Date(sell.date).getDay(),
        "Valor de Realização": realizedValue,
        "Despesas e Encargos": fees,
        "Imposto retido no estrangeiro": taxes,
        "País da Contraparte": `${sell.broker.country.code} - ${sell.broker.country.namePt}`,
      };

      capitalGains.push(capitalGain);


    }

    return capitalGains;

  }
}

export { PTCapitalGainsFormatter };
