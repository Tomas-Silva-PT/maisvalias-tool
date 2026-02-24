import clsx from "clsx";
import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import { ArrowRight, Upload, X } from "lucide-react";

import { DegiroParser } from "../../maisvalias-tool/parsers/degiroparser.js";
import ErrorPopup from "@site/src/components/ErrorPopup";
import { CSVParser } from "../../maisvalias-tool/parsers/csvparser.js";
import { ParserEngine } from "../../maisvalias-tool/parsers/parserengine.js";

const broker = [
  {
    name: "Degiro",
    logo: "/img/brokers/degiro.png",
    active: true,
    docs: [
      {
        message: "Não sabes onde encontrar os ficheiros?",
        link: "docs/corretoras/degiro",
      },
    ],
  },
];

export default function FilesDegiro({ id, setFiscalData }) {
  const [transactionFiles, setTransactionFiles] = useState([]);
  const [accountFiles, setAccountFiles] = useState([]);
  const [errorType, setErrorType] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transactionFiles.length > 0 && accountFiles.length > 0) {
      // Scroll to the submit button after files are selected
      const submitButton = document.getElementById("submitFilesButton");
      if (submitButton) {
        smoothFocus(submitButton, "center");
      }
    } else if (transactionFiles.length > 0) {
      const profitLossElement = document.getElementById("file-upload-profit-loss");
      if (profitLossElement) {
        smoothFocus(profitLossElement, "center");
      }
    }
  }, [transactionFiles, accountFiles]);

  function smoothFocus(element, block = "start") {
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: block });

    // Delay focus slightly to let scroll animation begin
    setTimeout(() => {
      element.focus({ preventScroll: true });
    }, 300); // tweak delay if needed
  }

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
            <a href="docs/corretoras/degiro" target="_blank">
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

  function removeTransactionFile(index) {
    setTransactionFiles((prev) => prev.filter((_, i) => i !== index));
    document.getElementById("file-upload-operation").value = ""; // Clear the input value
  }

  function onTransactionFileUpload(e) {
    const files = e.target.files;
    if (files) {
      setTransactionFiles((prev) => [...Array.from(files)]);
    }
  }

  function removeAccountFile(index) {
    setAccountFiles((prev) => prev.filter((_, i) => i !== index));
    document.getElementById("file-upload-profit-loss").value = ""; // Clear the input value
  }

  function onAccountFileUpload(e) {
    const files = e.target.files;
    if (files) {
      setAccountFiles((prev) => [...Array.from(files)]);
    }
  }

  async function onFilesSelected() {
    const start = performance.now();

    const loader = document.getElementById("custom-loader-container");
    loader.style.display = "flex";

    if (accountFiles.length === 0 || transactionFiles.length === 0 || !broker)
      return;

    const brokerParser = new DegiroParser();
    const fileParser = new CSVParser();
    const parserEngine = new ParserEngine(fileParser, brokerParser);

    const accountPromises = accountFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target.result;
          try {
            brokerParser.loadAccountResume(data);
            resolve();
          } catch (e) {
            reject(e);
          }
        };

        reader.onerror = function (e) {
          reject(e.target.error);
        };

        reader.readAsText(file);
      });
    });

    let contentStep22 = document.getElementById("contentStep2-2");
    let contentStep21 = document.getElementById("contentStep2-1");

    try {
      await Promise.all(accountPromises);
      contentStep22.classList.remove(clsx(styles.contentStep2Error));
    } catch (error) {
      contentStep22.classList.add(clsx(styles.contentStep2Error));
      contentStep21.classList.remove(clsx(styles.contentStep2Error));
      loader.style.display = "none";
      setError(error);
      setErrorType("filesUploaded");
      const end = performance.now();
      console.log(
        `Duração do processamento dos ficheiros: ${(
          (end - start) /
          1000
        ).toFixed(3)} seconds`
      );
      return;
    }

    const transactionsPromises = transactionFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target.result;
          try {
            const transactions = parserEngine.parse(data);
            resolve(transactions);
          } catch (e) {
            console.error(e);
            reject(e);
          }
        };

        reader.onerror = function (e) {
          reject(e.target.error);
        };

        reader.readAsText(file);
      });
    });

    let transactions = [];

    try {
      transactions = await Promise.all(transactionsPromises);
      contentStep21.classList.remove(clsx(styles.contentStep2Error));
    } catch (error) {
      contentStep21.classList.add(clsx(styles.contentStep2Error));
      loader.style.display = "none";
      setError(error);
      setErrorType("filesUploaded");
      const end = performance.now();
      console.log(
        `Duração do processamento dos ficheiros: ${(
          (end - start) /
          1000
        ).toFixed(3)} seconds`
      );
      return;
    }

    if (
      transactions.filter((transaction) => transaction.length !== 0).length ===
      0
    ) {
      loader.style.display = "none";
      setErrorType("filesUploaded");
      contentStep21.classList.add(clsx(styles.contentStep2Error));
    } else {
      contentStep21.classList.remove(clsx(styles.contentStep2Error));
      contentStep22.classList.remove(clsx(styles.contentStep2Error));
      setFiscalData(transactions);
    }

    const end = performance.now();
    console.log(
      `Duração do processamento: ${((end - start) / 1000).toFixed(3)} seconds`
    );
  }

  return (
    <div id={id}>
      <h4>Histórico de transações:</h4>
      <div id="contentStep2-1" className={clsx(styles.contentStep2)}>
        <Upload className={clsx(styles.contentStep2UploadIcon)} />
        <input
          className={clsx(styles.contentStep2UploadInput)}
          id="file-upload-operation"
          type="file"
          accept=".csv"
          onChange={onTransactionFileUpload}
        />
        <label htmlFor="file-upload-operation">Escolher ficheiro</label>
        {transactionFiles.length > 0 && (
          <>
            <div className={clsx(styles.contentStep2Files)}>
              {transactionFiles.map((file, index) => (
                <div key={index} className={clsx(styles.contentStep2File)}>
                  <div className={clsx(styles.contentStep2FileName)}>
                    {file.name}
                  </div>
                  <div
                    className={clsx(styles.contentStep2FileRemove)}
                    onClick={() => removeTransactionFile(index)}
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
      <h4>Resumo da conta:</h4>
      <div id="contentStep2-2" className={clsx(styles.contentStep2)}>
        <Upload className={clsx(styles.contentStep2UploadIcon)} />
        <input
          className={clsx(styles.contentStep2UploadInput)}
          id="file-upload-profit-loss"
          type="file"
          accept=".csv"
          onChange={onAccountFileUpload}
        />
        <label htmlFor="file-upload-profit-loss">Escolher ficheiro</label>
        {accountFiles.length > 0 && (
          <>
            <div className={clsx(styles.contentStep2Files)}>
              {accountFiles.map((file, index) => (
                <div key={index} className={clsx(styles.contentStep2File)}>
                  <div className={clsx(styles.contentStep2FileName)}>
                    {file.name}
                  </div>
                  <div
                    className={clsx(styles.contentStep2FileRemove)}
                    onClick={() => removeAccountFile(index)}
                  >
                    <X />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {transactionFiles.length > 0 && accountFiles.length > 0 && (
        <div
          className={clsx(styles.contentStep2Process)}
          onClick={onFilesSelected}
          id="submitFilesButton"
        >
          <div className={clsx(styles.contentStep2ProcessText)}>
            Processar {transactionFiles.length + accountFiles.length} ficheiros
          </div>
          <ArrowRight />
        </div>
      )}
      {renderError(error)}
    </div>
  );
}
