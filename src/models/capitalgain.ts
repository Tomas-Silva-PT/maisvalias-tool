import { RealizedTransaction } from "./transaction.js";

type CapitalGain = {
  transaction: RealizedTransaction;
  Ticker: string;
  "País da fonte": string;
  Código: string;
  "Ano de Aquisição": number;
  "Mês de Aquisição": number;
  "Dia de Aquisição": number;
  "Valor de Aquisição": number;
  "Ano de Realização": number;
  "Mês de Realização": number;
  "Dia de Realização": number;
  "Valor de Realização": number;
  "Despesas e Encargos": number;
  "Imposto retido no estrangeiro": number;
  "País da Contraparte": string;
};

export { CapitalGain };
