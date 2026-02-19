import { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import { ArrowRight, Upload, X } from "lucide-react";

import { PTIRSFormatter } from "../../maisvalias-tool/formatters/pt/irs/pt_irs_formatter.js";
import { Classifier } from "../../maisvalias-tool/classifiers/classifier.js";
import { PTIRSRules2025 } from "../../maisvalias-tool/classifiers/rules/pt_rules2025.js";

import ErrorPopup from "@site/src/components/ErrorPopup";

export default function DialogIRSDeclaration({
  visible,
  setVisible,
  fiscalData,
  year,
}) {
  let capitalGains = fiscalData.byYear[year].capitalGains.raw;
  let dividends = fiscalData.byYear[year].dividends.raw;

  // Classify transactions into IRS panels
  const classifier = new Classifier(PTIRSRules2025);
  const taxEvents = [...capitalGains, ...dividends];
  const classifications = classifier.classify(taxEvents);

  const panels = Array.from(classifications.keys());
  // const classifiedTaxEvents = Array.from(classifications.values());

  const [files, setFiles] = useState([]);
  const [showError, setError] = useState(false);
  const [selectedPanels, setSelectedPanels] = useState(new Set());

  useEffect(() => {
    setSelectedPanels(new Set(panels.map((p) => p.code)));
  }, [year]);

  function togglePanel(code) {
    setSelectedPanels((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(code)) {
        newSet.delete(code);
      } else {
        newSet.add(code);
      }

      return newSet;
    });
  }

  function onFileUpload(e) {
    const files = e.target.files;
    setFiles((prev) => Array.from(files));
  }

  function closeDialogIRS() {
    setVisible(false);
    setFiles([]);
    setError(false);
  }

  function onDeclarationUpload(e) {
    const loader = document.getElementById(
      "declaration-custom-loader-container",
    );
    loader.style.display = "flex";

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const xml_irs = e.target.result;

      if (taxEvents.length === 0) {
        loader.style.display = "none";
        setError(true);
        return;
      }

      // Filtrar apenas os painéis selecionados
      const filteredClassifications = new Map(
        Array.from(classifications.entries()).filter(([destination]) =>
          selectedPanels.has(destination.code),
        ),
      );

      const fullfilledIRS = PTIRSFormatter.format(
        xml_irs,
        filteredClassifications,
      );

      const contentFile = document.getElementById("contentFile");
      fullfilledIRS
        .then((irs) => {
          contentFile.classList.remove(clsx(styles.contentStep2Error));

          // console.log("Declaração formatada: " + irs);
          loader.style.display = "none";
          document.getElementById("declaration-upload").style.display = "none";
          document.getElementById("declaration-download").style.display =
            "block";

          document.getElementById("content").style.display = "none";
          document.getElementById("title-text").innerHTML =
            "Declaração preenchida com sucesso!";

          document.getElementById("subtitle-text").innerHTML =
            "A tua declaração foi preenchida e descarregada para o teu dispositivo. Confirma sempre se os resultados estão corretos!";

          const blob = new Blob([irs], { type: "application/xml" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `declaracao-irs-${year}-preenchida.xml`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        })
        .catch((e) => {
          contentFile.classList.add(clsx(styles.contentStep2Error));
          loader.style.display = "none";
          setError(true);
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
        <div className={clsx(styles.container)}>
          <div className={clsx(styles.card)}>
            <div className={clsx(styles.background)}></div>
            <div className={clsx(styles.header)}>
              <svg width="2rem" height="2rem" viewBox="0 0 24 24">
                <text x="0" y="18">
                  IRS
                </text>
              </svg>
              <div className={clsx(styles.title)}>
                <span id="title-text">Preencher declaração</span>
                <div className={clsx(styles.subtitle)}>
                  <span id="subtitle-text">
                    Adiciona os resultados da ferramenta à tua declaração do IRS
                  </span>
                </div>
              </div>
              <X
                onClick={closeDialogIRS}
                className={clsx(styles.closeButton)}
              />
            </div>
            <div id="content" className={clsx(styles.content)}>
              <div
                id="declaration-custom-loader-container"
                className="local-custom-loader-container"
              >
                <div className="custom-loader"></div>
                <p className="custom-loader-text">Calculando...</p>
              </div>

              <div id="declaration-upload">
                <p>
                  Coloca aqui a tua declaração de IRS para podermos preenchê-la
                  com os dados calculados:
                </p>
                <div className={clsx(styles.fileUploadOptions)}>
                  {panels.map((panel) => {
                    const isChecked = selectedPanels.has(panel.code);

                    return (
                      <div className={clsx(styles.fileUploadOption)}>
                        <div className="checkbox-wrapper-6">
                          <input
                            title="Preencher"
                            className="tgl tgl-light"
                            id={`cb-${panel.code}`}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePanel(panel.code)}
                          />
                          <label
                            className="tgl-btn"
                            htmlFor={`cb-${panel.code}`}
                          ></label>
                        </div>
                        <span>
                          Preencher
                          <span className={clsx(styles.fileUploadOptionInfo)}>
                            {" - "}
                            {panel.title}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div id="contentFile" className={clsx(styles.fileContainer)}>
                  <Upload className={clsx(styles.fileUploadIcon)} />
                  <input
                    className={clsx(styles.fileUploadInput)}
                    id="file-upload"
                    type="file"
                    accept=".xml"
                    onChange={onFileUpload}
                  />
                  <label htmlFor="file-upload">Escolher ficheiro</label>
                  {files.length > 0 && (
                    <>
                      <div className={clsx(styles.fileUploadFiles)}>
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className={clsx(styles.fileUploadFile)}
                          >
                            <div className={clsx(styles.fileUploadFileNames)}>
                              {file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedPanels.size > 0 && (
                        <div
                          className={clsx(styles.fileUploadSubmitButton)}
                          onClick={onDeclarationUpload}
                        >
                          <div
                            className={clsx(styles.fileUploadSubmitButtonText)}
                          >
                            Processar {files.length} ficheiro
                            {files.length !== 1 ? "s" : ""}
                          </div>
                          <ArrowRight />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <p
                  style={{
                    fontStyle: "italic",
                    fontWeight: "bold",
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
                  A tua declaração foi preenchida e descarregada para o teu
                  dispositivo. Confirma sempre se os resultados estão corretos!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showError && selectedPanels.size > 0 && (
        <ErrorPopup title="Erro" closeFunction={() => setError(false)}>
          <h3>Falha ao processar os ficheiros</h3>
          <span>Os ficheiros não são compatíveis com o formato esperado.</span>
          <p>
            Por favor verifica quais os ficheiros corretos através da{" "}
            <a href="docs/como-utilizar/exportar-irs" target="_blank">
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
      )}
      {showError && selectedPanels.size === 0 && (
        <ErrorPopup title="Erro" closeFunction={() => setError(false)}>
          <h3>Nenhuma exportação escolhida</h3>
          <span>
            Tens de escolher alguma coisa para exportar, ou mais-valias ou
            dividendos.
          </span>
        </ErrorPopup>
      )}
    </>
  );
}
