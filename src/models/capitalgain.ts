import { RealizedTransaction } from "./transaction.js";

type CapitalGainForUser = {
  transaction: RealizedTransaction;
  "Ticker": string;
  "Realização": {
    "Data": string;
    "Valor": number;
    "Despesas": number;
    "Moeda Original": string;
    "Taxa de Câmbio": number;
  };
  "Aquisição": {
    "Data": string;
    "Valor": number;
    "Despesas": number;
    "Moeda Original": string;
    "Taxa de Câmbio": number;
  }
  "Balanço": number;
};

type CapitalGainToIRS = {
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

type CapitalGainToExcel = {
  "Ticker": string;
  "ISIN": string;
  "Data de Aquisição": string;
  "Valor de Aquisição": number;
  "Despesas de Aquisição": number;
  "Moeda Original de Aquisição": string;
  "Taxa de Câmbio de Aquisição": number;
  "Data de Realização": string;
  "Valor de Realização": number;
  "Despesas de Realização": number;
  "Moeda Original de Realização": string;
  "Taxa de Câmbio de Realização": number;
  "Balanço": number;
};



export { CapitalGainForUser, CapitalGainToIRS, CapitalGainToExcel };
