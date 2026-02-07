import { useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import DialogIRSDeclaration from "@site/src/components/DialogIRSDeclaration";
import IRSCapitalGainsTable from "@site/src/components/DataTables/IRSCapitalGainsTable";
import UserCapitalGainsTable from "@site/src/components/DataTables/UserCapitalGainsTable";

import IRSDividendsTable from "@site/src/components/DataTables/IRSDividendsTable";
import UserDividendsTable from "@site/src/components/DataTables/UserDividendsTable";
import IRSSection from "../IRSSection";

export default function FiscalYearSummary({ id, year, fiscalData }) {

  const [activeTab, setActiveTab] = useState(0);
  const [tableMenuActiveTab, setTableMenuActiveTab] = useState(0);
  const [IRSdialogVisible, setIRSdialogVisible] = useState(false);

  function smoothFocus(element) {
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });

    // Delay focus slightly to let scroll animation begin
    setTimeout(() => {
      element.focus({ preventScroll: true });
    }, 300); // tweak delay if needed
  }

  function changeTab(tabIdx) {
    setActiveTab(tabIdx);
  }

  function exportToExcel(year) {
    console.log("Exporting to Excel...");
    const wsCapitalGains = XLSX.utils.json_to_sheet(
      fiscalData.byYear[year].capitalGains.excel
    );
    const wsCapitalGainsIRS = XLSX.utils.json_to_sheet(
      fiscalData.byYear[year].capitalGains.irs.map(
        ({ transaction, ...rest }) => rest
      )
    );
    const wsDividends = XLSX.utils.json_to_sheet(
      fiscalData.byYear[year].dividends.excel
    );
    const wsDividendsIRS = XLSX.utils.json_to_sheet(
      fiscalData.byYear[year].dividends.irs
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsCapitalGains, "Mais valias - Balanço");
    XLSX.utils.book_append_sheet(wb, wsCapitalGainsIRS, "Mais valias - IRS");
    XLSX.utils.book_append_sheet(wb, wsDividends, "Dividendos - Balanço");
    XLSX.utils.book_append_sheet(wb, wsDividendsIRS, "Dividendos - IRS");
    XLSX.writeFile(wb, `maisvalias-tool-${year}.xlsx`);
  }

  function exportToIRS(year) {
    setIRSdialogVisible(true);
  }

  return (
    <div id={id} className={clsx(styles.container)}>
      <div className={clsx(styles.cardContainer)}>
        <div className={clsx(styles.card)}>
          <div className={clsx(styles.cardHeader)}>
            <div className={clsx(styles.cardTitle)}>
              <i className="fas fa-calendar-alt me-2"></i>
              <span>{year}</span>
            </div>
            <div className={clsx(styles.cardMenu)}>
              <div
                className={clsx(styles.cardMenuAction)}
                onClick={() => exportToExcel(year)}
              >
                <svg width="1rem" height="1rem" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.29289 1.29289C9.48043 1.10536 9.73478 1 10 1H18C19.6569 1 21 2.34315 21 4V9C21 9.55228 20.5523 10 20 10C19.4477 10 19 9.55228 19 9V4C19 3.44772 18.5523 3 18 3H11V8C11 8.55228 10.5523 9 10 9H5V20C5 20.5523 5.44772 21 6 21H7C7.55228 21 8 21.4477 8 22C8 22.5523 7.55228 23 7 23H6C4.34315 23 3 21.6569 3 20V8C3 7.73478 3.10536 7.48043 3.29289 7.29289L9.29289 1.29289ZM6.41421 7H9V4.41421L6.41421 7ZM19 12C19.5523 12 20 12.4477 20 13V19H23C23.5523 19 24 19.4477 24 20C24 20.5523 23.5523 21 23 21H19C18.4477 21 18 20.5523 18 20V13C18 12.4477 18.4477 12 19 12ZM11.8137 12.4188C11.4927 11.9693 10.8682 11.8653 10.4188 12.1863C9.96935 12.5073 9.86526 13.1318 10.1863 13.5812L12.2711 16.5L10.1863 19.4188C9.86526 19.8682 9.96935 20.4927 10.4188 20.8137C10.8682 21.1347 11.4927 21.0307 11.8137 20.5812L13.5 18.2205L15.1863 20.5812C15.5073 21.0307 16.1318 21.1347 16.5812 20.8137C17.0307 20.4927 17.1347 19.8682 16.8137 19.4188L14.7289 16.5L16.8137 13.5812C17.1347 13.1318 17.0307 12.5073 16.5812 12.1863C16.1318 11.8653 15.5073 11.9693 15.1863 12.4188L13.5 14.7795L11.8137 12.4188Z"
                  />
                </svg>
                <span className={clsx(styles.cardMenuActionText)}>
                  Exportar Excel
                </span>
              </div>
              <div
                className={clsx(styles.cardMenuAction)}
                onClick={() => exportToIRS(year)}
              >
                <svg width="1rem" height="1rem" viewBox="0 0 24 24">
                  <text x="0" y="18">
                    IRS
                  </text>
                </svg>
                <span className={clsx(styles.cardMenuActionText)}>
                  Preencher declaração
                </span>
              </div>
            </div>
          </div>
          <div className={clsx(styles.cardBody)}>
            <div className={clsx(styles.summaryContainer)}>
              <div className={clsx(styles.summaryCardContainer)}>
                <div className={clsx(styles.summaryCard)}>
                  <div
                    className={clsx(styles.summaryCardBody, styles.textCenter)}
                  >
                    <span className={clsx(styles.textSuccess)}>Ganhos</span>
                    <h4 className={clsx(styles.textSuccess)}>
                      {fiscalData.byYear[year].summary.gains}€
                    </h4>
                  </div>
                </div>
              </div>
              <div className={clsx(styles.summaryCardContainer)}>
                <div className={clsx(styles.summaryCard)}>
                  <div
                    className={clsx(styles.summaryCardBody, styles.textCenter)}
                  >
                    <span className={clsx(styles.textDanger)}>Perdas</span>
                    <h4 className={clsx(styles.textDanger)}>
                      {fiscalData.byYear[year].summary.losses}€
                    </h4>
                  </div>
                </div>
              </div>

              <div className={clsx(styles.summaryCardContainer)}>
                <div className={clsx(styles.summaryCard)}>
                  <div
                    className={clsx(styles.summaryCardBody, styles.textCenter)}
                  >
                    <span className={clsx(styles.textWarning)}>Dividendos</span>

                    <h4 className={clsx(styles.textWarning)}>
                      {fiscalData.byYear[year].summary.dividends}€
                    </h4>
                  </div>
                </div>
              </div>

              <div className={clsx(styles.summaryCardContainer)}>
                <div className={clsx(styles.summaryCard)}>
                  <div
                    className={clsx(styles.summaryCardBody, styles.textCenter)}
                  >
                    <span className={clsx(styles.textDanger)}>Despesas</span>

                    <h4 className={clsx(styles.textDanger)}>
                      {fiscalData.byYear[year].summary.fees +
                        fiscalData.byYear[year].summary.taxes}
                      €
                    </h4>
                  </div>
                </div>
              </div>

              <div className={clsx(styles.summaryCardContainer)}>
                <div className={clsx(styles.summaryCard)}>
                  <div
                    className={clsx(styles.summaryCardBody, styles.textCenter)}
                  >
                    <span className={clsx(styles.textPrimary)}>Balanço</span>
                    <h4 className={clsx(styles.textPrimary)}>
                      {Math.round(
                        (fiscalData.byYear[year].summary.gains +
                          fiscalData.byYear[year].summary.dividends -
                          fiscalData.byYear[year].summary.losses -
                          fiscalData.byYear[year].summary.fees -
                          fiscalData.byYear[year].summary.taxes) *
                          100
                      ) / 100}
                      €
                    </h4>
                  </div>
                </div>
              </div>
            </div>
            <div className={clsx(styles.tabsContainer)}>
              <div
                onClick={() => changeTab(0)}
                className={clsx(
                  styles.tab,
                  activeTab === 0
                    ? clsx(styles.tabActive)
                    : ""
                )}
              >
                <div className={clsx(styles.tabBody, styles.textCenter)}>
                  <i
                    className={clsx(styles.tabIcon, "fa-solid fa-chart-line")}
                  ></i>
                  <span className={clsx(styles.tabTitle)}>Mais valias</span>
                </div>
              </div>
              <div
                onClick={() => changeTab(1)}
                className={clsx(
                  styles.tab,
                  activeTab === 1
                    ? clsx(styles.tabActive)
                    : ""
                )}
              >
                <div className={clsx(styles.tabBody, styles.textCenter)}>
                  <i className={clsx(styles.tabIcon, "fa-solid fa-coins")}></i>
                  <span className={clsx(styles.tabTitle)}>Dividendos</span>
                </div>
              </div>
              <div
                onClick={() => changeTab(2)}
                className={clsx(
                  styles.tab,
                  activeTab === 2
                    ? clsx(styles.tabActive)
                    : ""
                )}
              >
                <div className={clsx(styles.tabBody, styles.textCenter)}>
                  <i className={clsx(styles.tabIcon, "fa-solid fa-landmark")}></i>
                  <span className={clsx(styles.tabTitle)}>IRS</span>
                </div>
              </div>
            </div>
            {activeTab === 2 && (
              <div className={clsx(styles.tableMenu)}>
              {/* <div
                className={clsx(styles.cardMenuAction)}
                onClick={() => exportToExcel(year)}
              >
                <svg width="1rem" height="1rem" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.29289 1.29289C9.48043 1.10536 9.73478 1 10 1H18C19.6569 1 21 2.34315 21 4V9C21 9.55228 20.5523 10 20 10C19.4477 10 19 9.55228 19 9V4C19 3.44772 18.5523 3 18 3H11V8C11 8.55228 10.5523 9 10 9H5V20C5 20.5523 5.44772 21 6 21H7C7.55228 21 8 21.4477 8 22C8 22.5523 7.55228 23 7 23H6C4.34315 23 3 21.6569 3 20V8C3 7.73478 3.10536 7.48043 3.29289 7.29289L9.29289 1.29289ZM6.41421 7H9V4.41421L6.41421 7ZM19 12C19.5523 12 20 12.4477 20 13V19H23C23.5523 19 24 19.4477 24 20C24 20.5523 23.5523 21 23 21H19C18.4477 21 18 20.5523 18 20V13C18 12.4477 18.4477 12 19 12ZM11.8137 12.4188C11.4927 11.9693 10.8682 11.8653 10.4188 12.1863C9.96935 12.5073 9.86526 13.1318 10.1863 13.5812L12.2711 16.5L10.1863 19.4188C9.86526 19.8682 9.96935 20.4927 10.4188 20.8137C10.8682 21.1347 11.4927 21.0307 11.8137 20.5812L13.5 18.2205L15.1863 20.5812C15.5073 21.0307 16.1318 21.1347 16.5812 20.8137C17.0307 20.4927 17.1347 19.8682 16.8137 19.4188L14.7289 16.5L16.8137 13.5812C17.1347 13.1318 17.0307 12.5073 16.5812 12.1863C16.1318 11.8653 15.5073 11.9693 15.1863 12.4188L13.5 14.7795L11.8137 12.4188Z"
                  />
                </svg>
                <span className={clsx(styles.cardMenuActionText)}>
                  Exportar Excel
                </span>
              </div>
              <div
                className={clsx(styles.cardMenuAction)}
                onClick={() => exportToIRS(year)}
              >
                <svg width="1rem" height="1rem" viewBox="0 0 24 24">
                  <text x="0" y="18">
                    IRS
                  </text>
                </svg>
                <span className={clsx(styles.cardMenuActionText)}>
                  Preencher declaração
                </span>
              </div> */}
            </div>
            )}
            
            {activeTab === 0 && tableMenuActiveTab === 0 && (
              <UserCapitalGainsTable fiscalData={fiscalData} year={year} />
            )}
            {/* {activeTab === 0 && tableMenuActiveTab === 1 && (
              <IRSCapitalGainsTable fiscalData={fiscalData} year={year} />
            )} */}
            {activeTab === 1 && tableMenuActiveTab === 0 && (
              <UserDividendsTable fiscalData={fiscalData} year={year} />
            )}
            {/* {activeTab === 1 && tableMenuActiveTab === 1 && (
              <IRSDividendsTable fiscalData={fiscalData} year={year} />
            )} */}
            {activeTab === 2 && (
              <IRSSection fiscalData={fiscalData} year={year} />
            )}


          </div>
        </div>
      </div>
      <DialogIRSDeclaration
        visible={IRSdialogVisible}
        setVisible={setIRSdialogVisible}
        fiscalData={fiscalData}
        year={year}
      />
    </div>
  );
}
