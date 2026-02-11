import { AnexoJQuadro92A } from "../../../../../models/irs/panel.js";
import { RealizedTransaction } from "../../../../../models/transaction.js";
import { IRSFormatter } from "../../IRSFormatter.js";

class PTAnexoJQuadro92AFormatter implements IRSFormatter<RealizedTransaction, AnexoJQuadro92A> {
  constructor() { }

  format(transactions: RealizedTransaction[]): AnexoJQuadro92A[] {

    let capitalGains: AnexoJQuadro92A[] = [];

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

      let capitalGain: AnexoJQuadro92A = {
        "País da fonte": paisFonte,
        "Código": codigo,
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

  toXML(xmlDoc: Document, events: RealizedTransaction[]): void {
    const anexoJ = xmlDoc.querySelector("AnexoJ");
    if (!anexoJ) throw new Error("Falta AnexoJ");

    const quadro9 = anexoJ.querySelector("Quadro09");
    if (!quadro9) throw new Error("Falta Quadro09");

    let quadro9_2A = quadro9.querySelector("AnexoJq092AT01");
    if (!quadro9_2A) {
      quadro9_2A = xmlDoc.createElementNS(
        quadro9.namespaceURI,
        "AnexoJq092AT01"
      );
      quadro9.appendChild(quadro9_2A);
    }

    let currNLinha = 951 + quadro9_2A.childNodes.length; // Garante que se já houverem linhas no quadro, as novas linhas terão numeração sequencial correta
    let currNumero = quadro9_2A.childNodes.length + 1;

    const gains = this.format(events);

    for (const gain of gains) {
      const linha = xmlDoc.createElementNS(
        quadro9.namespaceURI,
        "AnexoJq092AT01-Linha"
      );
      linha.setAttribute("numero", currNumero.toString());

      const add = (tag: string, value: string) => {
        const node = xmlDoc.createElementNS(quadro9.namespaceURI, tag);
        node.textContent = value;
        linha.appendChild(node);
      };

      add("NLinha", currNLinha.toString());
      add("CodPais", gain["País da fonte"].split("-")[0].trim());
      add("Codigo", gain["Código"]);
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
        "ImpostoPagoNoEstrangeiro",
        gain["Imposto retido no estrangeiro"].toString()
      );
      add(
        "CodPaisContraparte",
        gain["País da Contraparte"].split("-")[0].trim()
      );

      quadro9_2A.appendChild(linha);
      currNLinha++;
      currNumero++;
    }

    let quadro9_2A_T01SomaC01 = quadro9.querySelector("AnexoJq092AT01SomaC01");
    if (!quadro9_2A_T01SomaC01) {
      quadro9_2A_T01SomaC01 = xmlDoc.createElementNS(quadro9.namespaceURI, "AnexoJq092AT01SomaC01");
      quadro9_2A_T01SomaC01.textContent = (Math.round(gains.reduce((acc, gain) => acc + gain["Valor de Realização"], 0) * 100) / 100).toString();
      quadro9.appendChild(quadro9_2A_T01SomaC01);
    }
    let quadro9_2A_T01SomaC02 = quadro9.querySelector("AnexoJq092AT01SomaC02");
    if (!quadro9_2A_T01SomaC02) {
      quadro9_2A_T01SomaC02 = xmlDoc.createElementNS(quadro9.namespaceURI, "AnexoJq092AT01SomaC02");
      quadro9_2A_T01SomaC02.textContent = (Math.round(gains.reduce((acc, gain) => acc + gain["Valor de Aquisição"], 0) * 100) / 100).toString();
      quadro9.appendChild(quadro9_2A_T01SomaC02);
    }
    let quadro9_2A_T01SomaC03 = quadro9.querySelector("AnexoJq092AT01SomaC03");
    if (!quadro9_2A_T01SomaC03) {
      quadro9_2A_T01SomaC03 = xmlDoc.createElementNS(quadro9.namespaceURI, "AnexoJq092AT01SomaC03");
      quadro9_2A_T01SomaC03.textContent = (Math.round(gains.reduce((acc, gain) => acc + gain["Despesas e Encargos"], 0) * 100) / 100).toString();
      quadro9.appendChild(quadro9_2A_T01SomaC03);
    }
    let quadro9_2A_T01SomaC04 = quadro9.querySelector("AnexoJq092AT01SomaC04");
    if (!quadro9_2A_T01SomaC04) {
      quadro9_2A_T01SomaC04 = xmlDoc.createElementNS(quadro9.namespaceURI, "AnexoJq092AT01SomaC04");
      quadro9_2A_T01SomaC04.textContent = (Math.round(gains.reduce((acc, gain) => acc + gain["Imposto retido no estrangeiro"], 0) * 100) / 100).toString();
      quadro9.appendChild(quadro9_2A_T01SomaC04);
    }
  }
}

export { PTAnexoJQuadro92AFormatter };
