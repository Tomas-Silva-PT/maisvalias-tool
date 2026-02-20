import { AnexoG1Quadro7 } from "../../../../../models/irs/panel.js";
import { CapitalGainEvent } from "../../../../../models/taxevent.js";
import { IRSFormatter } from "../../IRSFormatter.js";

class PTAnexoG1Quadro7Formatter implements IRSFormatter<CapitalGainEvent, AnexoG1Quadro7> {
  constructor() { }

  format(transactions: CapitalGainEvent[]): AnexoG1Quadro7[] {

    let capitalGains: AnexoG1Quadro7[] = [];

    for (const realizedTransaction of transactions) {
      const buy = realizedTransaction.buy;
      const sell = realizedTransaction.sell;
      const realizedValue = realizedTransaction.realizedValue;
      const acquiredValue = realizedTransaction.acquiredValue;
      const fees = realizedTransaction.buyFees + realizedTransaction.sellFees;
      const taxes = realizedTransaction.buyTaxes + realizedTransaction.sellTaxes;

      let countryDomiciled = buy.asset!!.countryDomiciled;
      // Para ações domiciliadas em Portugal e adquiridas em corretoras estrangeiras, o país da fonte deve ser o da corretora
      if (countryDomiciled?.code === "620") {
        countryDomiciled = buy.broker.country;
      }

      let paisFonte = "";
      if (countryDomiciled?.code) {
        paisFonte = countryDomiciled.code ? `${countryDomiciled?.code} - ${countryDomiciled?.namePt}` : "";
      }
      const anoAquisicao = buy.date.year;
      const mesAquisicao = buy.date.month;
      const diaAquisicao = buy.date.day; // corrigido: getDay() retorna o dia da semana
      const valorAquisicao = acquiredValue;
      const anoRealizacao = sell.date.year;
      const mesRealizacao = sell.date.month;
      const diaRealizacao = sell.date.day; // corrigido: getDay() retorna o dia da semana
      const valorRealizacao = realizedValue;
      const despesasEncargos = fees;
      const impostoRetido = taxes;
      const paisContraparte = `${sell.broker.country.code} - ${sell.broker.country.namePt}`;

      let capitalGain: AnexoG1Quadro7 = {
        "Titular": "A", // Ver nas sources o preenchimento do quadro 7 do Anexo G1
        "País": paisFonte,
        "Ano de Aquisição": anoAquisicao,
        "Mês de Aquisição": mesAquisicao,
        "Dia de Aquisição": diaAquisicao,
        "Valor de Aquisição": valorAquisicao,
        "Ano de Realização": anoRealizacao,
        "Mês de Realização": mesRealizacao,
        "Dia de Realização": diaRealizacao,
        "Valor de Realização": valorRealizacao,
        "Despesas e Encargos": despesasEncargos,
        "País da Contraparte": paisContraparte,
      };

      capitalGains.push(capitalGain);


    }

    return capitalGains;

  }

  toXML(xmlDoc: Document, events: CapitalGainEvent[]): string {
    return "";
  }

}

export { PTAnexoG1Quadro7Formatter };
