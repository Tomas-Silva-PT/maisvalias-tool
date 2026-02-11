// import { CapitalGainToIRS } from "../../../models/capitalgain";
// import { DividendToIRS } from "../../../models/dividend";

// class PTIRSFormatter {
//   static async format(xml: string, capitalGains: CapitalGainToIRS[], dividends: DividendToIRS[]) {
//     xml = xml.replace(/^\uFEFF/, "").trimStart(); // strip the BOM (UTF-8 Byte Order Mark)
//     if (
//       typeof window !== "undefined" &&
//       typeof window.DOMParser !== "undefined"
//     ) {
//       // Browser
//       return this._formatBrowserVersion(xml, capitalGains, dividends);
//     } else {
//       // Node.js
//       return this._formatServerVersion(xml, capitalGains, dividends);
//     }
//   }

//   static async _formatBrowserVersion(xml: string, capitalGains: CapitalGainToIRS[], dividends: DividendToIRS[]) {
//     const parser = new DOMParser();

//     const xmlDoc = parser.parseFromString(xml, "text/xml");

//     let currNLinha: number;
//     let currNumero: number;

//     // Verificar se existe o anexo J na declaração
//     const anexoJ = xmlDoc.querySelector("AnexoJ");
//     if (anexoJ === null) {
//       throw new Error(
//         "O Anexo J não foi encontrado na declaração IRS, por favor adicione antes de utilizar esta ferramenta."
//       );
//     }
//     if (capitalGains.length > 0) {
//       // No caso das mais valias de capital, verificar o quadro 9.2A
//       const quadro9 = anexoJ.querySelector("Quadro09");
//       if (quadro9 === null) {
//         throw new Error(
//           "O Quadro 9 nao foi encontrado na declaração IRS, por favor adicione antes de utilizar esta ferramenta."
//         );
//       }

//       let quadro9_2A = quadro9.querySelector("AnexoJq092AT01");
//       if (!quadro9_2A) {
//         quadro9_2A = xmlDoc.createElementNS(quadro9.namespaceURI, "AnexoJq092AT01");
//         quadro9.appendChild(quadro9_2A);
//       }
//       let quadro9_2A_lines = quadro9_2A.childNodes;
//       currNLinha = 951;
//       currNumero = 1;
//       if (quadro9_2A_lines) {
//         currNLinha += quadro9_2A_lines.length; // 951 é o padrão da AT para a primeira linha deste quadro
//       }

//       // Adicionar as mais valias de capital
//       capitalGains.forEach((gain) => {
//         const linha = xmlDoc.createElementNS(quadro9.namespaceURI, "AnexoJq092AT01-Linha");
//         linha.setAttribute("numero", currNumero.toString());

//         const NLinha = xmlDoc.createElementNS(quadro9.namespaceURI, "NLinha");
//         NLinha.textContent = currNLinha.toString();
//         linha.appendChild(NLinha);

//         const CodPais = xmlDoc.createElementNS(quadro9.namespaceURI, "CodPais");
//         CodPais.textContent = gain["País da fonte"].split("-")[0].trim();
//         linha.appendChild(CodPais);

//         const Codigo = xmlDoc.createElementNS(quadro9.namespaceURI, "Codigo");
//         Codigo.textContent = gain["Código"];
//         linha.appendChild(Codigo);

//         const AnoRealizacao = xmlDoc.createElementNS(quadro9.namespaceURI, "AnoRealizacao");
//         AnoRealizacao.textContent = gain["Ano de Realização"].toString();
//         linha.appendChild(AnoRealizacao);

//         const MesRealizacao = xmlDoc.createElementNS(quadro9.namespaceURI, "MesRealizacao");
//         MesRealizacao.textContent = gain["Mês de Realização"].toString();
//         linha.appendChild(MesRealizacao);

//         const DiaRealizacao = xmlDoc.createElementNS(quadro9.namespaceURI, "DiaRealizacao");
//         DiaRealizacao.textContent = gain["Dia de Realização"].toString();
//         linha.appendChild(DiaRealizacao);

//         const ValorRealizacao = xmlDoc.createElementNS(quadro9.namespaceURI, "ValorRealizacao");
//         ValorRealizacao.textContent = gain["Valor de Realização"].toString();
//         linha.appendChild(ValorRealizacao);

//         const AnoAquisicao = xmlDoc.createElementNS(quadro9.namespaceURI, "AnoAquisicao");
//         AnoAquisicao.textContent = gain["Ano de Aquisição"].toString();
//         linha.appendChild(AnoAquisicao);

//         const MesAquisicao = xmlDoc.createElementNS(quadro9.namespaceURI, "MesAquisicao");
//         MesAquisicao.textContent = gain["Mês de Aquisição"].toString();
//         linha.appendChild(MesAquisicao);

