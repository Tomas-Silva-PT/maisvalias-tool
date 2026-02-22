type InterestGainForUser = {
  "Data": string;
  "Valor": number;
  "Despesas": number;
  "Moeda Original": string;
  "Taxa de Câmbio": number;
  "Balanço": number;
};

type InterestGainToExcel = {
  "Data": string;
  "Valor": number;
  "Despesas": number;
  "Moeda Original": string;
  "Taxa de Câmbio": number;
  "Balanço": number;
};

export { InterestGainForUser, InterestGainToExcel };