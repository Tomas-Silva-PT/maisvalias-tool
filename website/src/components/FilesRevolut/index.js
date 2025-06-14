import clsx from "clsx";
import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import { ArrowRight, Upload, X } from "lucide-react";

import { RevolutParser } from "../../maisvalias-tool/parsers/revolutparser.js";
import ErrorPopup from "@site/src/components/ErrorPopup";

const broker = [
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

export default function FilesRevolut({ setFiscalData }) {
  const [operationFiles, setOperationFiles] = useState([]);
  const [profitLossFiles, setProfitLossFiles] = useState([]);
  const [errorType, setErrorType] = useState(null);
  const [error, setError] = useState(null);

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
            <a href="docs/corretoras/revolut" target="_blank">
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
    const start = performance.now();

    const loader = document.getElementById("custom-loader-container");
    loader.style.display = "flex";

    if (profitLossFiles.length === 0 || operationFiles.length === 0 || !broker)
      return;

    const parser = new RevolutParser();

    const profitLossPromises = profitLossFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target.result;
          try {
            parser.loadIsins(data);
            resolve();
          } catch (e) {
            reject();
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
      await Promise.all(profitLossPromises);
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

    const operationsPromises = operationFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target.result;
          try {
            const transactions = parser.parse(data);
            resolve(transactions);
          } catch (e) {
            console.error(e);
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
      transactions = await Promise.all(operationsPromises);
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
    <>
      <h4>Histórico de operações:</h4>
      <div id="contentStep2-1" className={clsx(styles.contentStep2)}>
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
      <div id="contentStep2-2" className={clsx(styles.contentStep2)}>
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
            Processar {operationFiles.length + profitLossFiles.length} ficheiros
          </div>
          <ArrowRight />
        </div>
      )}
      {renderError(error)}
    </>
  );
}
