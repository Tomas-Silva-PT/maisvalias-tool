import { CapitalGainEvent } from "./taxevent";

type CapitalGainForUser = {
  transaction: CapitalGainEvent;
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



export { CapitalGainForUser, CapitalGainToExcel };