//         const DiaAquisicao = xmlDoc.createElementNS(quadro9.namespaceURI, "DiaAquisicao");
//         DiaAquisicao.textContent = gain["Dia de Aquisição"].toString();
//         linha.appendChild(DiaAquisicao);

//         const ValorAquisicao = xmlDoc.createElementNS(quadro9.namespaceURI, "ValorAquisicao");
//         ValorAquisicao.textContent = gain["Valor de Aquisição"].toString();
//         linha.appendChild(ValorAquisicao);

//         const DespesasEncargos = xmlDoc.createElementNS(quadro9.namespaceURI, "DespesasEncargos");
//         DespesasEncargos.textContent = gain["Despesas e Encargos"].toString();
//         linha.appendChild(DespesasEncargos);

//         const ImpostoPagoNoEstrangeiro = xmlDoc.createElementNS(quadro9.namespaceURI,
//           "ImpostoPagoNoEstrangeiro"
//         );
//         ImpostoPagoNoEstrangeiro.textContent =
//           gain["Imposto retido no estrangeiro"].toString();
//         linha.appendChild(ImpostoPagoNoEstrangeiro);

//         const CodPaisContraparte = xmlDoc.createElementNS(quadro9.namespaceURI, "CodPaisContraparte");
//         CodPaisContraparte.textContent = gain["País da Contraparte"]
//           .split("-")[0]
//           .trim();
//         linha.appendChild(CodPaisContraparte);

//         quadro9_2A.appendChild(linha);
//         currNLinha++;
//         currNumero++;
//       });

//       let quadro9_2A_T01SomaC01 = quadro9.querySelector("AnexoJq092AT01SomaC01");
//       if (!quadro9_2A_T01SomaC01) {
//         quadro9_2A_T01SomaC01 = xmlDoc.createElementNS(quadro9.namespaceURI, "AnexoJq092AT01SomaC01");
//         quadro9_2A_T01SomaC01.textContent = (Math.round(capitalGains.reduce((acc, gain) => acc + gain["Valor de Realização"], 0) * 100) / 100).toString();
//         quadro9.appendChild(quadro9_2A_T01SomaC01);
//       }
//       let quadro9_2A_T01SomaC02 = quadro9.querySelector("AnexoJq092AT01SomaC02");
//       if (!quadro9_2A_T01SomaC02) {
//         quadro9_2A_T01SomaC02 = xmlDoc.createElementNS(quadro9.namespaceURI, "AnexoJq092AT01SomaC02");
//         quadro9_2A_T01SomaC02.textContent = (Math.round(capitalGains.reduce((acc, gain) => acc + gain["Valor de Aquisição"], 0) * 100) / 100).toString();
//         quadro9.appendChild(quadro9_2A_T01SomaC02);
//       }
//       let quadro9_2A_T01SomaC03 = quadro9.querySelector("AnexoJq092AT01SomaC03");
//       if (!quadro9_2A_T01SomaC03) {
//         quadro9_2A_T01SomaC03 = xmlDoc.createElementNS(quadro9.namespaceURI, "AnexoJq092AT01SomaC03");
//         quadro9_2A_T01SomaC03.textContent = (Math.round(capitalGains.reduce((acc, gain) => acc + gain["Despesas e Encargos"], 0) * 100) / 100).toString();
//         quadro9.appendChild(quadro9_2A_T01SomaC03);
//       }
//       let quadro9_2A_T01SomaC04 = quadro9.querySelector("AnexoJq092AT01SomaC04");
//       if (!quadro9_2A_T01SomaC04) {
//         quadro9_2A_T01SomaC04 = xmlDoc.createElementNS(quadro9.namespaceURI, "AnexoJq092AT01SomaC04");
//         quadro9_2A_T01SomaC04.textContent = (Math.round(capitalGains.reduce((acc, gain) => acc + gain["Imposto retido no estrangeiro"], 0) * 100) / 100).toString();
//         quadro9.appendChild(quadro9_2A_T01SomaC04);
//       }
//     }


//     // Adicionar dividendos
//     // No caso das mais valias de capital, verificar o quadro 8A
//     if (dividends.length > 0) {
//       const quadro8 = anexoJ.querySelector("Quadro08");
//       if (quadro8 === null) {
//         throw new Error(
//           "O Quadro 8 nao foi encontrado na declaração IRS, por favor adicione antes de utilizar esta ferramenta."
//         );
//       }

//       let quadro8A = quadro8.querySelector("AnexoJq08AT01");
//       if (!quadro8A) {
//         quadro8A = xmlDoc.createElementNS(quadro8.namespaceURI, "AnexoJq08AT01");
//         quadro8.appendChild(quadro8A);
//       }
//       let quadro8A_lines = quadro8A.childNodes;
//       currNLinha = 801; // é o padrão da AT para a primeira linha deste quadro
//       currNumero = 1;
//       if (quadro8A_lines) {
//         currNLinha += quadro8A_lines.length;
//       }

