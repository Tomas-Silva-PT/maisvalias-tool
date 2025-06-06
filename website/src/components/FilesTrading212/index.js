import clsx from "clsx";
import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import { ArrowRight, Upload, X } from "lucide-react";

import { Statement } from "../../maisvalias-tool/models/statement.js";
import { Trading212Parser } from "../../maisvalias-tool/parsers/trading212parser.js";
import { PTCapitalGainsFormatter } from "../../maisvalias-tool/formatters/pt/irs/capital_gains_formatter.js";
import { PTDividendsFormatter } from "../../maisvalias-tool/formatters/pt/irs/dividends_formatter.js";

import ErrorPopup from "@site/src/components/ErrorPopup";

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
  },
];

export default function FilesTrading212({ setFiscalData, setStep }) {
  const [files, setFiles] = useState([]);
  const [errorType, setErrorType] = useState(null);
  const [error, setError] = useState(null);

  function renderError(error) {
    if (!errorType) return null;

    let content;

    if (errorType === "filesUploaded") {
      content = (
        <>
            <h3>Falha ao processar os ficheiros</h3>
            <span>
              Os ficheiros não são compatíveis com o formato esperado.
            </span>
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
              Não conseguimos obter as informações necessárias para o cálculo
              das mais-valias.
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
      <ErrorPopup title="Erro" closeFunction={() => {setErrorType(null); setError(null);}} error={error}>
        {content}
      </ErrorPopup>
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

  function dispatchError(errorType) {
    const loader = document.getElementById("custom-loader-container");
    contentStep2.classList.add(clsx(styles.contentStep2Error));
    loader.style.display = "none";
    setErrorType(errorType);
  }

  function dispatchSuccess() {
    contentStep2.classList.remove(clsx(styles.contentStep2Error));
    setErrorType(null);
  }

  async function onFilesSelected() {
    const start = performance.now();

    const loader = document.getElementById("custom-loader-container");
    loader.style.display = "flex";

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
          try {
            const transactions = parser.parse(data);
            resolve(transactions);
          } catch (error) {
            reject();
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
      transactions = await Promise.all(filePromises);
      dispatchSuccess();
    } catch (error) {
      dispatchError("filesUploaded");
      const end = performance.now();
      console.log(
        `Duração do processamento: ${((end - start) / 1000).toFixed(3)} seconds`
      );
      return;
    }

    transactions.forEach((transaction) => {
      statement.addTransactions(transaction);
    });

    try {
      await statement.fetchData();
    } catch (error) {
      setError(error);
      dispatchError("fetchingData");
      const end = performance.now();
      console.log(
        `Duração do processamento: ${((end - start) / 1000).toFixed(3)} seconds`
      );
      return;
    }

    let capitalGains = await formatterCapitalGains.format(statement);
    let dividends = await formatterDividends.format(statement);

    let toUserDividends = dividends["toUser"];

    if (!toUserDividends) {
      console.warn(
        "toUserDividends is undefined. Check formatterDividends output."
      );
    }

    let filteredCapitalGainsYears = capitalGains.map((gain) =>
      Number(gain["Ano de Realização"])
    );
    let filteredDividendsYears = toUserDividends.map((div) =>
      Number(div["Ano rendimento"])
    );

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

    loader.style.display = "none";

    if (Object.entries(data).length === 0) {
      dispatchError("filesUploaded");
    } else {
      dispatchSuccess();
      setFiscalData(data);
      setStep((step) => step + 1);
    }

    const end = performance.now();
    console.log(
      `Duração do processamento: ${((end - start) / 1000).toFixed(3)} segundos`
    );
  }

  return (
    <>
      <h4>Histórico de operações:</h4>
      <div id="contentStep2" className={clsx(styles.contentStep2)}>
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
      {renderError(error)}
      {/* {showError && (
        <ErrorPopup title="Erro" closeFunction={() => setError(false)}>
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
        </ErrorPopup>
      )} */}
    </>
  );
}
