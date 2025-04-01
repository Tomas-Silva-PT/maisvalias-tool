# Terminologia

Familiariza-te com os termos mais técnicos. 🔍

Para compreenderes melhor o funcionamento desta ferramenta, existem alguns termos importantes a compreender para estarmos em sintonia.

## 🔄 FIFO (_First In, First Out_)

É um método de contabilidade utilizado para determinar como fazer [compensações](#compensacoes) de vendas com compras. No contexto de cálculo de mais-valias, o método FIFO indica que a **venda de um ativo é compensada pelas compras mais antigas ainda não vendidas**.

Este é o método utilizado pela Autoridade Tributária e Aduaneira (AT) para cálculo das mais-valias a declarar no IRS. Recomendo consultar a [alínea d), nº 6, artigo 43](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/irs/Pages/irs47.aspx) do código do imposto sobre o rendimento das pessoas singulares (CIRS).

## 💰 Mais-Valias
Representa o lucro obtido na venda de um ativo financeiro. Calcula-se subtraindo o [valor de aquisição](#valor-de-aquisição) do ativo ao [valor de realização](#valor-de-realização).



**Fórmula:**
```
Mais-Valia = Valor total de venda - Valor total de compra
```

## 💵 Valor de Realização
Também conhecido como o valor de venda, é o montante total recebido pela venda de um ativo. Calcula-se multiplicando o número de ações vendidas pelo preço unitário da ação.

**Fórmula:**
```
Valor de Realização = Valor de 1 ação * Nº de ações vendidas
```

Na verdade no valor de realização também são incluídos custos associados com a venda, como por exemplo [encargos](#encargos) ou [impostos](#impostos-retidos-na-fonte).

## 💵 Valor de Aquisição
Também conhecido como o valor de compra, é o montante total gasto na compra de um ativo. Calcula-se multiplicando o número de ações compradas pelo preço unitária da ação.

**Fórmula:**
```
Valor de Aquisição = Valor de 1 ação * Nº de ações compradas
```

Na verdade no valor de aquisição também são incluídos custos associados com a compra, como por exemplo [encargos](#encargos).

## 💸 Encargos
Despesas associadas à compra e venda de ativos, como taxas de câmbio. Estes encargos também são declarados no IRS.

## 🏛️ Impostos Retidos na Fonte
Impostos cobrados automaticamente pela corretora no momento do pagamento de dividendos ou realização de mais-valias.

## 📊 ETFs (_Exchange-Traded Funds_)
Fundos de investimento negociados em bolsa que replicam o desempenho de um índice ou setor específico.

Alguns exemplos conhecidos são os índices [S&P500](https://www.google.com/finance/quote/.INX:INDEXSP) e [MSCI World](https://www.msci.com/indexes/index/990100).

## 🏦 Ações

Uma ação representa uma fração do capital social de uma empresa. Ao adquirir ações, o investidor torna-se acionista e pode beneficiar de valorização do preço da ação e distribuição de dividendos.

## 💲 Dividendos

Os dividendos são a parte dos lucros de uma empresa distribuída aos acionistas. Podem ser pagos em dinheiro ou em ações adicionais e são uma forma de rendimento para investidores que detêm ações de empresas que distribuem lucros regularmente.

## 📝 Declaração de IRS
Documento fiscal anual onde, entre muitas outras coisas, são declarados os rendimentos e mais-valias obtidas ao longo do ano com a compra e venda de [ações](#ações) e [ETFs](#etfs-exchange-traded-funds). A maisvalias-tool ajuda a calcular e formatar corretamente esses valores para a declaração.

## 📜 Histórico de Transações
Lista de todas as operações de compra e venda realizadas numa corretora. Para calcular corretamente as mais-valias, é necessário carregar o histórico completo do ativo desde a primeira compra.

Este histórico também contém os [dividendos](#dividendos) obtidos.

## 🏛️ Corretora
Plataforma onde se compram e vendem ativos financeiros, como ações e ETFs. Para saber que corretoras são suportadas pela **maisvalias-tool**, consultar a aba [Quais são as corretoras suportadas?](../intro#-quais-são-as-corretoras-suportadas).

## 🔄 Compensações

O processo de compensação ocorre quando as vendas de ativos são associadas às compras anteriores para determinar a mais-valia ou menos-valia resultante. No método [FIFO](#fifo-first-in-first-out), as compras mais antigas são utilizadas primeiro para compensar as vendas.

Este cálculo é essencial para determinar corretamente o imposto a pagar sobre os ganhos obtidos.