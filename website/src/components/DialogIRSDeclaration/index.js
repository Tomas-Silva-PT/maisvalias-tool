import { useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import { ArrowRight, Underline, Upload, X } from "lucide-react";
import { PTIRSFormatter } from "../../maisvalias-tool/formatters/pt/irs/irs_xml_formatter.js";
import ErrorPopup from "@site/src/components/ErrorPopup";

import IRSDividendsTable from "@site/src/components/DataTables/IRSDividendsTable";
import IRSCapitalGainsTable from "@site/src/components/DataTables/IRSCapitalGainsTable";

export default function DialogIRSDeclaration({
  visible,
  setVisible,
  fiscalData,
  year,
}) {
  const [files, setFiles] = useState([]);
  const [showError, setError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeTable, setActiveTable] = useState(0);
  const [fillCapitalGains, setFillCapitalGains] = useState(true);
  const [fillDividends, setFillDividends] = useState(true);

  function onFileUpload(e) {
    const files = e.target.files;
    setFiles((prev) => Array.from(files));
  }

  function closeDialogIRS() {
    setVisible(false);
    setFiles([]);
    setError(false);
    setActiveTab(0);
    setActiveTable(0);
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

      let capitalGains = fiscalData.byYear[year].capitalGains.irs;
      let dividends = fiscalData.byYear[year].dividends.irs;
      if (!fillCapitalGains) {
        capitalGains = [];
      }
      if (!fillDividends) {
        dividends = [];
      }
      if (capitalGains.length === 0 && dividends.length === 0) {
        loader.style.display = "none";
        setError(true);
        return;
      }

      const fullfilledIRS = PTIRSFormatter.format(
        xml_irs,
        capitalGains,
        dividends
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
              <div className={clsx(styles.tabsContainer)}>
                <div
                  className={
                    activeTab === 0
                      ? clsx(styles.activeTab, styles.tab)
                      : clsx(styles.tab)
                  }
                  onClick={() => {
                    setActiveTab(0);
                  }}
                >
                  <i class="fa-solid fa-gear"></i>
                  <span>Preencher automaticamente</span>
                </div>
                <div
                  className={
                    activeTab === 1
                      ? clsx(styles.activeTab, styles.tab)
                      : clsx(styles.tab)
                  }
                  onClick={() => {
                    setActiveTab(1);
                  }}
                >
                  <i class="fa-solid fa-pen"></i>
                  <span>Preencher manualmente</span>
                </div>
              </div>
              {activeTab === 0 && (
                <div id="declaration-upload">
                  <p>
                    Coloca aqui a tua declaração de IRS para podermos
                    preenchê-la com os dados calculados:
                  </p>
                  <div className={clsx(styles.fileUploadOptions)}>
                    {fiscalData.byYear[year].capitalGains.raw.length > 0 && (
                      <div className={clsx(styles.fileUploadOption)}>
                        <div class="checkbox-wrapper-6">
                          <input
                            title="Preencher mais-valias"
                            class="tgl tgl-light"
                            id="cb1-1"
                            type="checkbox"
                            checked={fillCapitalGains}
                            onChange={() => {
                              setFillCapitalGains(!fillCapitalGains);
                            }}
                          />
                          <label class="tgl-btn" for="cb1-1"></label>
                        </div>
                        <span>
                          Preencher mais-valias
                          <span className={clsx(styles.fileUploadOptionInfo)}>
                            {" - "}
                            Anexo J Quadro 9.2A
                          </span>
                        </span>
                      </div>
                    )}
                    {fiscalData.byYear[year].dividends.raw.length > 0 && (
                      <div className={clsx(styles.fileUploadOption)}>
                        <div class="checkbox-wrapper-6">
                          <input
                            title="Preencher dividendos"
                            class="tgl tgl-light"
                            id="cb1-2"
                            type="checkbox"
                            checked={fillDividends}
                            onChange={() => {
                              setFillDividends(!fillDividends);
                            }}
                          />
                          <label class="tgl-btn" for="cb1-2"></label>
                        </div>
                        <span>
                          Preencher dividendos
                          <span className={clsx(styles.fileUploadOptionInfo)}>
                            {" - "}
                            Anexo J Quadro 8
                          </span>
                        </span>
                      </div>
                    )}
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
                        {(fillCapitalGains || fillDividends) && (
                          <div
                            className={clsx(styles.fileUploadSubmitButton)}
                            onClick={onDeclarationUpload}
                          >
                            <div
                              className={clsx(
                                styles.fileUploadSubmitButtonText
                              )}
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
              )}
              {activeTab === 1 && (
                <div className={clsx(styles.bodyContent)}>
                  <div className={clsx(styles.tablesHeader)}>
                    <div
                      className={
                        activeTable === 0
                          ? clsx(styles.tableHeaderActive, styles.tableHeader)
                          : clsx(styles.tableHeader)
                      }
                      onClick={() => {
                        setActiveTable(0);
                      }}
                    >
                      <span>Anexo J Quadro 9.2A</span>
                      <span> - </span>
                      <span>Rendimentos de Incrementos Patrimoniais</span>
                    </div>
                    <div
                      className={
                        activeTable === 1
                          ? clsx(styles.tableHeaderActive, styles.tableHeader)
                          : clsx(styles.tableHeader)
                      }
                      onClick={() => {
                        setActiveTable(1);
                      }}
                    >
                      <span>Anexo J Quadro 8</span>
                      <span> - </span>
                      <span>Rendimentos de capitais</span>
                    </div>
                  </div>
                  <div className={clsx(styles.tablesContainer)}>
                    {activeTable === 0 && (
                      <div className={clsx(styles.table)}>
                        <IRSCapitalGainsTable
                          fiscalData={fiscalData}
                          year={year}
                        />
                      </div>
                    )}
                    {activeTable === 1 && (
                      <div className={clsx(styles.table)}>
                        <IRSDividendsTable
                          fiscalData={fiscalData}
                          year={year}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
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
      {showError && (fillCapitalGains || fillDividends) && (
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
      {showError && !fillCapitalGains && !fillDividends && (
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