//       // Adicionar as mais valias de capital
//       dividends.forEach((div) => {
//         // console.log("Dividendo: " + JSON.stringify(div));
//         const linha = xmlDoc.createElementNS(quadro8.namespaceURI, "AnexoJq08AT01-Linha");
//         linha.setAttribute("numero", currNumero.toString());

//         const NLinha = xmlDoc.createElementNS(quadro8.namespaceURI, "NLinha");
//         NLinha.textContent = currNLinha.toString();
//         linha.appendChild(NLinha);

//         const CodRendimento = xmlDoc.createElementNS(quadro8.namespaceURI, "CodRendimento");
//         CodRendimento.textContent = div["Código Rendimento"]
//           .split("-")[0]
//           .trim();
//         linha.appendChild(CodRendimento);

//         const CodPais = xmlDoc.createElementNS(quadro8.namespaceURI, "CodPais");
//         CodPais.textContent = div["País da fonte"].split("-")[0].trim();
//         linha.appendChild(CodPais);

//         const RendimentoBruto = xmlDoc.createElementNS(quadro8.namespaceURI, "RendimentoBruto");
//         RendimentoBruto.textContent = div["Rendimento Bruto"].toString();
//         linha.appendChild(RendimentoBruto);

//         const ImpostoPagoEstrangeiroPaisFonte = xmlDoc.createElementNS(quadro8.namespaceURI,
//           "ImpostoPagoEstrangeiroPaisFonte"
//         );
//         ImpostoPagoEstrangeiroPaisFonte.textContent =
//           div["Imposto Pago no Estrangeiro - No país da fonte"].toString();
//         linha.appendChild(ImpostoPagoEstrangeiroPaisFonte);

//         quadro8A.appendChild(linha);
//         currNLinha++;
//         currNumero++;
//       });

//       let quadro8_A_T01SomaC01 = quadro8.querySelector("AnexoJq08AT01SomaC01");
//       if (!quadro8_A_T01SomaC01) {
//         quadro8_A_T01SomaC01 = xmlDoc.createElementNS(quadro8.namespaceURI, "AnexoJq08AT01SomaC01");
//         quadro8_A_T01SomaC01.textContent = (Math.round((dividends.reduce((acc, dividend) => acc + dividend["Rendimento Bruto"], 0) * 100)) / 100).toString();
//         quadro8.appendChild(quadro8_A_T01SomaC01);
//       }
//       let quadro8_A_T01SomaC02 = quadro8.querySelector("AnexoJq08AT01SomaC02");
//       if (!quadro8_A_T01SomaC02) {
//         quadro8_A_T01SomaC02 = xmlDoc.createElementNS(quadro8.namespaceURI, "AnexoJq08AT01SomaC02");
//         quadro8_A_T01SomaC02.textContent = (Math.round((dividends.reduce((acc, dividend) => acc + dividend["Imposto Pago no Estrangeiro - No país da fonte"], 0) * 100)) / 100).toString();
//         quadro8.appendChild(quadro8_A_T01SomaC02);
//       }
//       // let quadro8_A_T01SomaC03 = quadro8.querySelector("AnexoJq082AT01");
//       // if (!quadro8_A_T01SomaC03) {
//       //   quadro8_A_T01SomaC03 = xmlDoc.createElementNS(quadro8.namespaceURI, "AnexoJq082AT01");
//       //   quadro8.appendChild(quadro8_A_T01SomaC03);
//       // }
//       // let quadro8_A_T01SomaC04 = quadro8.querySelector("AnexoJq082AT01");
//       // if (!quadro8_A_T01SomaC04) {
//       //   quadro8_A_T01SomaC04 = xmlDoc.createElementNS(quadro8.namespaceURI, "AnexoJq082AT01");
//       //   quadro8.appendChild(quadro8_A_T01SomaC04);
//       // }
//     }


//     const xmlString = new XMLSerializer().serializeToString(xmlDoc);

//     return xmlString;
//   }

//   static async _formatServerVersion(xml: string, capitalGains: CapitalGainToIRS[], dividends: DividendToIRS[]) {
//     // Node.js (dynamic import to avoid bundling errors in browser)
//     const { DOMParser, XMLSerializer } = await import("@xmldom/xmldom");
//     const parser = new DOMParser();

//     const xmlDoc = parser.parseFromString(xml, "text/xml");

//     // Verificar se existe o anexo J na declaração
//     const anexoJ = xmlDoc.getElementsByTagName("AnexoJ")[0];
//     if (!anexoJ) {
//       throw new Error(
//         "O Anexo J não foi encontrado na declaração IRS, por favor adicione antes de utilizar esta ferramenta."
//       );
//     }

