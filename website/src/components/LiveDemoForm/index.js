import clsx from "clsx";
import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ArrowRight, Upload, X } from "lucide-react";

import FilesRevolut from "@site/src/components/FilesRevolut";
import FilesTrading212 from "@site/src/components/FilesTrading212";
import DisclaimerPopup from "@site/src/components/DisclaimerPopup";
import HelpDialog from "@site/src/components/HelpDialog";
import FiscalSummary from "@site/src/components/FiscalSummary";
import FiscalYearsSummary from "@site/src/components/FiscalYearsSummary";
import FiscalYearSummary from "@site/src/components/FiscalYearSummary";

import { Statement } from "../../maisvalias-tool/models/statement.js";
import { FIFOCalculator } from "../../maisvalias-tool/calculators/FIFOCalculator.js";
import { DividendsCalculator } from "../../maisvalias-tool/calculators/DividendsCalculator.js";
import { PTCapitalGainsFormatter } from "../../maisvalias-tool/formatters/pt/irs/irs_capital_gains_formatter.js";
import { PTDividendsFormatter } from "../../maisvalias-tool/formatters/pt/irs/irs_dividends_formatter.js";
import { DividendsFormatter } from "../../maisvalias-tool/formatters/pt/dividends_formatter.js";
import { FiscalSummaryCalculator } from "../../maisvalias-tool/calculators/FiscalSummaryCalculator.js";

const disclaimerMessage =
  "O maisvalias-tool é uma ferramenta independente, cujos resultados produzidos não têm caráter vinculativo. Como tal é essencial que haja uma verificação manual dos resultados. Consulta a legislação em vigor e a Autoridade Tributária e Aduaneira sempre que necessário. Consulta os termos de responsabilidade para saberes mais.";

const steps = [
  {
    num: 1,
    title: "Selecionar corretora",
    description:
      "Das corretoras suportadas, escolhe a que utilizas para os teus investimentos",
  },
  {
    num: 2,
    title: "Indicar histórico de transações",
    description:
      "Coloca os seguintes ficheiros da corretora, desde o ano da criação da conta",
  },
  {
    num: 3,
    title: "Obter resultados",
    description: "Aqui estão os resultados",
  },
];

const brokers = [
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
  },
  {
    name: "eToro",
    logo: "/img/brokers/etoro.png",
    active: false,
  },
  {
    name: "XTB",
    logo: "/img/brokers/xtb.png",
    active: false,
  },
  {
    name: "Degiro",
    logo: "/img/brokers/degiro.png",
    active: false,
  },
  {
    name: "Revolut",
    logo: "/img/brokers/revolut.png",
    active: true,
    docs: [
      {
        message: "Não sabes onde encontrar os ficheiros?",
        link: "docs/corretoras/revolut",
      },
    ],
  },
];

