type DividendForUser = {
  "Ticker": string;
  "Data": string;
  "Valor": number;
  "Despesas": number;
  "Moeda Original": string;
  "Taxa de Câmbio": number;
  "Balanço": number;
};

type DividendToIRS = {
  "Ano rendimento": string,
  "Código Rendimento":
  string,
  "País da fonte": string,
  "Rendimento Bruto": number,
  "Imposto Pago no Estrangeiro - No país da fonte": number,
}

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


export { DividendToIRS, DividendForUser, DividendToExcel };