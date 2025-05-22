<p align="center">
    <img src="/assets/images/logo-no-bg-icon.png" height="150" alt="logo">
</p>

---

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Tomas-Silva-PT/maisvalias-tool/deploy.yml?label=website&style=for-the-badge)](https://github.com/Tomas-Silva-PT/maisvalias-tool/actions/workflows/deploy.yml) [![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Tomas-Silva-PT/maisvalias-tool/test-yahoo-finance.yml?label=codebase&style=for-the-badge)](https://github.com/Tomas-Silva-PT/maisvalias-tool/actions/workflows/test-yahoo-finance.yml) ![Last Commit](https://img.shields.io/github/last-commit/Tomas-Silva-PT/maisvalias-tool?label=último%20commit&style=for-the-badge) [![GitHub License](https://img.shields.io/github/license/Tomas-Silva-PT/maisvalias-tool?label=licença&style=for-the-badge)](https://github.com/Tomas-Silva-PT/maisvalias-tool/blob/main/LICENSE) ![GitHub Release](https://img.shields.io/github/v/release/Tomas-Silva-PT/maisvalias-tool?label=versão&style=for-the-badge) [![Docs](https://img.shields.io/badge/docs-available-blue?label=documentação&style=for-the-badge)](https://tomas-silva-pt.github.io/maisvalias-tool/docs/intro) ![GitHub repo size](https://img.shields.io/github/repo-size/Tomas-Silva-PT/maisvalias-tool?label=tamanho%20repositório&style=for-the-badge) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Tomas-Silva-PT/maisvalias-tool?label=tamanho%20código&style=for-the-badge) ![GitHub top language](https://img.shields.io/github/languages/top/Tomas-Silva-PT/maisvalias-tool?style=for-the-badge&color=yellow) [![GitHub Stars](https://img.shields.io/github/stars/Tomas-Silva-PT/maisvalias-tool?style=for-the-badge&color=yellow)](https://github.com/Tomas-Silva-PT/maisvalias-tool/stargazers)

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

A `maisvalias-tool` foi desenvolvida com foco na **privacidade** dos utilizadores.

Antes de utilizares a ferramenta, consulta as políticas de privacidade [aqui](PRIVACY.md).

## Termos de responsabilidade

Antes de utilizares a ferramenta, consulta os termos de responsabilidade [aqui](DISCLAIMER.md).

## Licença

**Maisvalias-tool** é disponibilizado sob a licença [MIT License](./LICENSE).