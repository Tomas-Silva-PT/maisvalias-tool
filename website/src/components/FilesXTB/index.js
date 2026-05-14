import clsx from "clsx";
import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import { ArrowRight, Upload, X } from "lucide-react";

import { XTBParser } from "../../maisvalias-tool/parsers/brokerparsers/xtb/xtbparser.js";

import ErrorPopup from "@site/src/components/ErrorPopup";
import { ParserEngine } from "../../maisvalias-tool/parsers/parserengine.js";
import { CSVParser } from "../../maisvalias-tool/parsers/fileparsers/csvparser.js";
import { ExcelParser } from "../../maisvalias-tool/parsers/fileparsers/excelparser.js";

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
  },
];

export default function FilesXTB({ id, setFiscalData }) {
  const [files, setFiles] = useState([]);
  const [errorType, setErrorType] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (files.length > 0) {
      // Scroll to the submit button after files are selected
      const submitButton = document.getElementById("submitFilesButton");
      if (submitButton) {
        smoothFocus(submitButton, "center");
      }
    }
  }, [files]);

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
            <a href="docs/corretoras/trading212" target="_blank">
              documentação
            </a>{" "}
            e tenta novamente.
          </p>
          <p>
            Se o problema persistir,{" "}
            <a
              href="/maisvalias-tool/about#como-nos-contactar "
              target="_blank"
            >
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
            <a
              href="/maisvalias-tool/about#como-nos-contactar "
              target="_blank"
            >
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

  function onFileUpload(e) {
    const files = e.target.files;
    if (files) {
      setFiles((prev) => [...prev, ...Array.from(files)]);
    }
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    document.getElementById("file-upload").value = ""; // Clear the input value
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

    const brokerParser = new XTBParser();
    const csvParser = new CSVParser();
    const excelParser = new ExcelParser();

    
    // const statement = new Statement([]);

    const filePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Escolher o parser consoante a extensão
        const extension = file.name.split(".").pop().toLowerCase();
        let fileParser;

        if (extension === "csv") {
          fileParser = csvParser;
        } else if (extension === "xlsx") {
          fileParser = excelParser;
        } else {
          reject(new Error(`Formato não suportado: ${extension}`));
          return;
        }

        const parserEngine = new ParserEngine(fileParser, brokerParser);

        reader.onload = async (e) => {
          const data = e.target.result;
          try {
            const transactions = await parserEngine.parse(data);
            resolve(transactions);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = function (e) {
          reject(e.target.error);
        };

        // Ler como texto para CSV, como ArrayBuffer para Excel
      if (extension === "csv") {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
      });
    });

    let transactions;

    try {
      transactions = await Promise.all(filePromises);
      dispatchSuccess();
    } catch (error) {
      dispatchError("filesUploaded");
      const end = performance.now();
      console.log(
        `Duração do processamento dos ficheiros: ${(
          (end - start) /
          1000
        ).toFixed(3)} seconds`,
      );
      return;
    }

    if (
      transactions.filter((transaction) => transaction.length !== 0).length ===
      0
    ) {
      dispatchError("filesUploaded");
    } else {
      dispatchSuccess();
      setFiscalData(transactions);
    }

    const end = performance.now();
    console.log(
      `Duração do processamento dos ficheiros: ${((end - start) / 1000).toFixed(
        3,
      )} segundos`,
    );
  }

  return (
    <div id={id}>
      <h4>Histórico de operações:</h4>
      <div id="contentStep2" className={clsx(styles.contentStep2)}>
        <Upload className={clsx(styles.contentStep2UploadIcon)} />
        <input
          className={clsx(styles.contentStep2UploadInput)}
          id="file-upload"
          type="file"
          accept=".xlsx, .csv"
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
          </>
        )}
      </div>
      {files.length > 0 && (
        <>
          <div
            id="submitFilesButton"
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
      {renderError(error)}
    </div>
  );
}
