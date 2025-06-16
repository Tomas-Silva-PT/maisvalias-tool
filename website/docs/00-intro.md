---
sidebar_position: 1
---

# Bem-vindo ao maisvalias-tool

Vem conhecer a ferramenta **maisvalias-tool em menos de 5 minutos**:

## O que é?  

A ferramenta **maisvalias-tool** tem como objetivo calcular automaticamente os valores de investimentos a declarar no IRS.

Para quem utiliza corretoras para efetuar os seus investimentos, esta ferramenta permite transformar o histórico de compras e vendas no formato requerido pela Autoridade Tributária e Aduaneira (AT) no momento do preenchimento da declaração anual de rendimentos.

## O que é preciso para utilizar?  

Para utilizar esta ferramenta, apenas precisas de fornecer as seguintes informações:  

1. **Corretora:** Qual a corretora onde investes.  
2. **Histórico de transações:** O teu histórico de transações desde a criação da conta na corretora.

## Quais os pressupostos e limitações?

Nesta ferramenta, existem alguns pressupostos que são considerados para o bom funcionamento da mesma:

1. **Declaração correta:** Assume-se que todas as vendas de ações/ETFs foram declaradas corretamente nos seus respetivos anos.
2. **Histórico completo:** É necessário o carregamento do histórico completo das compras e vendas dos ativos vendidos, ou seja, carregar os dados desde o ano em que foi feita a primeira compra do ativo na corretora. Para saber o porquê desta necessidade, consultar a secção [Como funciona?](#-como-funciona).
3. **Ações e ETFs:** Apenas suporta a declaração de ações e ETFs.
4. **Taxa de câmbio:** Caso a corretora não forneça a taxa de câmbio entre a moeda do ativo e a moeda portuguesa (€), é utilizado o rácio de fecho do dia da operação de compra/venda.
5. **Apenas rendimentos no estrangeiro:** Esta ferramenta foi pensada para a declaração de **investimentos feitos através de corretoras estrangeiras**.

## Como funciona?  

A **maisvalias-tool** calcula automaticamente os valores de mais-valias a declarar no IRS, com base no histórico de transações fornecido. Aqui está como o processo funciona:  

1. **Importação de Dados:**  
   O histórico completo de compras e vendas de ativos deve ser carregado. Isso inclui todas as transações desde o ano da primeira compra na corretora.

2. **Cálculo de Mais-Valias:**  
   A ferramenta calcula as mais-valias, considerando os preços de compra e venda, taxas associadas e outros fatores relevantes.

3. **Geração de Relatório:**  
   Após o cálculo, a ferramenta gera um relatório no formato exigido pela Autoridade Tributária, pronto para ser utilizado na declaração anual de rendimentos.

Para mais detalhes sobre como carregar os dados ou casos específicos, consulta a secção [Como utilizar?](#-como-funciona).

Se quiseres mais detalhes sobre o racíocinio por detrás desta ferramenta, consulta a secção [Algoritmo](conceitos-chave/algoritmo).

## Como utilizar?

Para começares já a utilizar a ferramenta, vai até à nossa [demonstração](/livedemo). Prepara os documentos com o histórico de compras e vendas e segue os passos que forem indicados.

Qualquer dúvida volta a esta documentação ou deixa-a registada no [repositório GitHub](https://github.com/Tomas-Silva-PT/maisvalias-tool/issues) para que te possamos ajudar.

## Disclaimer  

O **maisvalias-tool** é uma ferramenta independente, e os resultados produzidos **não têm caráter vinculativo**.  

Como tal, é essencial que:  
- Haja uma **verificação manual** dos resultados.
- Seja consultada a **legislação em vigor** e a **Autoridade Tributária e Aduaneira** sempre que necessário.

**Nota:** Não nos responsabilizamos por quaisquer perdas causadas pelo uso desta ferramenta. Usa por tua conta e risco.  
