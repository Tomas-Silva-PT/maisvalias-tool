type AnexoJQuadro92A = {
  "País da fonte": string;
  "Código": string;
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

type AnexoJQuadro94A = {
  "País da fonte": string;
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


type AnexoJQuadro8A = {
  "Ano rendimento": number,
  "Código Rendimento":
  string,
  "País da fonte": string,
  "Rendimento Bruto": number,
  "Imposto Pago no Estrangeiro - No país da fonte": number,
}

type AnexoG1Quadro7 = {
  "Titular": string;
  "País": string;
  "Ano de Aquisição": number;
  "Mês de Aquisição": number;
  "Dia de Aquisição": number;
  "Valor de Aquisição": number;
  "Ano de Realização": number;
  "Mês de Realização": number;
  "Dia de Realização": number;
  "Valor de Realização": number;
  "Despesas e Encargos": number;
  "País da Contraparte": string;
}

export { AnexoJQuadro92A, AnexoJQuadro8A, AnexoJQuadro94A, AnexoG1Quadro7 };