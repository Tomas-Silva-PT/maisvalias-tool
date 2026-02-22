import { AnexoJQuadro8A } from "../../../../../models/irs/panel.js";
import { IncomeEvent } from "../../../../../models/taxevent.js";
import { IRSFormatter } from "../../IRSFormatter.js";

class PTAnexoJQuadro8AFormatter implements IRSFormatter<IncomeEvent, AnexoJQuadro8A> {
  constructor() { }

  format(dividends: IncomeEvent[]): AnexoJQuadro8A[] {
    let result: AnexoJQuadro8A[] = [];

    const dividendsByAsset: Record<string, Record<string, IncomeEvent[]>> = {};

    // Agrupar dividendos por ativo e ano
    for (const dividend of dividends) {
      const isin = dividend.transaction.asset!!.isin;
      const year = dividend.transaction.date.year;
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

        totalGrossAmount = yearGroup.reduce((total, transaction) => { return total + transaction.amount; }, 0);
        totalFeesAmount = yearGroup.reduce((total, transaction) => { return total + transaction.fees; }, 0);
        totalTaxAmount = yearGroup.reduce((total, transaction) => { return total + transaction.taxes; }, 0);

        totalFeesAmount = parseFloat(totalFeesAmount.toFixed(2));
        totalTaxAmount = parseFloat(totalTaxAmount.toFixed(2));
        const totalExpenses = parseFloat(
          (totalFeesAmount + totalTaxAmount).toFixed(2)
        );

        totalGrossAmount = Math.round((totalGrossAmount) * 100) / 100;

        let countryDomiciled = yearGroup[0].transaction.asset!!.countryDomiciled;

        // Para ações domiciliadas em Portugal ou juros adquiridas em corretoras estrangeiras, o país da fonte deve ser o da corretora
        if (!countryDomiciled?.code || countryDomiciled?.code === "620") {
          countryDomiciled = yearGroup[0].transaction.broker.country;
        }

        const anoRendimento = yearGroup[0].transaction.date.year;
        let codigoRendimento;
        switch (yearGroup[0].kind) {
          case "dividend":
            codigoRendimento = "E11 - Dividendos ou lucros - sem retenção em Portugal"
            break;
          case "interest":
            codigoRendimento = "E21 - Juros sem retenção em Portugal"
            break;
        }


        let paisFonte = "";
        if (countryDomiciled?.code) {
          paisFonte = `${countryDomiciled?.code} - ${countryDomiciled?.namePt}`;
        }
        const rendimentoBruto = totalGrossAmount;
        const impostoPagoNoEstrangeiro = totalExpenses;

        const dividendForIRS: AnexoJQuadro8A = {
          "Ano rendimento": anoRendimento,
          "Código Rendimento": codigoRendimento,
          "País da fonte": paisFonte,
          "Rendimento Bruto": rendimentoBruto,
          "Imposto Pago no Estrangeiro - No país da fonte": impostoPagoNoEstrangeiro,
        };

        result.push(dividendForIRS);
      }
    }

    // Como na AT a chave de cada linha é o país da fonte e o código de rendimento, temos de agrupar dividendos segundo esses campos
    result = result.reduce((acc: AnexoJQuadro8A[], curr: AnexoJQuadro8A) => {
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

  toXML(xmlDoc: Document, events: IncomeEvent[]): void {
    const anexoJ = xmlDoc.querySelector("AnexoJ");
    if (!anexoJ) {
      throw new Error("O Anexo J não foi encontrado na declaração IRS.");
    }

    const quadro8 = anexoJ.querySelector("Quadro08");
    if (!quadro8) {
      throw new Error("O Quadro 8 não foi encontrado na declaração IRS.");
    }

    let quadro8A = quadro8.querySelector("AnexoJq08AT01");
    if (!quadro8A) {
      quadro8A = xmlDoc.createElementNS(
        quadro8.namespaceURI,
        "AnexoJq08AT01"
      );
      quadro8.appendChild(quadro8A);
    }

    // Contadores de linha (padrão AT)
    let currNLinha = 801 + quadro8A.childNodes.length;
    let currNumero = quadro8A.childNodes.length + 1;

    const dividends = this.format(events);

    for (const div of dividends) {
      const linha = xmlDoc.createElementNS(
        quadro8.namespaceURI,
        "AnexoJq08AT01-Linha"
      );
      linha.setAttribute("numero", currNumero.toString());

      const add = (tag: string, value: string) => {
        const node = xmlDoc.createElementNS(quadro8.namespaceURI, tag);
        node.textContent = value;
        linha.appendChild(node);
      };

      add("NLinha", currNLinha.toString());

      add(
        "CodRendimento",
        div["Código Rendimento"].split("-")[0].trim()
      );

      add(
        "CodPais",
        div["País da fonte"].split("-")[0].trim()
      );

      add(
        "RendimentoBruto",
        div["Rendimento Bruto"].toString()
      );

      add(
        "ImpostoPagoEstrangeiroPaisFonte",
        div["Imposto Pago no Estrangeiro - No país da fonte"].toString()
      );

      quadro8A.appendChild(linha);

      currNLinha++;
      currNumero++;
    }

    // --- Somatórios do quadro ---
    const somaBruto = Math.round(
      dividends.reduce(
        (acc, d) => acc + d["Rendimento Bruto"],
        0
      ) * 100
    ) / 100;

    const somaImposto = Math.round(
      dividends.reduce(
        (acc, d) =>
          acc + d["Imposto Pago no Estrangeiro - No país da fonte"],
        0
      ) * 100
    ) / 100;

    const somaC01 = quadro8.querySelector("AnexoJq08AT01SomaC01");
    if (!somaC01) {
      const node = xmlDoc.createElementNS(
        quadro8.namespaceURI,
        "AnexoJq08AT01SomaC01"
      );
      node.textContent = somaBruto.toString();
      quadro8.appendChild(node);
    }

    const somaC02 = quadro8.querySelector("AnexoJq08AT01SomaC02");
    if (!somaC02) {
      const node = xmlDoc.createElementNS(
        quadro8.namespaceURI,
        "AnexoJq08AT01SomaC02"
      );
      node.textContent = somaImposto.toString();
      quadro8.appendChild(node);
    }
  }

}

export { PTAnexoJQuadro8AFormatter };
