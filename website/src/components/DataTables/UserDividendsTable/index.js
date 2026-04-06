import { useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

export default function UserDividendsTable({ id, year, fiscalData }) {
  const defaultDividendsSortConfig = {
    column: 1,
    order: "desc",
  };

  const [sortDividendsConfig, setDividendsSortConfig] = useState(
    defaultDividendsSortConfig
  );
  const [tableMenuActiveTab, setTableMenuActiveTab] = useState(0);

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
    setDividendsSortConfig(defaultDividendsSortConfig);
  }

  const handleDividendsSort = (columnIndex) => {
    setDividendsSortConfig((prev) => {
      const isSameColumn = prev.column === columnIndex;
      const newOrder = isSameColumn && prev.order === "asc" ? "desc" : "asc";
      return { column: columnIndex, order: newOrder };
    });
  };

  const dividendsColumns = ["Símbolo", "Data", "Valor", "Despesas", "Balanço"];

  let dividendsBalance =
    Math.round(
      Object.entries(fiscalData.byYear[year].dividends.raw).reduce(
        (acc, [year, data]) => acc + (data.amount - data.fees - data.taxes),
        0
      ) * 100
    ) / 100;

  const sortedDividendsData = Object.entries(
    fiscalData.byYear[year].dividends.user
  ).sort((dividendA, dividendB) => {
    const { column, order } = sortDividendsConfig;
    if (column === null) return 0;

    const valuesA = [
      dividendA[1]["Simbolo"],
      dividendA[1]["Data"],
      dividendA[1]["Valor"],
      dividendA[1]["Despesas"],
      dividendA[1]["Balanço"],
    ];

    const valuesB = [
      dividendB[1]["Simbolo"],
      dividendB[1]["Data"],
      dividendB[1]["Valor"],
      dividendB[1]["Despesas"],
      dividendB[1]["Balanço"],
    ];

    const valA = valuesA[column];
    const valB = valuesB[column];

    if (typeof valA === "number" && typeof valB === "number") {
      return order === "asc" ? valA - valB : valB - valA;
    } else {
      return order === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    }
  });

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
    <div className={clsx(styles.tableResponsive)}>
      <table className={clsx(styles.table, styles.tableHover)}>
        <thead>
          <tr>
            {dividendsColumns.map((label, index) => (
              <th
                key={index}
                onClick={() => handleDividendsSort(index)}
                className={clsx(styles.textEnd, styles.clickable)}
              >
                {label}
                {sortDividendsConfig.column === index && (
                  <span>
                    {sortDividendsConfig.order === "asc" ? " 🔼" : " 🔽"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedDividendsData.map(([year, data], index) => {
            return (
              <tr key={index}>
                <td className={clsx(styles.textEnd)}>
                  <strong>{data["Simbolo"]}</strong>
                </td>
                <td className={clsx(styles.textEnd)}>{data["Data"]}</td>
                <td className={clsx(styles.textEnd)}>
                  <div className="tooltipContainer">
                    <span>{data["Valor"]}€</span>
                    {data["Moeda Original"] !== "EUR" && (
                      <i className="fa-solid fa-circle-info tooltip">
                        <div className="tooltipContent">
                          <div>
                            Moeda original:{" "}
                            <strong>{data["Moeda Original"]}</strong>
                          </div>
                          <div>
                            Taxa de câmbio:{" "}
                            <strong>{data["Taxa de Câmbio"]}</strong>
                          </div>
                        </div>
                      </i>
                    )}
                  </div>
                </td>
                <td className={clsx(styles.textEnd)}>
                  {data["Despesas"] === 0 ? "-" : data["Despesas"] + "€"}
                </td>
                <td
                  className={
                    data["Balanço"] > 0
                      ? clsx(styles.textEnd, styles.textSuccess)
                      : data["Balanço"] < 0
                      ? clsx(styles.textEnd, styles.textDanger)
                      : clsx(styles.textEnd, styles.textWarning)
                  }
                >
                  <strong>{data["Balanço"]}€</strong>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          {fiscalData.byYear[year].dividends.raw.length > 0 && (
            <tr>
              <th className={clsx(styles.textBegin)} colSpan={2}>
                <strong>Total:</strong>
              </th>
              <th className={clsx(styles.textEnd)}>
                {Math.round(
                  Object.entries(fiscalData.byYear[year].dividends.raw).reduce(
                    (acc, [year, data]) => acc + data.amount,
                    0
                  ) * 100
                ) / 100}
                €
              </th>
              <th className={clsx(styles.textEnd)}>
                {Math.round(
                  Object.entries(fiscalData.byYear[year].dividends.raw).reduce(
                    (acc, [year, data]) => acc + data.fees + data.taxes,
                    0
                  ) * 100
                ) / 100}
                €
              </th>
              <th
                className={
                  dividendsBalance > 0
                    ? clsx(styles.textEnd, styles.textSuccess)
                    : dividendsBalance < 0
                    ? clsx(styles.textEnd, styles.textDanger)
                    : clsx(styles.textEnd, styles.textWarning)
                }
              >
                <strong>{dividendsBalance}€</strong>
              </th>
            </tr>
          )}
        </tfoot>
      </table>
      {fiscalData.byYear[year].dividends.raw.length === 0 && (
        <p className={clsx(styles.textCenter, styles.textMuted)}>
          Nenhum dado disponível para exibir
        </p>
      )}
    </div>
  );
}
