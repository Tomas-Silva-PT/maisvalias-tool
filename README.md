<p align="center">
    <img src="/assets/images/logo-no-bg-icon.png" height="150" alt="logo">
</p>

---

# ⚠️ **Não utilizar! Esta ferramenta ainda está em processo de desenvolvimento!**

---

# maisvalias-tool

A ferramenta **maisvalias-tool** tem como objetivo calcular automaticamente os valores de investimentos a declarar no IRS.

Para quem utiliza corretoras para efetuar os seus investimentos poderá utilizar esta ferramenta para transformar o histórico de compras e vendas no formato requerido pela _Autoridade Tributária e Aduaneira (AT)_ no momento de preenchimento da declaração anual de rendimentos.

## Documentação

Se estiveres interesado e quiseres saberes mais informações acerca desta ferramenta, está tudo documentado [aqui](https://tomas-silva-pt.github.io/maisvalias-tool).

* [Como funciona?](https://tomas-silva-pt.github.io/maisvalias-tool/docs/intro/#-como-funciona)
* [Quais os pressupostos/limitações?](https://tomas-silva-pt.github.io/maisvalias-tool/docs/intro/#%EF%B8%8F-quais-os-pressupostos-e-limita%C3%A7%C3%B5es)
* [Quais são as corretoras suportadas?](https://tomas-silva-pt.github.io/maisvalias-tool/docs/category/corretoras-suportadas)

## Utilização

### Online (recomendado)

Para utilizares esta ferramenta, dirige-te à página oficial: [maisvalias-tool](https://Tomas-Silva-PT.github.io/maisvalias-tool).

### Localmente

Se quiseres utilizar esta ferramenta no teu ambiente local, segue os seguintes passos:

#### 1. Clona o repositório

```bash
git clone https://github.com/Tomas-Silva-PT/maisvalias-tool.git
```

#### 2. Instala as dependências

```bash
cd maisvalias-tool/website
npm install
```

#### 3. Inicia o website

```bash
npm run start
```

Para aprenderes a utilizar a ferramenta, consulta a [documentação](https://tomas-silva-pt.github.io/maisvalias-tool/docs/intro) no site oficial.

## Contribuição

Se quiseres contribuir para o projeto, dá uma olhadela ao [guia de contribuição](./CONTRIBUTING.md).

## Privacidade

A `maisvalias-tool` foi desenvolvida com foco na **privacidade** dos utilizadores:
- Todos os dados inseridos na ferramenta (transações, dividendos, etc.) são **processados localmente no teu navegador**.
- **Nenhuma informação pessoal é enviada para servidores.**

As duas **únicas situações em que há comunicação com um servidor externo** são:

1. Obtenção de taxas de câmbio — apenas **se a corretora não fornecer diretamente a mesma**.
2. **Identificação do tipo de ativo (Ação ou ETF)**, pois isto influencia a maneira como deve ser declarado no IRS.

Nestes casos, a ferramenta consulta serviços públicos para obter a informação necessária.
Dito isto, **apenas é enviado para os serviços a data e a moeda** necessária para obter a taxa de câmbio (ex.: `USD` em `2024-06-10`), assim como o **ticker** do ativo (ex.: `VUAA`) para a ferramenta saber se é uma ação ou ETF.

## Licença

**Maisvalias-tool** é disponibilizado sob a licença [MIT License](./LICENSE).

## Termos de responsabilidade

_O **maisvalias-tool** é uma ferramenta independente, cujos resultados produzidos não têm carácter vinculativo. Como tal, deve existir uma retificação dos resultados, assim como a consulta da legislação em vigor, consultando sempre que necessário a Autoridade Tributária e Aduaneira.

Consulta os termos de responsabilidade [aqui](DISCLAIMER.md).