export default function LiveDemoForm() {
  const [step, setStep] = useState(1);
  const [broker, setBroker] = useState({});
  const [progress, setProgress] = useState(0);
  const [helpDialogVisible, setHelpDialogVisible] = useState(false);
  const [fiscalData, setFiscalData] = useState({});
  const [IRSdialogVisible, setIRSdialogVisible] = useState(false);
  const [fiscalYear, setFiscalYear] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    let newProgress = ((step - 1) / 2) * 100;
    setProgress(newProgress);

    const shouldShowHelp = step === 2;
    setHelpDialogVisible(shouldShowHelp);
    setFiscalYear(null);
  }, [step]);

  function renderError(error) {
    if (!errorType) return null;

    let content;

    if (errorType === "filesUploaded") {
      content = (
        <>
          <h3>Falha ao processar os ficheiros</h3>
          <span>Os ficheiros não são compatíveis com o formato esperado.</span>
          <p>
            Por favor verifica quais os ficheiros corretos através da{" "}
            <a href="docs/corretoras/trading212" target="_blank">
              documentação
            </a>{" "}
            e tenta novamente.
          </p>
          <p>
            Se o problema persistir,{" "}
            <a href="./about#como-nos-contactar" target="_blank">
              contacta-nos
            </a>
            .
          </p>
        </>
      );
    } else if (errorType === "fetchingData") {
      content = (
        <>
          <h3>Falha ao calcular as mais-valias</h3>
          <span>
            Não conseguimos obter as informações necessárias para o cálculo das
            mais-valias.
          </span>
          <p>Por favor tenta novamente mais tarde.</p>
          <p>
            Se o problema persistir,{" "}
            <a href="./about#como-nos-contactar" target="_blank">
              contacta-nos
            </a>
            .
          </p>
        </>
      );
    }

    return (
      <ErrorPopup
        title="Erro"
        closeFunction={() => {
          setErrorType(null);
          setError(null);
        }}
        error={error}
      >
        {content}
      </ErrorPopup>
    );
  }

  async function setGainsAndDividends(transactions) {
    const loader = document.getElementById("custom-loader-container");
    const start = performance.now();
    const formatterIRSCapitalGains = new PTCapitalGainsFormatter();
    const formatterIRSDividends = new PTDividendsFormatter();
    const formatterUserDividends = new DividendsFormatter();

    const statement = new Statement([]);
    transactions.forEach((transaction) => {
      statement.addTransactions(transaction);
    });

    let capitalGains;
    let dividends;
    let capitalGainsCalculator = new FIFOCalculator();
    let dividendsCalculator = new DividendsCalculator();

    try {
      await statement.fetchData();
      capitalGains = await capitalGainsCalculator.calculate(
        capitalGainsCalculator.match(statement.getTransactions())
      );
      dividends = await dividendsCalculator.calculate(
        statement.getTransactions()
      );
    } catch (error) {
      setError(error);
      loader.style.display = "none";
      setErrorType("fetchingData");
      const end = performance.now();
      console.log(
        `Duração do processamento: ${((end - start) / 1000).toFixed(3)} seconds`
      );
      return;
    }

    const end = performance.now();
    console.log(
      `Duração do cálculo: ${((end - start) / 1000).toFixed(3)} seconds`
    );

    let filteredCapitalGainsYears = capitalGains.map((gain) =>
      Number(gain.sell.date.substring(0, 4))
    );
    let filteredDividendsYears = dividends.map((div) =>
      Number(div.transaction.date.substring(0, 4))
    );

    const years = [
      ...new Set([...filteredCapitalGainsYears, ...filteredDividendsYears]),
    ];

    years.sort((a, b) => a - b);

    let fiscalReport = {
      summary: {},
      byYear: {},
    };

    const fiscalSummaryCalculator = new FiscalSummaryCalculator();

    fiscalReport.summary = fiscalSummaryCalculator.calculate(
      capitalGains,
      dividends
    );

    for (const year of years) {
      let yearCapitalGains = capitalGains.filter(
        (gain) => gain.sell.date.substring(0, 4) == year
      );
      let yearDividends = dividends.filter(
        (div) => div.transaction.date.substring(0, 4) == year
      );

      fiscalReport.byYear[year] = {};
      fiscalReport.byYear[year].summary = fiscalSummaryCalculator.calculate(
        yearCapitalGains,
        yearDividends
      );
      fiscalReport.byYear[year].capitalGains = {};
      fiscalReport.byYear[year].dividends = {};

      fiscalReport.byYear[year].capitalGains.raw = yearCapitalGains;
      fiscalReport.byYear[year].dividends.raw = yearDividends;

      fiscalReport.byYear[year].capitalGains.irs =
        formatterIRSCapitalGains.format(yearCapitalGains);
      fiscalReport.byYear[year].dividends.irs =
        formatterIRSDividends.format(yearDividends);
      fiscalReport.byYear[year].dividends.user =
        formatterUserDividends.format(yearDividends);
    }

    setFiscalData(fiscalReport);
    setStep((step) => step + 1);
    loader.style.display = "none";
  }

  function Header(props) {
    let step = props.step;
    return (
      <>
        <div className={clsx(styles.header)}>
          <HeaderSteps step={step} />
          <HeaderProgress step={step} />
        </div>
      </>
    );
  }

  function HeaderSteps(props) {
    let currStep = props.step;
    return (
      <>
        <div className={clsx(styles.headerSteps)}>
          {steps.map((step) => (
            <HeaderStep
              step={currStep}
              num={step.num}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </>
    );
  }

  function HeaderStep(props) {
    let currStep = props.step;
    let num = props.num;
    let title = props.title;
    let description = props.description;

    function setCurrStepNum(e) {
      if (num < currStep) {
        setStep(num);
      }
    }

    return (
      <>
        <div
          key={num}
          className={clsx(
            styles.headerStep,
            currStep >= num
              ? styles.headerStepActive
              : styles.headerStepInactive
          )}
          onClick={(e) => setCurrStepNum(e)}
        >
          <div className={clsx(styles.headerStepNum)}>{num}</div>
          <div className={clsx(styles.headerStepTitle)}>{title}</div>
        </div>
      </>
    );
  }

  function HeaderProgress(props) {
    let currStep = props.step;
    return (
      <>
        <div className={clsx(styles.headerProgressContainer)}>
          <div
            className={clsx(styles.headerProgress)}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </>
    );
  }

  function Content(props) {
    let currStep = props.step;
    let currStepData = steps[currStep - 1];
    let description = currStepData.description;
    return (
      <>
        <div className={clsx(styles.content, styles.fadeIn)}>
          <h3>{description}:</h3>
          {currStepData.num === 1 && <ContentStep1 />}
          {currStepData.num === 2 && <ContentStep2 />}
          {currStepData.num === 3 && <ContentStep3 />}
        </div>
      </>
    );
  }

  function onBrokerSelected(broker) {
    setStep((step) => step + 1);
    setBroker(broker);
  }

  function ContentStep1(props) {
    return (
      <>
        <div className={clsx(styles.contentStep1)}>
          {brokers.map((broker) => (
            <div
              className={
                broker.active === true
                  ? clsx(
                      styles.contentStep1Broker,
                      styles.contentStep1BrokerActive
                    )
                  : clsx(styles.contentStep1Broker)
              }
              onClick={() => {
                if (broker.active === true) {
                  onBrokerSelected(broker);
                }
              }}
            >
              {broker.active === false && (
                <div className={clsx(styles.contentStep1BrokerInactive)}>
                  🚧 Em breve
                </div>
              )}
              <img
                style={{ width: "100%", height: "auto" }}
                alt={broker.name}
                src={useBaseUrl(broker.logo)}
              />
            </div>
          ))}
        </div>
      </>
    );
  }

  function ContentStep2(props) {
    return (
      <>
        {broker.name === "Trading212" && (
          <FilesTrading212 setFiscalData={setGainsAndDividends} />
        )}
        {broker.name === "Revolut" && (
          <FilesRevolut setFiscalData={setGainsAndDividends} />
        )}
      </>
    );
  }

  function ContentStep3(props) {
    return (
      <>
        <div className={clsx(styles.contentStep3)}>
          <FiscalSummary fiscalData={fiscalData}></FiscalSummary>
          <FiscalYearsSummary
            setFiscalYear={setFiscalYear}
            fiscalData={fiscalData}
          ></FiscalYearsSummary>
          {fiscalYear && (
            <FiscalYearSummary
              year={fiscalYear}
              fiscalData={fiscalData}
            ></FiscalYearSummary>
          )}
          {renderError(error)}
        </div>
      </>
    );
  }

  return (
    <>
      <section className={clsx(styles.form, styles.fadeIn)}>
        <Header step={step} />
        <Content step={step} />
        <DisclaimerPopup title="Importante" message={disclaimerMessage} />
        <HelpDialog visible={helpDialogVisible} docs={broker.docs} />
      </section>
    </>
  );
}
