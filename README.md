<p align="center">
    <img src="/assets/images/logo-no-bg.png" height="150" alt="logo">
</p>

---

# ⚠️ **Não utilizar! Esta ferramenta ainda está em processo de desenvolvimento!**

# maisvalias-tool

## O que é?

O software **maisvalias-tool** tem como objetivo calcular automaticamente os valores de investimentos a declarar no IRS.

Para quem utiliza a plataforma _Trading212_ para efetuar os seus investimentos poderá utilizar esta ferramenta para transformar o histórico de compras e vendas no formato requerido pela Autoridade Tributária e Aduaneira (AT) no momento de preenchimento da declaração anual de rendimentos.

## Como funciona?

O algoritmo por detrás do cálculo das mais valias é o seguinte:

Imaginando que, todos os anos, desde 2020, faço uma compra de 100€ do ETF _VUAA_.
No final do ano de 2024, por motivos pessoais, fiz uma venda correspondente a 2 ações do ETF.

O meu extrato de transações, de forma simplista e com valores hipotéticos, seria algo como:

| Ano | Transação | Nº de ações | Montante |
| :-: | :-: | :-: | :-: |
| 2020 | Compra | 1 | 100€ |
| 2021 | Compra | 0.8 | 100€ |
| 2022 | Compra | 0.6 | 100€ |
| 2023 | Compra | 0.4 | 100€ |
| 2024 | Compra | 0.2 | 100€ |
| 2024 | Venda | 2 | 1000€ |

No ano de 2025, em que terei de preencher a declaração referente às mais valias de 2024, terei de referir a mais valia obtida na venda das duas ações do ETF.

#### Determinar que ações foram vendidas

Segundo [alínea d), nº 6, artigo 43](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/irs/Pages/irs47.aspx) do código do imposto sobre o rendimento das pessoas singulares (CIRS), a data de aquisição segue a estratégia FIFO - _First In First Out_. 
Isto significa que a venda das 2 ações devem ser compensadas com as compras mais antigas (e que ainda não foram compensadas por vendas anteriores).

Neste caso particular, teremos de utilizar as compras de 2020, 2021 e 2022 para compensar a venda, já que a soma das ações compradas nesses anos, dá `1 + 0.8 + 0.2 = 2`. Neste caso apenas declaramos a venda de 0.2 das 0.6 ações compradas em 2022.

#### Calcular as mais-valias

**O valor de realização (ou valor de venda) segue a seguinte fórmula: `Valor de 1 ação * nº de ações vendidas`**.

No exemplo, a venda de 2 ações por 1000€ significa que o `Valor de 1 ação` foi de `(1000 / 2) = 500€`.


| Ano | Nº de ações vendidas | Valor de Realização
| :-: | :-:  | :-:  |
| 2020 | 1 | 500€ * 1 = 500€ |
| 2021 | 0.8 | 500€ * 0.8 = 400€  |
| 2022 | 0.2 | 500€ * 0.2 = 100€ |



**O valor de aquisição (ou valor de compra) segue a seguinte fórmula: `Valor comprado * nº de ações vendidas / nº ações compradas`**.


| Ano | Nº de ações compradas | Nº de ações vendidas | Valor de Aquisição
| :-: | :-:  | :-: | :-: |
| 2020 | 1 | 1 | 100€ * 1 / 1 = 100€ |
| 2021 | 0.8 |  0.8 | 100€ * 0.8 / 0.8 = 100€ |
| 2022 | 0.6 |  0.2 | 100€ * 0.2 / 0.6 = 33.33€ |



Neste caso a declaração das mais valias teria de ter a seguinte informação, de forma simplista:

| Ano de Aquisição | Valor de Aquisição | Ano de Realização | Valor de Realização |
| :-: | :-: | :-: | :-: |
| 2020 | 100€ | 2024 | 500€ |
| 2021 | 100€ | 2024 | 400€ |
| 2022 | 33.33€ | 2024 | 100€ |

