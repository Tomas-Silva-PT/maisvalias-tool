import { useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

export default function IRSDividendsTable({ id, year, fiscalData }) {
  const defaultSortConfig = {
    column: null,
    order: "asc",
  };

  const [sortConfig, setSortConfig] = useState(defaultSortConfig);

  const handleDividendsSort = (columnIndex) => {
    setDividendsSortConfig((prev) => {
      const isSameColumn = prev.column === columnIndex;
      const newOrder = isSameColumn && prev.order === "asc" ? "desc" : "asc";
      return { column: columnIndex, order: newOrder };
    });
  };

  const handleSort = (columnIndex) => {
    setSortConfig((prev) => {
      const isSameColumn = prev.column === columnIndex;
      const newOrder = isSameColumn && prev.order === "asc" ? "desc" : "asc";
      return { column: columnIndex, order: newOrder };
    });
  };

  const dividendsIRSColumns = [
    "Código Rendimento",
    "País da fonte",
    "Rendimento Bruto",
    "Imposto Pago no Estrangeiro - No país da fonte",
  ];

  const sortedIRSDividendsData = Object.entries(
    fiscalData.byYear[year].dividends.irs
  ).sort((dividendA, dividendB) => {
    const { column, order } = sortConfig;
    if (column === null) return 0;

    const valuesA = [
      dividendA[1]["Código Rendimento"],
      dividendA[1]["País da fonte"],
      dividendA[1]["Rendimento Bruto"],
      dividendA[1]["Imposto Pago no Estrangeiro - No país da fonte"],
    ];

    const valuesB = [
      dividendB[1]["Código Rendimento"],
      dividendB[1]["País da fonte"],
      dividendB[1]["Rendimento Bruto"],
      dividendB[1]["Imposto Pago no Estrangeiro - No país da fonte"],
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
            {dividendsIRSColumns.map((label, index) => (
              <th
                key={index}
                onClick={() => handleSort(index)}
                className={clsx(styles.textEnd, styles.clickable)}
              >
                {label}
                {sortConfig.column === index && (
                  <span>{sortConfig.order === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedIRSDividendsData.map(([year, data], index) => {
            return (
              <tr key={index}>
                <td className={clsx(styles.textEnd)}>
                  {data["Código Rendimento"]}
                </td>
                <td className={clsx(styles.textEnd)}>
                  <div className="tooltipContainer">
                    <span>{data["País da fonte"]}</span>
                    {!data["País da fonte"] && (
                      <i className="fa-solid fa-triangle-exclamation tooltip">
                        <div className="tooltipContent">
                          <div>
                            Não encontrámos o país de fonte. Verifica a consola
                            do navegador para mais detalhes.
                          </div>
                        </div>
                      </i>
                    )}
                  </div>
                </td>
                <td className={clsx(styles.textEnd)}>
                  {Math.round(data["Rendimento Bruto"] * 100) / 100 === 0
                    ? "-"
                    : Math.round(data["Rendimento Bruto"] * 100) / 100 + "€"}
                </td>
                <td className={clsx(styles.textEnd)}>
                  {Math.round(
                    data["Imposto Pago no Estrangeiro - No país da fonte"] * 100
                  ) /
                    100 ===
                  0
                    ? "-"
                    : Math.round(
                        data["Imposto Pago no Estrangeiro - No país da fonte"] *
                          100
                      ) /
                        100 +
                      "€"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {fiscalData.byYear[year].dividends.raw.length === 0 && (
        <p className={clsx(styles.textCenter, styles.textMuted)}>
          Nenhum dado disponível para exibir
        </p>
      )}
    </div>
  );
}
