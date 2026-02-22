import { useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

export default function UserInterestGainsTable({ id, year, fiscalData }) {
  const defaultInterestGainsSortConfig = {
    column: 1,
    order: "desc",
  };

  const [sortInterestGainsConfig, setInterestGainsSortConfig] = useState(
    defaultInterestGainsSortConfig
  );

  function smoothFocus(element) {
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });

    // Delay focus slightly to let scroll animation begin
    setTimeout(() => {
      element.focus({ preventScroll: true });
    }, 300); // tweak delay if needed
  }

  const handleInterestGainsSort = (columnIndex) => {
    setInterestGainsSortConfig((prev) => {
      const isSameColumn = prev.column === columnIndex;
      const newOrder = isSameColumn && prev.order === "asc" ? "desc" : "asc";
      return { column: columnIndex, order: newOrder };
    });
  };

  const interestGainsColumns = ["Data", "Valor", "Despesas", "Balanço"];

  let interestGainsBalance =
    Math.round(
      Object.entries(fiscalData.byYear[year].interestGains.raw).reduce(
        (acc, [year, data]) => acc + (data.amount - data.fees - data.taxes),
        0
      ) * 100
    ) / 100;

  const sortedInterestGainsData = Object.entries(
    fiscalData.byYear[year].interestGains.user
  ).sort((interestGainA, interestGainB) => {
    const { column, order } = sortInterestGainsConfig;
    if (column === null) return 0;

    const valuesA = [
      interestGainA[1]["Ticker"],
      interestGainA[1]["Data"],
      interestGainA[1]["Valor"],
      interestGainA[1]["Despesas"],
      interestGainA[1]["Balanço"],
    ];

    const valuesB = [
      interestGainB[1]["Ticker"],
      interestGainB[1]["Data"],
      interestGainB[1]["Valor"],
      interestGainB[1]["Despesas"],
      interestGainB[1]["Balanço"],
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

  return (
    <div className={clsx(styles.tableResponsive)}>
      <table className={clsx(styles.table, styles.tableHover)}>
        <thead>
          <tr>
            {interestGainsColumns.map((label, index) => (
              <th
                key={index}
                onClick={() => handleInterestGainsSort(index)}
                className={clsx(styles.textEnd, styles.clickable)}
              >
                {label}
                {sortInterestGainsConfig.column === index && (
                  <span>
                    {sortInterestGainsConfig.order === "asc" ? " 🔼" : " 🔽"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedInterestGainsData.map(([year, data], index) => {
            return (
              <tr key={index}>
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
          {fiscalData.byYear[year].interestGains.raw.length > 0 && (
            <tr>
              <th className={clsx(styles.textBegin)} colSpan={1}>
                <strong>Total:</strong>
              </th>
              <th className={clsx(styles.textEnd)}>
                {Math.round(
                  Object.entries(fiscalData.byYear[year].interestGains.raw).reduce(
                    (acc, [year, data]) => acc + data.amount,
                    0
                  ) * 100
                ) / 100}
                €
              </th>
              <th className={clsx(styles.textEnd)}>
                {Math.round(
                  Object.entries(fiscalData.byYear[year].interestGains.raw).reduce(
                    (acc, [year, data]) => acc + data.fees + data.taxes,
                    0
                  ) * 100
                ) / 100}
                €
              </th>
              <th
                className={
                  interestGainsBalance > 0
                    ? clsx(styles.textEnd, styles.textSuccess)
                    : interestGainsBalance < 0
                    ? clsx(styles.textEnd, styles.textDanger)
                    : clsx(styles.textEnd, styles.textWarning)
                }
              >
                <strong>{interestGainsBalance}€</strong>
              </th>
            </tr>
          )}
        </tfoot>
      </table>
      {fiscalData.byYear[year].interestGains.raw.length === 0 && (
        <p className={clsx(styles.textCenter, styles.textMuted)}>
          Nenhum dado disponível para exibir
        </p>
      )}
    </div>
  );
}
