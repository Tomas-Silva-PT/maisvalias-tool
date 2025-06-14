import { useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

export default function FiscalYearsSummary({ setFiscalYear, fiscalData }) {
  const [sortConfig, setSortConfig] = useState({
    column: null,
    order: "asc",
  });

  const handleSort = (columnIndex) => {
    setSortConfig((prev) => {
      const isSameColumn = prev.column === columnIndex;
      const newOrder = isSameColumn && prev.order === "asc" ? "desc" : "asc";
      return { column: columnIndex, order: newOrder };
    });
  };

  const sortedData = Object.entries(fiscalData.byYear).sort(
    ([yearA, dataA], [yearB, dataB]) => {
      const { column, order } = sortConfig;
      if (column === null) return 0;

      const valuesA = [
        yearA,
        dataA.summary.numTransactions,
        dataA.summary.gains,
        dataA.summary.losses,
        dataA.summary.dividends,
        dataA.summary.fees + dataA.summary.taxes,
        dataA.summary.gains - dataA.summary.losses,
      ];

      const valuesB = [
        yearB,
        dataB.summary.numTransactions,
        dataB.summary.gains,
        dataB.summary.losses,
        dataB.summary.dividends,
        dataB.summary.fees + dataB.summary.taxes,
        dataB.summary.gains - dataB.summary.losses,
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
    }
  );

  return (
    <div className={clsx(styles.container)}>
      <div className={clsx(styles.cardContainer)}>
        <div className={clsx(styles.card)}>
          <div className={clsx(styles.cardHeader)}>
            <i className="fas fa-calendar-alt me-2"></i>
            <span>Resumo por Ano Fiscal</span>
          </div>
          <div className={clsx(styles.cardBody)}>
            <div className={clsx(styles.tableResponsive)}>
              <table className={clsx(styles.table, styles.tableHover)}>
                <thead>
                  <tr>
                    {[
                      "Ano",
                      "Nº Transações",
                      "Ganhos",
                      "Perdas",
                      "Dividendos",
                      "Despesas",
                      "Balanço",
                    ].map((label, index) => (
                      <th
                        key={index}
                        onClick={() => handleSort(index)}
                        className={clsx(styles.textEnd)}
                      >
                        {label}
                        {sortConfig.column === index && (
                          <span>
                            {sortConfig.order === "asc" ? " 🔼" : " 🔽"}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map(([year, data]) => {
                    let balance =
                      Math.round(
                        (data.summary.gains +
                          data.summary.dividends -
                          data.summary.losses -
                          data.summary.fees -
                          data.summary.taxes) *
                          100
                      ) / 100;

                    return (
                      <tr key={year} onClick={() => setFiscalYear(year)}>
                        <td className={clsx(styles.textEnd)}>
                          <strong>{year}</strong>
                        </td>
                        <td className={clsx(styles.textEnd)}>
                          <strong>{data.summary.numTransactions}</strong>
                        </td>
                        <td
                          className={clsx(styles.textEnd, styles.textSuccess)}
                        >
                          {data.summary.gains}€
                        </td>
                        <td className={clsx(styles.textEnd, styles.textDanger)}>
                          {data.summary.losses}€
                        </td>
                        <td
                          className={clsx(styles.textEnd, styles.textWarning)}
                        >
                          {data.summary.dividends}€
                        </td>

                        <td className={clsx(styles.textEnd, styles.textDanger)}>
                          {Math.round((data.summary.taxes + data.summary.fees) * 100) / 100}€
                        </td>
                        <td
                          className={clsx(styles.textEnd, styles.textPrimary)}
                        >
                          {balance}€
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {fiscalData.summary.numTransactions === 0 && (
              <p className={clsx(styles.textCenter, styles.textMuted)}>
                Nenhum dado disponível para exibir
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
