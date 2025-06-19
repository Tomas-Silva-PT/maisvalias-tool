import { FIFOCalculator } from "../../../calculators/FIFOCalculator.js";
import { CapitalGainsCalculator } from "../../../calculators/CapitalGainsCalculator.js";
import { CapitalGain } from "../../../models/capitalgain.js";
import { Statement } from "../../../models/statement.js";
import { RealizedTransaction } from "../../../models/transaction.js";

class PTCapitalGainsFormatter {
  constructor() { }

  format(transactions: RealizedTransaction[]): CapitalGain[] {

    let capitalGains: CapitalGain[] = [];

    for (const realizedTransaction of transactions) {
      const buy = realizedTransaction.buy;
      const sell = realizedTransaction.sell;
      const realizedValue = realizedTransaction.realizedValue;
      const acquiredValue = realizedTransaction.acquiredValue;
      const fees = realizedTransaction.buyFees + realizedTransaction.sellFees;
      const taxes = realizedTransaction.buyTaxes + realizedTransaction.sellTaxes;


      let code: string = "";
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

      const ticker = sell.asset.ticker;
      let paisFonte = "";
      if (countryDomiciled?.code) {
        paisFonte = countryDomiciled.code ? `${countryDomiciled?.code} - ${countryDomiciled?.namePt}` : "";
      }
      const codigo = code;
      const anoAquisicao = new Date(buy.date).getFullYear();
      const mesAquisicao = new Date(buy.date).getMonth() + 1;
      const diaAquisicao = new Date(buy.date).getDate(); // corrigido: getDay() retorna o dia da semana
      const valorAquisicao = acquiredValue;
      const anoRealizacao = new Date(sell.date).getFullYear();
      const mesRealizacao = new Date(sell.date).getMonth() + 1;
      const diaRealizacao = new Date(sell.date).getDate(); // corrigido: getDay() retorna o dia da semana
      const valorRealizacao = realizedValue;
      const despesasEncargos = fees;
      const impostoRetido = taxes;
      const paisContraparte = `${sell.broker.country.code} - ${sell.broker.country.namePt}`;

      let capitalGain: CapitalGain = {
        Ticker: ticker,
        "País da fonte": paisFonte,
        Código: codigo,
        "Ano de Aquisição": anoAquisicao,
        "Mês de Aquisição": mesAquisicao,
        "Dia de Aquisição": diaAquisicao,
        "Valor de Aquisição": valorAquisicao,
        "Ano de Realização": anoRealizacao,
        "Mês de Realização": mesRealizacao,
        "Dia de Realização": diaRealizacao,
        "Valor de Realização": valorRealizacao,
        "Despesas e Encargos": despesasEncargos,
        "Imposto retido no estrangeiro": impostoRetido,
        "País da Contraparte": paisContraparte,
      };

      capitalGains.push(capitalGain);


    }

    return capitalGains;

  }
}

export { PTCapitalGainsFormatter };
