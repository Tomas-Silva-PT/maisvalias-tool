# Como adicionar uma nova corretora

Se quiseres contribuir para o projeto adicionando suporte para uma nova corretora, estás no sítio certo.

De um modo geral terás as seguintes tarefas:

1. Definir a nova corretora (`Broker`).
2. Desenvolver o `parser`.
3. Adaptar o `website` para utilização da corretora.

Se quiseres saber o porquê de cada componente, visita a página que explica a [arquitetura](https://tomas-silva-pt.github.io/maisvalias-tool/docs/conceitos-chave/arquitetura) da **maisvalias-tool**.

Todo o código fonte da **maisvalias-tool** localiza-se na diretoria [`src`](../src).

O código do website localiza-se na diretoria [`website`](../website)

### 1. Definir a nova corretora (`Broker`)

Para definir a nova corretora, digire-te à diretoria onde ficam todos os _brokers_:

> src > models > [brokers](../src/models/brokers/)

Para a nova corretora, desenvolve uma classe que implemente a interface [`Broker`](../src/models/brokers/broker.ts).   
O nome da nova classe deve ser igual ao nome da corretora:

> ex.: XTB, EToro, Trading212...

Antes de desenvolveres o novo _broker_, deixamos aqui algumas notas:

* O atributo _country_ deve ser um objeto do tipo [`Country`](../src/models/country.ts), com o código [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) do país onde a corretora está domiciliada. Por exemplo, a _Trading 212 Markets Ltd._ para investidores portugueses está domiciliada no Chipre, logo o código é **CY**.

Sugiro que consultes os _brokers_ já existentes para perceberes como deverá ficar o resultado final.

### 2. Desenvolver o parser

O parser será utilizado para interpretar os dados exportados da corretora, e irá convertê-los no formato padrão: [`Transaction`](../src/models/transaction.ts).

Dirige-te até à diretoria onde ficam todos os _parsers_:
> src > [parsers](../src/parsers/)

Para o _parser_ da nova corretora, desenvolve uma classe que implementa a interface [`Parser`](../src/parsers/parser.ts).

O nome da nova classe deve seguir a nomenclatura:

> ex.: XTBParser, EToroParser, Trading212Parser...

Antes de desenvolveres o novo _parser_, deixamos aqui algumas notas:

* O método `parse` da interface [`Parser`](../src/parsers/parser.ts) tem como entrada uma `String`. Isto acontece porque em regra geral os ficheiros exportados das corretoras vêm no formato `csv`. Como tal foi mais fácil interpretar o conteúdo dos ficheiros como uma `String`.

* Nesta ferramenta, o **ISIN** (_Internacional Security Identification Number_) da ação/ETF é talvez a informação mais importante de cada [`Transaction`](../src/models/transaction.ts), pois permite identificar o ativo univocamente, assim como permite ao sistema distinguir se o ativo é uma ação ou um ETF, e qual o país de domicilio do mesmo (ex.: EDP tem o isin **PT**EDP0AM0009 e a APPLE tem o isin **US**0378331005).

* Atualmente o tipo de uma [`Transaction`](../src/models/transaction.ts) tem de ser um de três valores: _buy_, _sell_ ou _dividend_.

* O campo `amount` de uma [`Transaction`](../src/models/transaction.ts) corresponde ao **valor líquido** ganho com a operação. Isto significa que neste `amount` já foi retirado o valor das comissões ou taxas que a corretora possa aplicar durante a transação.

* O `exchange rate` é a taxa de câmbio para converter moeda estrangeira para a moeda portuguesa.

* As comissões, taxas ou encargos devem ser representados nas classes [`Fee`](../src/models/fee.ts) ou [`Tax`](../src/models/tax.ts).

Sugiro que consultes os _parsers_ já existentes para perceberes como deverá ficar o resultado final.

### 3. Adaptar o `website`

Com o _broker_ e o _parser_ já desenvolvidos, resta agora incorporares a nova corretora no website oficial da ferramenta.

Vamos ver o que precisas de acrescentar para cada etapa.

#### Etapa: Escolher corretora

Vai até à diretoria, mais especificamente ao componente [`LiveDemoForm`](../website/src/components/LiveDemoForm/):

> website > src > components > LiveDemoForm

No ficheiro [`index.js`](../website/src/components/LiveDemoForm/index.js), adiciona as configurações para a nova corretora:

```javascript
const brokers = [
  <...>
  {
    name: "XTB",
    logo: "/img/brokers/xtb.png",
    active: true,
    docs: [
      {
        message: "Não sabes onde encontrar os ficheiros?",
        link: "docs/corretoras/xtb",
      },
    ],
  },
];
```

* `name`: nome da correta
* `logo`: imagem do logótipo da corretora
* `active`: flag a indicar que está pronta para ser utilizada
* `docs`: links para guias de utilização



#### Etapa: Indicar histórico de transações

Vai até à diretoria:

> website > src > components

Copia a diretoria [`FilesTrading212`](../website/src/components/FilesTrading212/) e faz as seguintes alterações no ficheiro [`index.js`](../website/src/components/FilesTrading212/index.js):

##### 1. Altera o parser

De:
```javascript
import { Trading212Parser } from "../../maisvalias-tool/parsers/trading212parser.js";
```

Para:
```javascript
import { XTBParser } from "../../maisvalias-tool/parsers/xtbparser.js";
```

##### 2. Altera os dados da corretora

De:
```javascript
const broker = [
  {
    name: "Trading212",
    logo: "/img/brokers/trading212.png",
    active: true,
    docs: [
      {
        message: "Não sabes onde encontrar os ficheiros?",
        link: "docs/corretoras/trading212",
      },
    ],
  }
];
```

Para:
```javascript
const broker = [
  {
    name: "XTB",
    logo: "/img/brokers/xtb.png",
    active: true,
    docs: [
      {
        message: "Não sabes onde encontrar os ficheiros?",
        link: "docs/corretoras/xtb",
      },
    ],
  }
];
```

##### 3. Altera a função principal

Na função principal do componente é necessário adaptar as funções existentes de acordo com os requisitos específicos para aquela corretora, nomeadamente a quantidade de ficheiros diferentes necessários para o cálculo das mais-valias.

É dificil de explicar passo-a-passo, mas no fundo recomendamos-te a analisar a função principal de outras corretoras e tentares adaptar para a nova.

##### 4. Altera o [`LiveDemoForm`](../website/src/components/LiveDemoForm/)

Assim que tiveres implementado o componente anterior, tens agora de o incoporar no componente [`LiveDemoForm`](../website/src/components/LiveDemoForm/):

Nos imports, adiciona o novo componente:

```javascript
<...>
import FilesRevolut from "@site/src/components/FilesRevolut";
import FilesTrading212 from "@site/src/components/FilesTrading212";
import FilesXTB from "@site/src/components/FilesXTB";
```

Na função `ContentStep2`, adiciona o novo componente:

```javascript
function ContentStep2(props) {
    return (
      <>
        {broker.name === "Trading212" && <FilesTrading212 setFiscalData={setFiscalData} setStep={setStep} />}
        {broker.name === "Revolut" && <FilesRevolut setFiscalData={setFiscalData} setStep={setStep} />}
        {broker.name === "XTB" && <FilesXTB setFiscalData={setFiscalData} setStep={setStep} />}
      </>
    );
  }
```

#### Etapa: Obter resultados

Nesta etapa não é necessário alterar nada.

### Observações finais

Queremos salientar que este guia pode não ter em conta alguns aspetos, que só descobrirás durante o processo de desenvolvimento. Ele serve para te dar as linhas gerais dos passos que são necessários tomar para adicionar à ferramenta a capacidade de funcionar com uma nova corretora.

Com as futuras alterações do código este guia poderá se tornar cada vez menos útil, porque poderemos não ter disponibilidade de atualizar este guia sempre que for feita uma alteração ao código.