//     // No caso das mais valias de capital, verificar o quadro 9.2A
//     const quadro9 = xmlDoc.getElementsByTagName("Quadro09")[0];
//     if (!quadro9) {
//       throw new Error(
//         "O Quadro 9 nao foi encontrado na declaração IRS, por favor adicione antes de utilizar esta ferramenta."
//       );
//     }

//     const quadro9_2A = xmlDoc.getElementsByTagName("AnexoJq092AT01")[0];
//     if (!quadro9_2A) {
//       throw new Error(
//         "O Quadro 9.2A nao foi encontrado na declaração IRS, por favor adicione antes de utilizar esta ferramenta."
//       );
//     }
//     let quadro9_2A_lines = quadro9_2A.childNodes;
//     let currNLinha = 951;
//     let currNumero = 1;
//     if (quadro9_2A_lines) {
//       currNLinha += quadro9_2A_lines.length; // 951 é o padrão da AT para a primeira linha deste quadro
//     }

//     // Adicionar as mais valias de capital
//     capitalGains.forEach((gain) => {
//       const linha = xmlDoc.createElement("AnexoJq092AT01-Linha");
//       linha.setAttribute("numero", currNumero.toString());

//       const addNode = (tag: string, value: string) => {
//         const node = xmlDoc.createElement(tag);
//         node.textContent = value;
//         linha.appendChild(node);
//       };

//       addNode("NLinha", currNLinha.toString());
//       addNode("CodPais", gain["País da fonte"].split("-")[0].trim());
//       addNode("Codigo", gain["Código"]);
//       addNode("AnoRealizacao", gain["Ano de Realização"].toString());
//       addNode("MesRealizacao", gain["Mês de Realização"].toString());
//       addNode("DiaRealizacao", gain["Dia de Realização"].toString());
//       addNode("ValorRealizacao", gain["Valor de Realização"].toString());
//       addNode("AnoAquisicao", gain["Ano de Aquisição"].toString());
//       addNode("MesAquisicao", gain["Mês de Aquisição"].toString());
//       addNode("DiaAquisicao", gain["Dia de Aquisição"].toString());
//       addNode("ValorAquisicao", gain["Valor de Aquisição"].toString());
//       addNode("DespesasEncargos", gain["Despesas e Encargos"].toString());
//       addNode(
//         "ImpostoPagoNoEstrangeiro",
//         gain["Imposto retido no estrangeiro"].toString()
//       );
//       addNode(
//         "CodPaisContraparte",
//         gain["País da Contraparte"].split("-")[0].trim()
//       );

//       quadro9_2A.appendChild(linha);
//       currNLinha++;
//       currNumero++;
//     });

//     // No caso das mais valias de dividendos, verificar o quadro 8A
//     const quadro8 = anexoJ.getElementsByTagName("Quadro08")[0];
//     if (!quadro8) {
//       throw new Error(
//         "O Quadro 8 nao foi encontrado na declaração IRS, por favor adicione antes de utilizar esta ferramenta."
//       );
//     }

//     let quadro8A = quadro8.getElementsByTagName("AnexoJq08AT01")[0];
//     if (!quadro8A) {
//       //   throw new Error(
//       //     "O Quadro 8A nao foi encontrado na declaração IRS, por favor adicione antes de utilizar esta ferramenta."
//       //   );
//       quadro8A = xmlDoc.createElement("AnexoJq08AT01");
//       quadro8.appendChild(quadro8A);
//     }
//     let quadro8A_lines = quadro8A.childNodes;
//     currNLinha = 801; // é o padrão da AT para a primeira linha deste quadro
//     currNumero = 1;
//     if (quadro8A_lines) {
//       currNLinha += quadro8A_lines.length;
//     }

//     // Adicionar as mais valias de capital
//     dividends.forEach((div) => {
//       const linha = xmlDoc.createElement("AnexoJq08AT01-Linha");
//       linha.setAttribute("numero", currNumero.toString());

//       const addNode = (tag: string, value: string) => {
//         const node = xmlDoc.createElement(tag);
//         node.textContent = value;
//         linha.appendChild(node);
//       };

//       addNode("NLinha", currNLinha.toString());
//       addNode("CodRendimento", div["Código Rendimento"].split("-")[0].trim());
//       addNode("CodPais", div["País da fonte"].split("-")[0].trim());
//       addNode("RendimentoBruto", div["Rendimento Bruto"].toString());
//       addNode(
//         "ImpostoPagoEstrangeiroPaisFonte",
//         div["Imposto Pago no Estrangeiro - No país da fonte"].toString()
//       );

//       quadro8A.appendChild(linha);
//       currNLinha++;
//       currNumero++;
//     });

//     // Converter documento para string
//     const xmlString = new XMLSerializer().serializeToString(xmlDoc);

//     return xmlString;
//   }
// }

// export { PTIRSFormatter };
