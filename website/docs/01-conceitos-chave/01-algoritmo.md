# Algoritmo

Queres descobrir a magia por detrás do **maisvalias-tool**? ✨ 

Então relaxa, chegaste ao sítio certo! Vamos lá para desvendar os seus segredos!

:::info

Antes de procederes, recomendo-te a leres a página [Terminologia](./terminologia) para te familiarizares com certos termos que serão utilizados mais à frente.

:::

Para explicar o algoritmo base penso que a melhor forma é dando um exemplo, neste caso iremos apenas considerar mais-valias obtidas da compra e venda de ações/ETFs.

## Cenário

Imaginando que, todos os anos, desde 2020, faço uma compra de 100€ do ETF _VUAA_.
No final do ano de 2024, por motivos pessoais, fiz uma venda correspondente a 2 ações do ETF.

Preciso agora de declarar as mais-valias! 😱

O meu extrato de transações, de forma simplista e com valores hipotéticos, seria algo como:

| Ano | Transação | Nº de ações | Montante |
| :-: | :-: | :-: | :-: |
| 2020 | Compra | 1 | 100€ |
| 2021 | Compra | 0.8 | 100€ |
| 2022 | Compra | 0.6 | 100€ |
| 2023 | Compra | 0.4 | 100€ |
| 2024 | Compra | 0.2 | 100€ |
| 2024 | Venda | 2 | 1000€ |

No ano de 2025, em que terei de preencher a declaração referente às mais valias de 2024, terei de referir a mais valia que obtive com a venda das duas ações do ETF.

## Determinar que ações foram vendidas

Agora é importante identificar quais foram as ações vendidas, porque, dependendo de quanto tempo já as detínhamos, isso pode trazer-nos alguns benefícios fiscais.

