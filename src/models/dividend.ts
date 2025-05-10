type DividendForUser = {
  Ticker: string;
  "Ano rendimento": string;
  "Código Rendimento": string;
  "País da fonte": string;
  "Rendimento Bruto": number;
  "Imposto Pago no Estrangeiro - No país da fonte": number;
};

type Dividend = {
    "Ano rendimento": string,
    "Código Rendimento":
      string,
    "País da fonte": string,
    "Rendimento Bruto": number,
    "Imposto Pago no Estrangeiro - No país da fonte": number,
}

export { Dividend, DividendForUser };