**A mais-valia desta venda segue a seguinte fórmula: `Mais Valia = Valor total de Venda - Valor total de Compra`**.

Sendo assim a mais-valia foi de:
* Valor total de venda: `500€ + 400€ + 100€ = 1000€`
* Valor total de compra: `100€ + 100€ + 33.33€ = 233.33€`
* Mais valia: `1000€ - 233.33 = 766.67€`

O exemplo acima não tem em conta impostos retidos no estrangeiro ou despesas e encargos na compra e venda de ações/ETFs.

As despesas e encargos, assim como os impostos retidos no estrangeiro seguem a mesma lógica do valor de realização quando aplicados **no momento da venda**. Isto significa que se uma venda compensar múltiplas compras, os encargos de venda serão distribuídos pelas compras compensadas, conforme a fração de ações que a compra representa na venda. Assim, **imaginando que na venda existiu um encargo de 100€:**



| Ano |  Nº de ações compradas | Nº de ações vendidas | Valor do encargo
| :-: |  :-:  | :-: | :-: |
| 2020 |  1 | 1 | 100€ * 1 / 2 = 50€ |
| 2021 |  0.8 |  0.8 | 100€ * 0.8 / 2 = 40€ |
| 2022 |  0.6 |  0.2 | 100€ * 0.2 / 2 = 10€ |



Os encargos aplicados no momento de compra são somados no valor de aquisição.
Assim, **se houver um encargo de 10€ em cada compra**, então:

| Ano |  Nº de ações compradas | Nº de ações vendidas | Valor do encargo
| :-: |  :-:  | :-: | :-: |
| 2020 |  1 | 1 | 10€ * 1 / 1 = 10€ |
| 2021 |  0.8 |  0.8 | 10€ * 0.8 / 0.8 = 10€ |
| 2022 |  0.6 |  0.2 | 10€ * 0.2 / 0.6 = 3.33€ |

O total de encargos seria:



| Ano |  Total encargos
| :-: |  :-:  |
| 2020 |  10€ + 50€ = 60€ |
| 2021 |  10€ + 40€ = 50€ |
| 2022 |  3.33€ + 10€ = 13.33€ | 

Este raciocínio aplica-se tanto para os encargos como para os impostos retidos na fonte.

## Quais os pressupostos/limitações?

Neste software, existem alguns pressupostos que são considerados:

1. Assume-se que todas as vendas de ações/ETFs foram declaradas corretamente nos seus respetivos anos.
2. É **necessário o carregamento do histórico completo das compras e vendas dos ativos vendidos**, ou seja, é necessário carregar os dados desde o ano em que foi feita a primeira compra do ativo na corretora. Para saber o porquê desta necessidade, consultar secção _[Como funciona?](#como-funciona)_.
3. Apenas suporta a declaração de ações e ETFs.
4. No ficheiro das transações fornecido pela **Trading212** não consta o _Exchange Rate_ utilizado na conversão de moedas, quando se trata de dividendos. Por este motivo é utilizada o rácio de fecho do dia em que o dividendo foi pago.

## Quais são as corretoras suportadas?

De seguida são apresentadas as corretoras **atualmente** suportadas:
<div style="margin-left: auto;
            margin-right: auto;
            width: 30%">

| Corretoras suportadas |
| :-: |
| <img title="Trading212" alt="T212" src="https://th.bing.com/th/id/R.49fba07b493df66a09a2744a56da5a12?rik=f1LkkhRSkudvig&pid=ImgRaw&r=0" width="200" height="auto"/> |
</div>

## Como utilizar?

## Disclaimer

O **maisvalias-tool** é uma ferramenta independente, cujos resultados produzidos não têm carácter vinculativo. Como tal, deve existir uma retificação dos resultados, assim como a consulta da legislação em vigor, consultando sempre que necessário a Autoridade Tributária e Aduaneira.
Deste modo não me responsabilizo por quaisquer perdas causadas pelo uso desta ferramenta.