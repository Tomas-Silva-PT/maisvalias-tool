import clsx from "clsx";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ArrowRight, Upload, X } from "lucide-react";

import { Statement } from "../../maisvalias-tool/models/statement.js";
import { Trading212Parser } from "../../maisvalias-tool/parsers/trading212parser.js";
import { AssetBuffer } from "../../maisvalias-tool/models/asset.js";
import { PTCapitalGainsFormatter } from "../../maisvalias-tool/formatters/pt/irs/capital_gains_formatter.js";
import { PTDividendsFormatter } from "../../maisvalias-tool/formatters/pt/irs/dividends_formatter.js";

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
      "Coloca os ficheiros da corretora referentes ao histórico de transações, desde o ano da criação da conta na mesma",
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
  },
  {
    name: "eToro",
    logo: "/img/brokers/etoro.png",
  },
  {
    name: "XTB",
    logo: "/img/brokers/xtb.png",
  },
  {
    name: "Degiro",
    logo: "/img/brokers/degiro.png",
  },
  {
    name: "Revolut",
    logo: "/img/brokers/revolut.png",
  },
];

export default function LiveDemoForm() {
  const [step, setStep] = useState(1);
  const [broker, setBroker] = useState({});
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const [capitalGains, setCapitalGains] = useState([]);
  const [dividends, setDividends] = useState([]);

  useEffect(() => {
    let newProgress = ((step - 1) / 2) * 100;
    setProgress(newProgress);
  }, [step]);

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
              className={clsx(styles.contentStep1Broker)}
              onClick={() => onBrokerSelected(broker)}
            >
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

  function onFileUpload(e) {
    const files = e.target.files;
    if (files) {
      setFiles((prev) => [...prev, ...Array.from(files)]);
    }
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onFilesSelected() {
    console.log("Files: " + files);
    if (files.length === 0 || !broker) return;

    const parser = new Trading212Parser();
    const statement = new Statement([]);
    const formatterCapitalGains = new PTCapitalGainsFormatter();
    const formatterDividends = new PTDividendsFormatter();

    const filePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target.result;
          const transactions = parser.parse(data);
          resolve(transactions);
        };

        reader.onerror = function (e) {
          reject(e.target.error);
        };

        reader.readAsText(file);
      });
    });

    let transactions = await Promise.all(filePromises);
    transactions.forEach((transaction) => {
      statement.addTransactions(transaction);
    });

    await statement.fetchData(new AssetBuffer());
    let capitalGains = await formatterCapitalGains.format(statement, "2023");
    let dividends = await formatterDividends.format(statement, "2023");

    setCapitalGains(capitalGains);
    setDividends(dividends);
    setStep((step) => step + 1);
  }

  function ContentStep2(props) {
    return (
      <>
        <div className={clsx(styles.contentStep2)}>
          <Upload className={clsx(styles.contentStep2UploadIcon)} />
          <input
            className={clsx(styles.contentStep2UploadInput)}
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={onFileUpload}
            multiple
          />
          <label htmlFor="file-upload">Escolher ficheiro(s)</label>
          {files.length > 0 && (
            <>
              <div className={clsx(styles.contentStep2Files)}>
                {files.map((file, index) => (
                  <div key={index} className={clsx(styles.contentStep2File)}>
                    <div className={clsx(styles.contentStep2FileName)}>
                      {file.name}
                    </div>
                    <div
                      className={clsx(styles.contentStep2FileRemove)}
                      onClick={() => removeFile(index)}
                    >
                      <X />
                    </div>
                  </div>
                ))}
              </div>
              <div
                className={clsx(styles.contentStep2Process)}
                onClick={onFilesSelected}
              >
                <div className={clsx(styles.contentStep2ProcessText)}>
                  Processar {files.length} ficheiro
                  {files.length !== 1 ? "s" : ""}
                </div>
                <ArrowRight />
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  function toggleCollapible(e) {
    const button = e.currentTarget;
    const content = button.nextElementSibling;
    button.classList.toggle(styles.active);

    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = '100%';// content.scrollHeight + 'px';
      console.log("Height: " + content.scrollHeight);
    }
  }

  function ContentStep3(props) {
    return (
      <>
        <div className={clsx(styles.contentStep3)}>
          <button onClick={toggleCollapible} className={clsx(styles.yearSection, styles.collapsible)}>2023</button>
          <div className={clsx(styles.collapsibleContent)}>
            <h2 onClick={toggleCollapible} className={clsx(styles.collapsible, styles.contentStep3Title)}>Mais valias</h2>
            <div className={clsx(styles.collapsibleContent, styles.contentStep3Table)}>
              <div className={clsx(styles.contentStep3TableHeader)}>
                <div>Ticker</div>
                <div>País da fonte</div>
                <div>Código</div>
                <div>Ano de Aquisição</div>
                <div>Mês de Aquisição</div>
                <div>Valor de Aquisição</div>
                <div>Ano de Realização</div>
                <div>Mês de Realização</div>
                <div>Valor de Realização</div>
                <div>Despesas e Encargos</div>
                <div>Imposto retido no estrangeiro</div>
                <div>País da Contraparte</div>
              </div>
              <div className={clsx(styles.contentStep3TableBody)}>
                {capitalGains.length > 0 &&
                  capitalGains.map((capitalGain, index) => (
                    <div
                      key={index}
                      className={clsx(styles.contentStep3TableBodyRow)}
                    >
                      <div>{capitalGain["Ticker"]}</div>
                      <div>{capitalGain["País da fonte"]}</div>
                      <div>{capitalGain["Código"]}</div>
                      <div>{capitalGain["Ano de Aquisição"]}</div>
                      <div>{capitalGain["Mês de Aquisição"]}</div>
                      <div>{capitalGain["Valor de Aquisição"]}</div>
                      <div>{capitalGain["Ano de Realização"]}</div>
                      <div>{capitalGain["Mês de Realização"]}</div>
                      <div>{capitalGain["Valor de Realização"]}</div>
                      <div>{capitalGain["Despesas e Encargos"]}</div>
                      <div>{capitalGain["Imposto retido no estrangeiro"]}</div>
                      <div>{capitalGain["País da Contraparte"]}</div>
                    </div>
                  ))}
              </div>
            </div>
            <h2 onClick={toggleCollapible} className={clsx(styles.collapsible, styles.contentStep3Title)}>Dividendos</h2>
            <div className={clsx(styles.collapsibleContent, styles.contentStep3Table)}>
              <div className={clsx(styles.contentStep3TableHeader)}>
                <div>Ticker</div>
                <div>Código Rendimento</div>
                <div>País da fonte</div>
                <div>Rendimento Bruto</div>
                <div>Imposto Pago no Estrangeiro - No país da fonte</div>
              </div>
              <div className={clsx(styles.contentStep3TableBody)}>
                {dividends.length > 0 &&
                  dividends.map((dividend, index) => (
                    <div
                      key={index}
                      className={clsx(styles.contentStep3TableBodyRow)}
                    >
                      <div>{dividend["Ticker"]}</div>
                      <div>{dividend["Código Rendimento"]}</div>
                      <div>{dividend["País da fonte"]}</div>
                      <div>{dividend["Rendimento Bruto"]}</div>
                      <div>
                        {
                          dividend[
                            "Imposto Pago no Estrangeiro - No país da fonte"
                          ]
                        }
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <section className={clsx(styles.form, styles.fadeIn)}>
        <Header step={step} />
        <Content step={step} />
      </section>
    </>
  );
}
