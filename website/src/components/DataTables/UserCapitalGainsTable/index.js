import { useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
export default function UserCapitalGainsTable({ id, year, fiscalData }) {
  const defaultCapitalGainsSortConfig = {
    column: 4,
    order: "desc",
  };
  const defaultSortConfig = {
    column: null,
    order: "asc",
  };
  const [sortCapitalGainsConfig, setCapitalGainsSortConfig] = useState(
    defaultCapitalGainsSortConfig
  );
  const [sortConfig, setSortConfig] = useState(defaultSortConfig);
  const [activeTab, setActiveTab] = useState(0);

  const handleCapitalGainsSort = (columnIndex) => {
    setCapitalGainsSortConfig((prev) => {
      const isSameColumn = prev.column === columnIndex;
      const newOrder = isSameColumn && prev.order === "asc" ? "desc" : "asc";
      return { column: columnIndex, order: newOrder };
    });
  };

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

  const capitalGainsColumns = [
    "Símbolo",
    "Data compra",
    "Valor de compra",
    "Encargos da compra",
    "Data venda",
    "Valor de venda",
    "Encargos da venda",
    "Balanço",
  ];

  let capitalGainsBalance =
    Math.round(
      Object.entries(fiscalData.byYear[year].capitalGains.raw).reduce(
        (acc, [year, data]) =>
          acc +
          (data.realizedValue - data.acquiredValue) -
          (data.buyFees + data.buyTaxes + data.sellFees + data.sellTaxes),
        0
      ) * 100
    ) / 100;

  const sortedCapitalGainsData = Object.entries(
    fiscalData.byYear[year].capitalGains.user
  ).sort((capitalGainA, capitalGainB) => {
    const { column, order } = sortCapitalGainsConfig;
    if (column === null) return 0;

    const valuesA = [
      capitalGainA[1]["Ticker"],
      capitalGainA[1]["Aquisição"]["Data"],
      capitalGainA[1]["Aquisição"]["Valor"],
      capitalGainA[1]["Aquisição"]["Despesas"],
      capitalGainA[1]["Realização"]["Data"],
      capitalGainA[1]["Realização"]["Valor"],
      capitalGainA[1]["Realização"]["Despesas"],
      capitalGainA[1]["Balanço"],
    ];

    const valuesB = [
      capitalGainB[1]["Ticker"],
      capitalGainB[1]["Aquisição"]["Data"],
      capitalGainB[1]["Aquisição"]["Valor"],
      capitalGainB[1]["Aquisição"]["Despesas"],
      capitalGainB[1]["Realização"]["Data"],
      capitalGainB[1]["Realização"]["Valor"],
      capitalGainB[1]["Realização"]["Despesas"],
      capitalGainB[1]["Balanço"],
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

  return (
    <div className={clsx(styles.tableResponsive)}>
      <table className={clsx(styles.table, styles.tableHover)}>
        <thead>
          <tr>
            {capitalGainsColumns.map((label, index) => (
              <th
                key={index}
                onClick={() => handleCapitalGainsSort(index)}
                className={clsx(styles.textEnd, styles.clickable)}
              >
                {label}
                {sortCapitalGainsConfig.column === index && (
                  <span>
                    {sortCapitalGainsConfig.order === "asc" ? " 🔼" : " 🔽"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedCapitalGainsData.map(([year, data], index) => {
            return (
              <tr className={clsx(styles.textEnd)} key={index}>
                <td className={clsx(styles.textEnd)}>
                  <strong>{data["Ticker"]}</strong>
                </td>
                <td className={clsx(styles.textEnd)}>
                  {data["Aquisição"]["Data"]}
                </td>
                <td className={clsx(styles.textEnd)}>
                  <div className="tooltipContainer">
                    {data["Aquisição"]["Valor"]}€
                    {data["Aquisição"]["Moeda Original"] !== "EUR" && (
                      <i className="fa-solid fa-circle-info tooltip">
                        <div className="tooltipContent">
                          <div>
                            Moeda original:{" "}
                            <strong>
                              {data["Aquisição"]["Moeda Original"]}
                            </strong>
                          </div>
                          <div>
                            Taxa de câmbio:{" "}
                            <strong>
                              {data["Aquisição"]["Taxa de Câmbio"]}
                            </strong>
                          </div>
                        </div>
                      </i>
                    )}
                  </div>
                </td>
                <td className={clsx(styles.textEnd)}>
                  {data["Aquisição"]["Despesas"] === 0
                    ? "-"
                    : data["Aquisição"]["Despesas"] + "€"}
                </td>
                <td className={clsx(styles.textEnd)}>
                  {data["Realização"]["Data"]}
                </td>
                <td className={clsx(styles.textEnd)}>
                  <div className="tooltipContainer">
                    {data["Realização"]["Valor"]}€
                    {data["Realização"]["Moeda Original"] !== "EUR" && (
                      <i className="fa-solid fa-circle-info tooltip">
                        <div className="tooltipContent">
                          <div>
                            Moeda original:{" "}
                            <strong>
                              {data["Realização"]["Moeda Original"]}
                            </strong>
                          </div>
                          <div>
                            Taxa de câmbio:{" "}
                            <strong>
                              {data["Realização"]["Taxa de Câmbio"]}
                            </strong>
                          </div>
                        </div>
                      </i>
                    )}
                  </div>
                </td>
                <td className={clsx(styles.textEnd)}>
                  {data["Realização"]["Despesas"] === 0
                    ? "-"
                    : data["Realização"]["Despesas"] + "€"}
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
          {fiscalData.byYear[year].capitalGains.raw.length > 0 && (
            <tr>
              <th className={clsx(styles.textBegin)} colSpan={2}>
                <strong>Total:</strong>
              </th>
              <th className={clsx(styles.textEnd)}>
                {Object.entries(
                  fiscalData.byYear[year].capitalGains.raw
                ).reduce((acc, [year, data]) => acc + data.acquiredValue, 0)}
                €
              </th>
              <th className={clsx(styles.textEnd)}>
                {Math.round(
                  Object.entries(
                    fiscalData.byYear[year].capitalGains.raw
                  ).reduce(
                    (acc, [year, data]) => acc + data.buyFees + data.buyTaxes,
                    0
                  ) * 100
                ) /
                  100 ===
                0
                  ? "-"
                  : Math.round(
                      Object.entries(
                        fiscalData.byYear[year].capitalGains.raw
                      ).reduce(
                        (acc, [year, data]) =>
                          acc + data.buyFees + data.buyTaxes,
                        0
                      ) * 100
                    ) /
                      100 +
                    "€"}
              </th>
              <th></th>
              <th className={clsx(styles.textEnd)}>
                {Object.entries(
                  fiscalData.byYear[year].capitalGains.raw
                ).reduce((acc, [year, data]) => acc + data.realizedValue, 0)}
                €
              </th>
              <th className={clsx(styles.textEnd)}>
                {Math.round(
                  Object.entries(
                    fiscalData.byYear[year].capitalGains.raw
                  ).reduce(
                    (acc, [year, data]) => acc + data.sellFees + data.sellTaxes,
                    0
                  ) * 100
                ) /
                  100 ===
                0
                  ? "-"
                  : Math.round(
                      Object.entries(
                        fiscalData.byYear[year].capitalGains.raw
                      ).reduce(
                        (acc, [year, data]) =>
                          acc + data.sellFees + data.sellTaxes,
                        0
                      ) * 100
                    ) /
                      100 +
                    "€"}
              </th>
              <th
                className={
                  capitalGainsBalance > 0
                    ? clsx(styles.textEnd, styles.textSuccess)
                    : capitalGainsBalance < 0
                    ? clsx(styles.textEnd, styles.textDanger)
                    : clsx(styles.textEnd, styles.textWarning)
                }
              >
                <strong>{capitalGainsBalance}€</strong>
              </th>
            </tr>
          )}
        </tfoot>
      </table>
      {fiscalData.byYear[year].capitalGains.raw.length === 0 && (
        <p className={clsx(styles.textCenter, styles.textMuted)}>
          Nenhum dado disponível para exibir
        </p>
      )}
    </div>
  );
}