Segundo [alínea d), nº 6, artigo 43](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/irs/Pages/irs47.aspx) do código do imposto sobre o rendimento das pessoas singulares (CIRS), a data de aquisição segue a estratégia [FIFO - _First In First Out_](./terminologia#-fifo-first-in-first-out). 
Isto significa que a venda das 2 ações devem ser [compensadas](./terminologia#-compensações) com as compras mais antigas (e que ainda não foram compensadas por vendas anteriores).

Neste caso particular, teremos de utilizar as compras de 2020, 2021 e 2022 para compensar a venda, já que a soma das ações compradas nesses anos, dá `1 + 0.8 + 0.2 = 2`. Neste caso apenas declaramos a venda de 0.2 das 0.6 ações compradas em 2022.

## Calcular as mais-valias

Agora que temos as compras e vendas identificadas, já podemos proceder ao cálculo das mais-valias.
Para tal, temos de identificar o [valor de aquisição](./terminologia#-valor-de-aquisição) e o [valor de realização](./terminologia#-valor-de-realização) para cada [compensação](./terminologia#-compensações) identificada.

### Valor de realização

**O [valor de realização](./terminologia#-valor-de-realização) (ou valor de venda) segue a seguinte fórmula: `Valor de 1 ação * nº de ações vendidas`**.

No exemplo, a venda de 2 ações por 1000€ significa que o `Valor de 1 ação` foi de `(1000 / 2) = 500€`.

Como tal, para cada [compensação](./terminologia#-compensações), o respetivo [valor de realização](./terminologia#-valor-de-realização) é o seguinte:

| Ano | Nº de ações vendidas | Valor de Realização
| :-: | :-:  | :-:  |
| 2020 | 1 | 500€ * 1 = 500€ |
| 2021 | 0.8 | 500€ * 0.8 = 400€  |
| 2022 | 0.2 | 500€ * 0.2 = 100€ |

### Valor de aquisição

**O [valor de aquisição](./terminologia#-valor-de-aquisição) (ou valor de compra) segue a seguinte fórmula: `Valor comprado * nº de ações vendidas / nº ações compradas`**.

Assim sendo, para cada [compensação](./terminologia#-compensações), o respetivo [valor de aquisição](./terminologia#-valor-de-aquisição) é o seguinte:

| Ano | Nº de ações compradas | Nº de ações vendidas | Valor de Aquisição
| :-: | :-:  | :-: | :-: |
| 2020 | 1 | 1 | 100€ * 1 / 1 = 100€ |
| 2021 | 0.8 |  0.8 | 100€ * 0.8 / 0.8 = 100€ |
| 2022 | 0.6 |  0.2 | 100€ * 0.2 / 0.6 = 33.33€ |

## Declarar no IRS

Neste caso a declaração das mais valias teria de ter a seguinte informação, de **forma simplista**:

| Ano de Aquisição | Valor de Aquisição | Ano de Realização | Valor de Realização |
| :-: | :-: | :-: | :-: |
| 2020 | 100€ | 2024 | 500€ |
| 2021 | 100€ | 2024 | 400€ |
| 2022 | 33.33€ | 2024 | 100€ |

:::warning

Como este é um exemplo simples para mostrar os traços gerais do algoritmo, os dados que aparecem acima não estão no formato requerido pela Autoridade Tributária e Aduaneira (AT). 

Este não é o formato fornecido pela ferramenta **maisvalias-tool** e serve apenas para tentar dar a conhecer o funcionamento do programa.

:::

**A mais-valia desta venda segue a seguinte fórmula: `Mais Valia = Valor total de Venda - Valor total de Compra`**.

Sendo assim a mais-valia foi de:
* Valor total de venda: `500€ + 400€ + 100€ = 1000€`
* Valor total de compra: `100€ + 100€ + 33.33€ = 233.33€`
* Mais valia: `1000€ - 233.33 = 766.67€`

## Encargos e Impostos

Não sei se reparaste, mas até aqui não foi mencionado no cálculo os custos vindos da compra e venda das ações.

O exemplo não tem em conta impostos retidos no estrangeiro ou despesas e encargos na compra e venda de ações/ETFs.

As despesas e encargos, assim como os impostos retidos no estrangeiro seguem a mesma lógica do [valor de realização](./terminologia#-valor-de-realização) quando aplicados **no momento da venda**. Isto significa que se uma venda [compensar](./terminologia#-compensações) múltiplas compras, os encargos de venda serão distribuídos pelas compras [compensadas](./terminologia#-compensações), conforme a fração de ações que a compra representa na venda.
A fórmula é a seguinte:

> `Encargo na venda = Valor total do encargo na venda * Nº ações compradas / Nº ações vendidas`

Para facilitar, nada melhor como um exemplo. **Considerando que na venda existiu um encargo de 100€:**

| Ano |  Nº de ações compradas | Nº de ações vendidas | Valor do encargo
| :-: |  :-:  | :-: | :-: |
| 2020 |  1 | 1 | 100€ * 1 / 2 = 50€ |
| 2021 |  0.8 |  0.8 | 100€ * 0.8 / 2 = 40€ |
| 2022 |  0.6 |  0.2 | 100€ * 0.2 / 2 = 10€ |

Os encargos aplicados no momento de compra são somados no [valor de aquisição](./terminologia#-valor-de-aquisição).
A fórmula é a seguinte:

> `Encargo na compra = Valor total do encargo na compra * Nº ações compradas / Nº ações vendidas`

Assim, **se houver um encargo de 10€ em cada compra**, então:

| Ano |  Nº de ações compradas | Nº de ações vendidas | Valor do encargo
| :-: |  :-:  | :-: | :-: |
| 2020 |  1 | 1 | 10€ * 1 / 1 = 10€ |
| 2021 |  0.8 |  0.8 | 10€ * 0.8 / 0.8 = 10€ |
| 2022 |  0.6 |  0.2 | 10€ * 0.2 / 0.6 = 3.33€ |

Deste modo, o total de encargos seria:

> `Total de encargos = Valor total de encargos na compra + Valor total de encargos na venda`

| Ano |  Total encargos
| :-: |  :-:  |
| 2020 |  10€ + 50€ = 60€ |
| 2021 |  10€ + 40€ = 50€ |
| 2022 |  3.33€ + 10€ = 13.33€ | 

O total de encargos seria: `60€ + 50€ + 13.33€ = 123.33€`.

Este raciocínio aplica-se tanto para os [encargos](./terminologia#-encargos) como para os [impostos retidos na fonte](./terminologia#%EF%B8%8F-impostos-retidos-na-fonte).