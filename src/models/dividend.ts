type DividendForUser = {
  "Ticker": string;
  "Data": string;
  "Valor": number;
  "Despesas": number;
  "Moeda Original": string;
  "Taxa de Câmbio": number;
  "Balanço": number;
};

type DividendToExcel = {
  "Ticker": string;
  "ISIN": string;
  "Data": string;
  "Valor": number;
  "Despesas": number;
  "Moeda Original": string;
  "Taxa de Câmbio": number;
  "Balanço": number;
};




export { DividendForUser, DividendToExcel  };