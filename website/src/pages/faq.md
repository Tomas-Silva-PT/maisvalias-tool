# Perguntas frequentes (FAQ)

Respondemos a algumas das perguntas que te podem surgir.

## O que é o maisvalias-tool?
O `maisvalias-tool` é uma ferramenta desenvolvida com o objetivo de ajudar investidores portugueses a automatizar o processo de declaração de mais valias no IRS.

## Que tipo de ficheiros são suportados?
A aplicação, de um modo geral, utiliza ficheiros `.csv`, no entanto vai depender da corretora que utilizas para os teus investimentos.

## Como obter os ficheiros necessários da minha corretora?
Para saberes onde e quais os ficheiros necessários, consulta a [documentação](/docs/category/corretoras-suportadas), lá estará descrito passo-a-passo como utilizar a ferramenta para o teu caso.

## O que acontece aos dados que insiro na ferramenta?
A ferramenta irá processar o teu histórico de transações para te fornecer as mais-valias e dividendos numa tabela compatível com o formato exigido na declaração de IRS.

## Posso exportar os resultados?
Sim! Recomendamos que utilizes a funcionalidade de exportação para excel para validares e retificares os resultados obtidos. Se verificares que os valores obtidos estão corretos, podes ir mais além e exportá-los diretamente para uma declaração de IRS. Vê como fazer tudo isto através da [documentação](/docs/category/funcionalidades).

## Os meus dados estão seguros?
Sim. A aplicação foi concebida para funcionar maioritariamente no **lado do cliente** — ou seja, todos os dados são processados diretamente no teu navegador, e **não são enviados para nenhum servidor**.

As **únicas exceções** são: 

1) Quando é necessário obter **taxas de câmbio** para conversão de valores em moedas estrangeiras. Neste caso, se a **corretora não fornecer a taxa de câmbio**, a aplicação recorre a um serviço externo (como o BCE ou outro provedor público) para obter a taxa de referência. Neste processo, **apenas a moeda e a data da transação são enviadas**, nunca os dados da sua carteira ou transações pessoais.

2) Para saber se o ativo que investes é uma **ação ou ETF**, a ferramenta utiliza um serviço externo para o saber. Neste processo, **apenas é enviado para o serviço o `ticker` do ativo (ex.: `VUAA`)**.

Estas exceções não envolvem dados pessoais que permitam identificar o sujeito que utiliza a ferramenta, mas achamos importante deixar transparente estes dois aspetos da ferramenta.

## Esta ferramenta submete a minha declaração de IRS?
A `maisvalias-tool` **não submete** a tua declaração. Serve apenas para **preparar os dados** no formato correto. O que ela permite é exportar os resultados para uma declaração de IRS. 

:::warning
Lembra-te de verificar sempre os resultados antes de os utilizares, já que os resultados desta ferramenta não são vinculativos.
:::
## Existe suporte para múltiplos anos fiscais?
Sim, devido aos requisitos da ferramenta, ela foi desenvolvida para fornecer automaticamente os valores a declarar de **todos os anos fiscais** em que tal declaração é necessária. A interface agrupa os resultados por ano fiscal em painéis de fácil navegação.

## Quem deve utilizar esta ferramenta?
Esta ferramenta foi pensada para investidores com contas em corretoras como a Trading212, a Revolut, a Degiro, entre outras. Consulta a [documentação](/docs/category/corretoras-suportadas) para saberes as que são compatíveis.

## Quais as limitações desta ferramenta?
Para saberes das atuais limitações desta ferramenta, consulta a [documentação](/docs/intro#%EF%B8%8F-quais-os-pressupostos-e-limitações).

## Como posso reportar um problema?
Se encontrares algum problema, deixa uma mensagem descritiva do mesmo no [repositório Github](https://github.com/Tomas-Silva-PT/maisvalias-tool/issues).

## Como posso contribuir para o projeto?
Excelente pergunta! Contribuições e sugestões são bem-vindas. Podes consultar o [guia](https://github.com/Tomas-Silva-PT/maisvalias-tool/blob/main/CONTRIBUTING.md) para algumas diretrizes de como o poderás fazer.

## Onde posso encontrar a documentação?
A documentação pode ser encontrada no [site oficial](https://tomas-silva-pt.github.io/maisvalias-tool/).