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
        "País da Entidade Gestora": paisFonte,
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

  toXML(xmlDoc: Document, events: CapitalGainEvent[]): void {

    const ns = xmlDoc.documentElement.namespaceURI;
    console.log("Namespace do documento XML:", ns);
    let anexoG1 = xmlDoc.querySelector("AnexoG1");
    
    if (!anexoG1) throw new Error("Falta AnexoG1");
    // if (!anexoG1) {
    //   console.log("AnexoG1 não encontrado, criando novo AnexoG1");
    //   anexoG1 = xmlDoc.createElementNS(
    //     ns,
    //     "AnexoG1"
    //   );
    //   xmlDoc.documentElement.appendChild(anexoG1);
    // }

    let quadro7 = anexoG1.querySelector("Quadro07");
    // if (!quadro7) throw new Error("Falta Quadro07");
    if (!quadro7) {
      console.log("Quadro07 não encontrado, criando novo Quadro07");
      quadro7 = xmlDoc.createElementNS(
        anexoG1.namespaceURI,
        "Quadro07"
      );
      anexoG1.appendChild(quadro7);
    }

    let anexog1_quadro7 = quadro7.querySelector("AnexoG1q07T01");
    if (!anexog1_quadro7) {
      console.log("AnexoG1q07T01 não encontrado, criando novo AnexoG1q07T01");
      anexog1_quadro7 = xmlDoc.createElementNS(
        quadro7.namespaceURI,
        "AnexoG1q07T01"
      );
      quadro7.appendChild(anexog1_quadro7);
    }

    let currNLinha = 701 + anexog1_quadro7.children.length; // Garante que se já houverem linhas no quadro, as novas linhas terão numeração sequencial correta
    let currNumero = anexog1_quadro7.children.length + 1;

    const gains = this.format(events);

    for (const gain of gains) {
      const linha = xmlDoc.createElementNS(
        quadro7.namespaceURI,
        "AnexoG1q07T01-Linha"
      );
      linha.setAttribute("numero", currNumero.toString());

      const add = (tag: string, value: string) => {
        const node = xmlDoc.createElementNS(quadro7.namespaceURI, tag);
        node.textContent = value;
        linha.appendChild(node);
      };

      add("NLinha", currNLinha.toString());
      add("Titular", gain["Titular"].toString());
      add("CodPaisEntGestora", gain["País da Entidade Gestora"].split("-")[0].trim());
      add("AnoRealizacao", gain["Ano de Realização"].toString());
      add("MesRealizacao", gain["Mês de Realização"].toString());
      add("DiaRealizacao", gain["Dia de Realização"].toString());
      add("ValorRealizacao", gain["Valor de Realização"].toString());
      add("AnoAquisicao", gain["Ano de Aquisição"].toString());
      add("MesAquisicao", gain["Mês de Aquisição"].toString());
      add("DiaAquisicao", gain["Dia de Aquisição"].toString());
      add("ValorAquisicao", gain["Valor de Aquisição"].toString());
      add("DespesasEncargos", gain["Despesas e Encargos"].toString());
      add(
        "CodPaisContraparte",
        gain["País da Contraparte"].split("-")[0].trim()
      );

      anexog1_quadro7.appendChild(linha);
      currNLinha++;
      currNumero++;
    }

    let quadro7_T01SomaC01 = quadro7.querySelector("AnexoG1q07T01SomaC01");
    if (!quadro7_T01SomaC01) {
      quadro7_T01SomaC01 = xmlDoc.createElementNS(quadro7.namespaceURI, "AnexoG1q07T01SomaC01");
      quadro7_T01SomaC01.textContent = (Math.round(gains.reduce((acc, gain) => acc + gain["Valor de Realização"], 0) * 100) / 100).toString();
      quadro7.appendChild(quadro7_T01SomaC01);
    }
    let quadro7_T01SomaC02 = quadro7.querySelector("AnexoG1q07T01SomaC02");
    if (!quadro7_T01SomaC02) {
      quadro7_T01SomaC02 = xmlDoc.createElementNS(quadro7.namespaceURI, "AnexoG1q07T01SomaC02");
      quadro7_T01SomaC02.textContent = (Math.round(gains.reduce((acc, gain) => acc + gain["Valor de Aquisição"], 0) * 100) / 100).toString();
      quadro7.appendChild(quadro7_T01SomaC02);
    }
    let quadro7_T01SomaC03 = quadro7.querySelector("AnexoG1q07T01SomaC03");
    if (!quadro7_T01SomaC03) {
      quadro7_T01SomaC03 = xmlDoc.createElementNS(quadro7.namespaceURI, "AnexoG1q07T01SomaC03");
      quadro7_T01SomaC03.textContent = (Math.round(gains.reduce((acc, gain) => acc + gain["Despesas e Encargos"], 0) * 100) / 100).toString();
      quadro7.appendChild(quadro7_T01SomaC03);
    }
  }
}

export { PTAnexoG1Quadro7Formatter };
