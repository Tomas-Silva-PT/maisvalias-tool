import clsx from "clsx";
import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import { ArrowRight, Upload, X } from "lucide-react";

import { Statement } from "../../maisvalias-tool/models/statement.js";
import { RevolutParser } from "../../maisvalias-tool/parsers/revolutparser.js";
import { AssetBuffer } from "../../maisvalias-tool/models/asset.js";
import { PTCapitalGainsFormatter } from "../../maisvalias-tool/formatters/pt/irs/capital_gains_formatter.js";
import { PTDividendsFormatter } from "../../maisvalias-tool/formatters/pt/irs/dividends_formatter.js";

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

export default function FilesRevolut({setFiscalData, setStep}) {
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