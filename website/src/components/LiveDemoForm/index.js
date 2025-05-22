import clsx from "clsx";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ArrowRight, Upload, X } from "lucide-react";

import { Statement } from "../../maisvalias-tool/models/statement.js";
import { Trading212Parser } from "../../maisvalias-tool/parsers/trading212parser.js";
import { RevolutParser } from "../../maisvalias-tool/parsers/revolutparser.js";
import { AssetBuffer } from "../../maisvalias-tool/models/asset.js";
import { PTCapitalGainsFormatter } from "../../maisvalias-tool/formatters/pt/irs/capital_gains_formatter.js";
import { PTDividendsFormatter } from "../../maisvalias-tool/formatters/pt/irs/dividends_formatter.js";
import { PTIRSFormatter } from "../../maisvalias-tool/formatters/pt/irs/irs_xml_formatter.js";
import DisclaimerPopup from "@site/src/components/DisclaimerPopup";
import HelpDialog from "@site/src/components/HelpDialog";

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
        internal: true,
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
        internal: true,
      },
    ],
  },
];

export default function LiveDemoForm() {
  const [step, setStep] = useState(1);
  const [broker, setBroker] = useState({});
  const [progress, setProgress] = useState(0);
  const [helpDialogVisible, setHelpDialogVisible] = useState(false);

  const [capitalGains, setCapitalGains] = useState([]);
  const [dividends, setDividends] = useState([]);
  const [fiscalData, setFiscalData] = useState({});
  const [IRSdialogVisible, setIRSdialogVisible] = useState(false);
  const [fiscalYear, setFiscalYear] = useState(null);

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

  function Trading212Files() {
    const [files, setFiles] = useState([]);

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
      const loader = document.getElementById("custom-loader-container");
      loader.style.display = "flex";

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
      let capitalGains = await formatterCapitalGains.format(statement);
      let dividends = await formatterDividends.format(statement);
      // dividends = dividends["toUser"];
      console.log("Dividends: " + JSON.stringify(dividends));

      let toUserDividends = dividends["toUser"];

      if (!toUserDividends) {
        console.warn(
          "toUserDividends is undefined. Check formatterDividends output."
        );
      } else {
        console.log("toUserDividends: " + JSON.stringify(toUserDividends));
      }

      let filteredCapitalGainsYears = capitalGains.map((gain) =>
        Number(gain["Ano de Realização"])
      );
      let filteredDividendsYears = toUserDividends.map((div) =>
        Number(div["Ano rendimento"])
      );

      console.log("Filtered: " + JSON.stringify(filteredDividendsYears));

      const years = [
        ...new Set([...filteredCapitalGainsYears, ...filteredDividendsYears]),
      ];

      years.sort((a, b) => a - b);

      let data = years.reduce((acc, curr) => {
        if (!acc[curr]) acc[curr] = {};
        acc[curr]["capitalGains"] = capitalGains.filter(
          (gain) => gain["Ano de Realização"] == curr
        );
        acc[curr]["dividends"] = {};
        if (!acc[curr]["dividends"]["toUser"])
          acc[curr]["dividends"]["toUser"] = {};
        if (!acc[curr]["dividends"]["toIRS"])
          acc[curr]["dividends"]["toIRS"] = {};
        acc[curr]["dividends"]["toUser"] = dividends["toUser"].filter(
          (div) => div["Ano rendimento"] == curr
        );
        acc[curr]["dividends"]["toIRS"] = dividends["toIRS"].filter(
          (div) => div["Ano rendimento"] == curr
        );
        return acc;
      }, {});
      console.log("Fiscal Data: " + JSON.stringify(data));

      loader.style.display = "none";
      setFiscalData(data);
      setStep((step) => step + 1);
    }

    return (
      <>
        <h4>Histórico de operações:</h4>
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

  function RevolutFiles() {
    const [operationFiles, setOperationFiles] = useState([]);
    const [profitLossFiles, setProfitLossFiles] = useState([]);

    function removeOperationFile(index) {
      setOperationFiles((prev) => prev.filter((_, i) => i !== index));
    }

    function onOperationFileUpload(e) {
      const files = e.target.files;
      if (files) {
        setOperationFiles((prev) => [...Array.from(files)]);
      }
    }

    function removeProfitLossFile(index) {
      setProfitLossFiles((prev) => prev.filter((_, i) => i !== index));
    }

    function onProfitLossFileUpload(e) {
      const files = e.target.files;
      if (files) {
        setProfitLossFiles((prev) => [...Array.from(files)]);
      }
    }

    async function onFilesSelected() {
      const loader = document.getElementById("custom-loader-container");
      loader.style.display = "flex";

      if (
        profitLossFiles.length === 0 ||
        operationFiles.length === 0 ||
        !broker
      )
        return;

      const parser = new RevolutParser();
      const statement = new Statement([]);
      const formatterCapitalGains = new PTCapitalGainsFormatter();
      const formatterDividends = new PTDividendsFormatter();

      const profitLossPromises = profitLossFiles.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = e.target.result;
            parser.loadIsins(data);
            resolve();
          };

          reader.onerror = function (e) {
            reject(e.target.error);
          };

          reader.readAsText(file);
        });
      });

      await Promise.all(profitLossPromises);

      const operationsPromises = operationFiles.map((file) => {
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

      let transactions = await Promise.all(operationsPromises);

      transactions.forEach((transaction) => {
        statement.addTransactions(transaction);
      });

      await statement.fetchData(new AssetBuffer());
      let capitalGains = await formatterCapitalGains.format(statement);
      let dividends = await formatterDividends.format(statement);
      // dividends = dividends["toUser"];
      console.log("Dividends: " + JSON.stringify(dividends));

      let toUserDividends = dividends["toUser"];

      if (!toUserDividends) {
        console.warn(
          "toUserDividends is undefined. Check formatterDividends output."
        );
      } else {
        console.log("toUserDividends: " + JSON.stringify(toUserDividends));
      }

      let filteredCapitalGainsYears = capitalGains.map((gain) =>
        Number(gain["Ano de Realização"])
      );
      let filteredDividendsYears = toUserDividends.map((div) =>
        Number(div["Ano rendimento"])
      );

      console.log("Filtered: " + JSON.stringify(filteredDividendsYears));

      const years = [
        ...new Set([...filteredCapitalGainsYears, ...filteredDividendsYears]),
      ];

      years.sort((a, b) => a - b);

      let data = years.reduce((acc, curr) => {
        if (!acc[curr]) acc[curr] = {};
        acc[curr]["capitalGains"] = capitalGains.filter(
          (gain) => gain["Ano de Realização"] == curr
        );
        acc[curr]["dividends"] = {};
        if (!acc[curr]["dividends"]["toUser"])
          acc[curr]["dividends"]["toUser"] = {};
        if (!acc[curr]["dividends"]["toIRS"])
          acc[curr]["dividends"]["toIRS"] = {};
        acc[curr]["dividends"]["toUser"] = dividends["toUser"].filter(
          (div) => div["Ano rendimento"] == curr
        );
        acc[curr]["dividends"]["toIRS"] = dividends["toIRS"].filter(
          (div) => div["Ano rendimento"] == curr
        );
        return acc;
      }, {});
      console.log("Fiscal Data: " + JSON.stringify(data));

      loader.style.display = "none";
      setFiscalData(data);
      setStep((step) => step + 1);
    }

    return (
      <>
        <h4>Histórico de operações:</h4>
        <div className={clsx(styles.contentStep2)}>
          <Upload className={clsx(styles.contentStep2UploadIcon)} />
          <input
            className={clsx(styles.contentStep2UploadInput)}
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={onOperationFileUpload}
          />
          <label htmlFor="file-upload">Escolher ficheiro</label>
          {operationFiles.length > 0 && (
            <>
              <div className={clsx(styles.contentStep2Files)}>
                {operationFiles.map((file, index) => (
                  <div key={index} className={clsx(styles.contentStep2File)}>
                    <div className={clsx(styles.contentStep2FileName)}>
                      {file.name}
                    </div>
                    <div
                      className={clsx(styles.contentStep2FileRemove)}
                      onClick={() => removeOperationFile(index)}
                    >
                      <X />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <br></br>
        <h4>Extrato de lucros e perdas:</h4>
        <div className={clsx(styles.contentStep2)}>
          <Upload className={clsx(styles.contentStep2UploadIcon)} />
          <input
            className={clsx(styles.contentStep2UploadInput)}
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={onProfitLossFileUpload}
          />
          <label htmlFor="file-upload">Escolher ficheiro</label>
          {profitLossFiles.length > 0 && (
            <>
              <div className={clsx(styles.contentStep2Files)}>
                {profitLossFiles.map((file, index) => (
                  <div key={index} className={clsx(styles.contentStep2File)}>
                    <div className={clsx(styles.contentStep2FileName)}>
                      {file.name}
                    </div>
                    <div
                      className={clsx(styles.contentStep2FileRemove)}
                      onClick={() => removeProfitLossFile(index)}
                    >
                      <X />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {operationFiles.length > 0 && profitLossFiles.length > 0 && (
          <div
            className={clsx(styles.contentStep2Process)}
            onClick={onFilesSelected}
          >
            <div className={clsx(styles.contentStep2ProcessText)}>
              Processar {operationFiles.length + profitLossFiles.length}{" "}
              ficheiros
            </div>
            <ArrowRight />
          </div>
        )}
      </>
    );
  }

  function ContentStep2(props) {
    return (
      <>
        {broker.name === "Trading212" && <Trading212Files />}
        {broker.name === "Revolut" && <RevolutFiles />}
      </>
    );
  }

  function exportToExcel(year, data) {
    console.log("Exporting to Excel...");
    const wsCapitalGains = XLSX.utils.json_to_sheet(data["capitalGains"]);
    const wsDividends = XLSX.utils.json_to_sheet(data["dividends"]["toIRS"]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsCapitalGains, "Mais valias");
    XLSX.utils.book_append_sheet(wb, wsDividends, "Dividendos");
    XLSX.writeFile(wb, `maisvalias-tool-${year}.xlsx`);
  }

  function exportToIRS(year) {
    setFiscalYear(year);
    setIRSdialogVisible(true);
  }

  function DialogIRSDeclaration({ visible, year, data }) {
    const [files, setFiles] = useState([]);

    function onFileUpload(e) {
      const files = e.target.files;
      setFiles((prev) => Array.from(files));
    }

    function closeDialogIRS() {
      setIRSdialogVisible(false);
    }

    function onDeclarationUpload(e) {
      const loader = document.getElementById(
        "declaration-custom-loader-container"
      );
      loader.style.display = "flex";

      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const xml_irs = e.target.result;

        const fullfilledIRS = PTIRSFormatter.format(
          xml_irs,
          fiscalData[fiscalYear]["capitalGains"],
          fiscalData[fiscalYear]["dividends"]["toIRS"]
        );

        fullfilledIRS.then((irs) => {
          console.log("Declaração formatada: " + irs);
          loader.style.display = "none";
          document.getElementById("declaration-upload").style.display = "none";
          document.getElementById("declaration-download").style.display =
            "block";

          const blob = new Blob([irs], { type: "application/xml" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `declaracao-irs-${fiscalYear}-preenchida.xml`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        });
      };

      reader.onerror = function (e) {
        console.error(e.target.error);
      };

      reader.readAsText(file);
    }

    return (
      <>
        {visible && (
          <div className={clsx(styles.dialogIRSDeclaration)}>
            <div className={clsx(styles.dialogIRSDeclarationCard)}>
              <div className={clsx(styles.dialogIRSDeclarationHeader)}>
                <svg width="2rem" height="2rem" viewBox="0 0 24 24">
                  <text x="0" y="18">
                    IRS
                  </text>
                </svg>
                <div className={clsx(styles.dialogIRSDeclarationTitle)}>
                  Preencher declaração
                  <div className={clsx(styles.dialogIRSDeclarationSubtitle)}>
                    Adiciona os resultados da ferramenta à tua declaração do IRS
                  </div>
                </div>
                <X
                  onClick={closeDialogIRS}
                  className={clsx(styles.dialogIRSDeclarationClose)}
                />
              </div>
              <div className={clsx(styles.dialogIRSDeclarationContent)}>
                <div
                  id="declaration-custom-loader-container"
                  className="local-custom-loader-container"
                >
                  <div className="custom-loader"></div>
                  <p className="custom-loader-text">Calculando...</p>
                </div>
                <div id="declaration-upload">
                  <p>
                    Coloca aqui a tua declaração de IRS para podermos
                    preenchê-la com os dados calculados:
                  </p>
                  <div className={clsx(styles.contentStep2)}>
                    <Upload className={clsx(styles.contentStep2UploadIcon)} />
                    <input
                      className={clsx(styles.contentStep2UploadInput)}
                      id="file-upload"
                      type="file"
                      accept=".xml"
                      onChange={onFileUpload}
                    />
                    <label htmlFor="file-upload">Escolher ficheiro</label>
                    {files.length > 0 && (
                      <>
                        <div className={clsx(styles.contentStep2Files)}>
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className={clsx(styles.contentStep2File)}
                            >
                              <div
                                className={clsx(styles.contentStep2FileName)}
                              >
                                {file.name}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className={clsx(styles.contentStep2Process)}
                          onClick={onDeclarationUpload}
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
                  <p
                    style={{
                      "font-style": "italic",
                      "font-weight": "bold",
                      padding: "1rem",
                    }}
                  >
                    Nota: A declaração não deve conter erros e deve estar num
                    estado em que não precises de preencher mais nenhuma
                    informação sem ser os ganhos com investimentos. A declaração
                    que aqui colocares deve ser a obtida no portal das finanças
                    através da opção "Guardar".
                  </p>
                </div>
                <div id="declaration-download" style={{ display: "none" }}>
                  <p>
                    A tua declaração foi preenchida e enviada para o teu
                    dispositivo. Confirma sempre se os resultados estão
                    corretos!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  function FiscalYearCard({ year, data }) {
    const [activeTab, setActiveTab] = useState("capitalGains");

    return (
      <div className={clsx(styles.fiscalCard)}>
        <div className={clsx(styles.fiscalCardHeader)}>
          <div className={clsx(styles.fiscalCardTitle)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h2>Ano Fiscal: {year}</h2>
          </div>
          <div className={clsx(styles.fiscalCardMenu)}>
            <div className={clsx(styles.fiscalCardActions)}>
              <div
                onClick={() => exportToExcel(year, data)}
                className={clsx(styles.fiscalCardAction)}
              >
                <svg width="1rem" height="1rem" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.29289 1.29289C9.48043 1.10536 9.73478 1 10 1H18C19.6569 1 21 2.34315 21 4V9C21 9.55228 20.5523 10 20 10C19.4477 10 19 9.55228 19 9V4C19 3.44772 18.5523 3 18 3H11V8C11 8.55228 10.5523 9 10 9H5V20C5 20.5523 5.44772 21 6 21H7C7.55228 21 8 21.4477 8 22C8 22.5523 7.55228 23 7 23H6C4.34315 23 3 21.6569 3 20V8C3 7.73478 3.10536 7.48043 3.29289 7.29289L9.29289 1.29289ZM6.41421 7H9V4.41421L6.41421 7ZM19 12C19.5523 12 20 12.4477 20 13V19H23C23.5523 19 24 19.4477 24 20C24 20.5523 23.5523 21 23 21H19C18.4477 21 18 20.5523 18 20V13C18 12.4477 18.4477 12 19 12ZM11.8137 12.4188C11.4927 11.9693 10.8682 11.8653 10.4188 12.1863C9.96935 12.5073 9.86526 13.1318 10.1863 13.5812L12.2711 16.5L10.1863 19.4188C9.86526 19.8682 9.96935 20.4927 10.4188 20.8137C10.8682 21.1347 11.4927 21.0307 11.8137 20.5812L13.5 18.2205L15.1863 20.5812C15.5073 21.0307 16.1318 21.1347 16.5812 20.8137C17.0307 20.4927 17.1347 19.8682 16.8137 19.4188L14.7289 16.5L16.8137 13.5812C17.1347 13.1318 17.0307 12.5073 16.5812 12.1863C16.1318 11.8653 15.5073 11.9693 15.1863 12.4188L13.5 14.7795L11.8137 12.4188Z"
                  />
                </svg>
                <span>Exportar Excel</span>
              </div>
              <div
                onClick={() => exportToIRS(year, data)}
                className={clsx(styles.fiscalCardAction)}
              >
                <svg width="1rem" height="1rem" viewBox="0 0 24 24">
                  <text x="0" y="18">
                    IRS
                  </text>
                </svg>
                <span>Preencher declaração</span>
              </div>
            </div>
            <div className={clsx(styles.fiscalCardActionsDropdown)}>
              <svg
                height="24px"
                width="24px"
                className={clsx(styles.threedots)}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
              >
                <path
                  className="cls-1"
                  d="M8,6.5A1.5,1.5,0,1,1,6.5,8,1.5,1.5,0,0,1,8,6.5ZM.5,8A1.5,1.5,0,1,0,2,6.5,1.5,1.5,0,0,0,.5,8Zm12,0A1.5,1.5,0,1,0,14,6.5,1.5,1.5,0,0,0,12.5,8Z"
                />
              </svg>
              <div className={clsx(styles.fiscalCardActionsDropdownContent)}>
                <div
                  onClick={() => exportToExcel(year, data)}
                  className={clsx(styles.fiscalCardAction)}
                >
                  <svg width="1rem" height="1rem" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.29289 1.29289C9.48043 1.10536 9.73478 1 10 1H18C19.6569 1 21 2.34315 21 4V9C21 9.55228 20.5523 10 20 10C19.4477 10 19 9.55228 19 9V4C19 3.44772 18.5523 3 18 3H11V8C11 8.55228 10.5523 9 10 9H5V20C5 20.5523 5.44772 21 6 21H7C7.55228 21 8 21.4477 8 22C8 22.5523 7.55228 23 7 23H6C4.34315 23 3 21.6569 3 20V8C3 7.73478 3.10536 7.48043 3.29289 7.29289L9.29289 1.29289ZM6.41421 7H9V4.41421L6.41421 7ZM19 12C19.5523 12 20 12.4477 20 13V19H23C23.5523 19 24 19.4477 24 20C24 20.5523 23.5523 21 23 21H19C18.4477 21 18 20.5523 18 20V13C18 12.4477 18.4477 12 19 12ZM11.8137 12.4188C11.4927 11.9693 10.8682 11.8653 10.4188 12.1863C9.96935 12.5073 9.86526 13.1318 10.1863 13.5812L12.2711 16.5L10.1863 19.4188C9.86526 19.8682 9.96935 20.4927 10.4188 20.8137C10.8682 21.1347 11.4927 21.0307 11.8137 20.5812L13.5 18.2205L15.1863 20.5812C15.5073 21.0307 16.1318 21.1347 16.5812 20.8137C17.0307 20.4927 17.1347 19.8682 16.8137 19.4188L14.7289 16.5L16.8137 13.5812C17.1347 13.1318 17.0307 12.5073 16.5812 12.1863C16.1318 11.8653 15.5073 11.9693 15.1863 12.4188L13.5 14.7795L11.8137 12.4188Z"
                    />
                  </svg>
                  <span>Exportar Excel</span>
                </div>
                <div
                  onClick={() => exportToIRS(year, data)}
                  className={clsx(styles.fiscalCardAction)}
                >
                  <svg width="1rem" height="1rem" viewBox="0 0 24 24">
                    <text x="0" y="18">
                      IRS
                    </text>
                  </svg>
                  <span>Preencher declaração</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={clsx(styles.fiscalCardTabs)}>
          <button
            className={
              activeTab === "capitalGains"
                ? clsx(styles.fiscalCardTabActive)
                : ""
            }
            onClick={() => setActiveTab("capitalGains")}
          >
            Mais valias ({data["capitalGains"].length})
          </button>
          <button
            className={
              activeTab === "dividends" ? clsx(styles.fiscalCardTabActive) : ""
            }
            onClick={() => setActiveTab("dividends")}
          >
            Dividendos ({data["dividends"]["toUser"].length})
          </button>
        </div>
        <table className={clsx(styles.fiscalCardTable)}>
          <thead>
            <tr>
              {activeTab === "capitalGains" && (
                <>
                  <th>Ticker</th>
                  <th>País da fonte</th>
                  <th>Código</th>
                  <th>Ano de Aquisição</th>
                  <th>Mês de Aquisição</th>
                  <th>Dia de Aquisição</th>
                  <th>Valor de Aquisição</th>
                  <th>Ano de Realização</th>
                  <th>Mês de Realização</th>
                  <th>Dia de Realização</th>
                  <th>Valor de Realização</th>
                  <th>Despesas e Encargos</th>
                  <th>Imposto retido no estrangeiro</th>
                  <th>País da Contraparte</th>
                </>
              )}
              {activeTab === "dividends" && (
                <>
                  <th>Ticker</th>
                  <th>Ano rendimento</th>
                  <th>Código Rendimento</th>
                  <th>País da fonte</th>
                  <th>Rendimento Bruto</th>
                  <th>Imposto Pago no Estrangeiro - No país da fonte</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {activeTab === "dividends" &&
              data[activeTab]["toUser"].map((row, index) => {
                return (
                  <tr>
                    {Object.values(row).map((value, index) => {
                      return <td key={index}>{value}</td>;
                    })}
                  </tr>
                );
              })}
            {activeTab !== "dividends" &&
              data[activeTab].map((row, index) => {
                return (
                  <tr>
                    {Object.values(row).map((value, index) => {
                      return <td key={index}>{value}</td>;
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }

  function ContentStep3(props) {
    return (
      <>
        <div className={clsx(styles.contentStep3)}>
          {Object.entries(fiscalData).map(([year, data]) => {
            return <FiscalYearCard key={year} year={year} data={data} />;
          })}
          <DialogIRSDeclaration visible={IRSdialogVisible} />
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
