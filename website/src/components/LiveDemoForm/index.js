import clsx from "clsx";
import styles from "./styles.module.css";
import { useEffect, useState } from "react";

import FilesRevolut from "@site/src/components/FilesRevolut";
import FilesTrading212 from "@site/src/components/FilesTrading212";
import FilesDegiro from "@site/src/components/FilesDegiro";
import FilesStrike from "@site/src/components/FilesStrike";
import DisclaimerPopup from "@site/src/components/DisclaimerPopup";
import HelpDialog from "@site/src/components/HelpDialog";
import FiscalSummary from "@site/src/components/FiscalSummary";
import FiscalYearsSummary from "@site/src/components/FiscalYearsSummary";
import FiscalYearSummary from "@site/src/components/FiscalYearSummary";

import { Statement } from "../../maisvalias-tool/models/statement.js";
import { FIFOCalculator } from "../../maisvalias-tool/calculators/FIFOCalculator.js";
import { DividendsCalculator } from "../../maisvalias-tool/calculators/DividendsCalculator.js";
import { DividendsFormatter } from "../../maisvalias-tool/formatters/pt/dividends_formatter.js";
import { ExcelDividendsFormatter } from "../../maisvalias-tool/formatters/pt/excel_dividends_formatter.js";
import { CapitalGainsFormatter } from "../../maisvalias-tool/formatters/pt/capital_gains_formatter.js";
import { InterestGainsFormatter } from "../../maisvalias-tool/formatters/pt/interest_gains_formatter.js";
import { ExcelCapitalGainsFormatter } from "../../maisvalias-tool/formatters/pt/excel_capital_gains_formatter.js";
import { FiscalSummaryCalculator } from "../../maisvalias-tool/calculators/fiscalSummaryCalculator.js";
import { InterestGainsCalculator } from "../../maisvalias-tool/calculators/InterestGainsCalculator.js";
import { ExcelInterestGainsFormatter } from "../../maisvalias-tool/formatters/pt/excel/excel_interest_gains_formatter.js";
import { Classifier } from "../../maisvalias-tool/classifiers/classifier.js";
import { PTIRSRules2025 } from "../../maisvalias-tool/classifiers/rules/pt_rules2025.js";

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
    name: "Trading 212",
    logo: "/img/brokers/trading212.png",
    active: true,
    visible: true,
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
    visible: false,
  },
  {
    name: "XTB",
    logo: "/img/brokers/xtb.png",
    active: false,
    visible: false,
  },
  {
    name: "Degiro",
    logo: "/img/brokers/degiro.png",
    active: true,
    visible: true,
    docs: [
      {
        message: "Não sabes onde encontrar os ficheiros?",
        link: "docs/corretoras/degiro",
      },
    ],
  },
  {
    name: "Revolut",
    logo: "/img/brokers/revolut.png",
    active: true,
    visible: true,
    docs: [
      {
        message: "Não sabes onde encontrar os ficheiros?",
        link: "docs/corretoras/revolut",
      },
    ],
  },
  {
    name: "Strike",
    logo: "/img/brokers/strike.png",
    active: true,
    visible: true,
    docs: [
      {
        message: "Não sabes onde encontrar os ficheiros?",
        link: "docs/corretoras/strike",
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
  const [fiscalYear, setFiscalYear] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [error, setError] = useState(null);

  const fiscalYearSummaryId = "fiscal-year-summary";
  const fiscalYearsSummaryId = "fiscal-years-summary";
  const fiscalSummaryId = "fiscal-summary";
  const contentStep1Id = "content-step-1";
  const contentStep2Id = "content-step-2";
  const contentStep3Id = "content-step-3";

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
    const fiscalYearSummary = document.getElementById(fiscalYearSummaryId);
    smoothFocus(fiscalYearSummary);
  }, [fiscalYear]);

  useEffect(() => {
    let newProgress = ((step - 1) / 2) * 100;
    setProgress(newProgress);

    const shouldShowHelp = step === 2;
    setHelpDialogVisible(shouldShowHelp);
    setFiscalYear(null);

    if (step === 3) {
      const fiscalSummaryElement = document.getElementById(fiscalSummaryId);
      if (fiscalSummaryElement) {
        smoothFocus(fiscalSummaryElement, "center");
      }
    }
    if (step === 2) {
      const contentStep2Element = document.getElementById(contentStep2Id);
      if (contentStep2Element) {
        smoothFocus(contentStep2Element, "center");
      }
    }
    if (step === 1) {
      const contentStep1Element = document.getElementById(contentStep1Id);
      if (contentStep1Element) {
        smoothFocus(contentStep1Element, "center");
      }
    }
  }, [step]);

  function smoothFocus(element, block = "start") {
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: block });

    // Delay focus slightly to let scroll animation begin
    setTimeout(() => {
      element.focus({ preventScroll: true });
    }, 300); // tweak delay if needed
  }

  async function setGainsAndDividends(transactions) {
    const loader = document.getElementById("custom-loader-container");
    const start = performance.now();

    const formatterUserCapitalGains = new CapitalGainsFormatter();
    const formatterUserDividends = new DividendsFormatter();
    const formatterUserInterestGains = new InterestGainsFormatter();

    const formatterExcelCapitalGains = new ExcelCapitalGainsFormatter();
    const formatterExcelDividends = new ExcelDividendsFormatter();
    const formatterExcelInterestGains = new ExcelInterestGainsFormatter();

    const statement = new Statement([]);
    transactions.forEach((transaction) => {
      statement.addTransactions(transaction);
    });

    let capitalGains;
    let interestGains;
    let dividends;

    let capitalGainsCalculator = new FIFOCalculator();
    let dividendsCalculator = new DividendsCalculator();
    let interestGainsCalculator = new InterestGainsCalculator();

    try {
      await statement.fetchData();
      capitalGains = await capitalGainsCalculator.calculate(
        capitalGainsCalculator.match(statement.getTransactions()),
      );
      dividends = await dividendsCalculator.calculate(
        statement.getTransactions(),
      );
      interestGains = await interestGainsCalculator.calculate(
        statement.getTransactions(),
      );
    } catch (error) {
      console.error(error);
      setError(error);
      loader.style.display = "none";
      setErrorType("fetchingData");
      const end = performance.now();
      console.log(
        `Duração do processamento: ${((end - start) / 1000).toFixed(3)} seconds`,
      );
      return;
    }

    const end = performance.now();
    console.log(
      `Duração do cálculo: ${((end - start) / 1000).toFixed(3)} seconds`,
    );

    let filteredCapitalGainsYears = capitalGains.map((gain) =>
      Number(gain.sell.date.year),
    );
    let filteredDividendsYears = dividends.map((div) =>
      Number(div.transaction.date.year),
    );
    let filteredInterestGainsYears = interestGains.map((interest) =>
      Number(interest.transaction.date.year),
    );

    const years = [
      ...new Set([
        ...filteredCapitalGainsYears,
        ...filteredDividendsYears,
        ...filteredInterestGainsYears,
      ]),
    ];

    years.sort((a, b) => a - b);

    let fiscalReport = {
      summary: {},
      byYear: {},
    };

    const fiscalSummaryCalculator = new FiscalSummaryCalculator();

    fiscalReport.summary = fiscalSummaryCalculator.calculate(
      capitalGains,
      dividends,
      interestGains,
    );

    for (const year of years) {
      let yearCapitalGains = capitalGains.filter(
        (gain) => gain.sell.date.year == year,
      );
      let yearDividends = dividends.filter(
        (div) => div.transaction.date.year == year,
      );
      let yearInterestGains = interestGains.filter(
        (interest) => interest.transaction.date.year == year,
      );

      fiscalReport.byYear[year] = {};
      fiscalReport.byYear[year].summary = fiscalSummaryCalculator.calculate(
        yearCapitalGains,
        yearDividends,
        yearInterestGains,
      );
      fiscalReport.byYear[year].capitalGains = {};
      fiscalReport.byYear[year].dividends = {};
      fiscalReport.byYear[year].interestGains = {};

      fiscalReport.byYear[year].capitalGains.raw = yearCapitalGains;
      fiscalReport.byYear[year].dividends.raw = yearDividends;
      fiscalReport.byYear[year].interestGains.raw = yearInterestGains;

      fiscalReport.byYear[year].capitalGains.user =
        formatterUserCapitalGains.format(yearCapitalGains);
      fiscalReport.byYear[year].dividends.user =
        formatterUserDividends.format(yearDividends);
      fiscalReport.byYear[year].interestGains.user =
        formatterUserInterestGains.format(yearInterestGains);

      fiscalReport.byYear[year].capitalGains.excel =
        formatterExcelCapitalGains.format(yearCapitalGains);
      fiscalReport.byYear[year].dividends.excel =
        formatterExcelDividends.format(yearDividends);
      fiscalReport.byYear[year].interestGains.excel =
        formatterExcelInterestGains.format(yearInterestGains);

      const classifier = new Classifier(PTIRSRules2025);
      const taxEvents = [...yearCapitalGains, ...yearDividends, ...yearInterestGains];
      const classifications = classifier.classify(taxEvents);
      fiscalReport.byYear[year].classifications = classifications;
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
              : styles.headerStepInactive,
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
          {currStepData.num === 1 && <ContentStep1 id={contentStep1Id} />}
          {currStepData.num === 2 && <ContentStep2 id={contentStep2Id} />}
          {currStepData.num === 3 && <ContentStep3 id={contentStep3Id} />}
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
        <div id={props.id} className={clsx(styles.contentStep1)}>
          {brokers.map(
            (broker) =>
              broker.visible === true && (
                <div
                  className={
                    broker.active === true
                      ? clsx(
                          styles.contentStep1Broker,
                          styles.contentStep1BrokerActive,
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
                  {/* <img
                style={{ width: "100%", height: "auto" }}
                alt={broker.name}
                src={useBaseUrl(broker.logo)}
              /> */}
                  <p className={clsx(styles.contentStep1BrokerName)}>
                    {broker.name}
                  </p>
                </div>
              ),
          )}
        </div>
      </>
    );
  }

  function ContentStep2(props) {
    return (
      <>
        {broker.name === "Trading 212" && (
          <FilesTrading212 id={props.id} setFiscalData={setGainsAndDividends} />
        )}
        {broker.name === "Revolut" && (
          <FilesRevolut id={props.id} setFiscalData={setGainsAndDividends} />
        )}
        {broker.name === "Degiro" && (
          <FilesDegiro id={props.id} setFiscalData={setGainsAndDividends} />
        )}
        {broker.name === "Strike" && (
          <FilesStrike id={props.id} setFiscalData={setGainsAndDividends} />
        )}
      </>
    );
  }

  function ContentStep3(props) {
    return (
      <>
        <div id={props.id} className={clsx(styles.contentStep3)}>
          <FiscalSummary
            id={fiscalSummaryId}
            fiscalData={fiscalData}
          ></FiscalSummary>
          <FiscalYearsSummary
            id={fiscalYearsSummaryId}
            setFiscalYear={setFiscalYear}
            fiscalData={fiscalData}
          ></FiscalYearsSummary>
          {fiscalYear && (
            <FiscalYearSummary
              id={fiscalYearSummaryId}
              year={fiscalYear}
              fiscalData={fiscalData}
            ></FiscalYearSummary>
          )}
          {/* {renderError(error)} */}
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
