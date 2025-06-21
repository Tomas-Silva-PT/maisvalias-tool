import { useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

export default function IRSCapitalGainsTable({ id, year, fiscalData }) {
  const defaultSortConfig = {
    column: null,
    order: "asc",
  };
  const [sortConfig, setSortConfig] = useState(defaultSortConfig);

  const handleSort = (columnIndex) => {
    setSortConfig((prev) => {
      const isSameColumn = prev.column === columnIndex;
      const newOrder = isSameColumn && prev.order === "asc" ? "desc" : "asc";
      return { column: columnIndex, order: newOrder };
    });
  };

  const capitalGainsIRSColumns = [
    "Símbolo",
    "País da fonte",
    "Código",
    "Ano de Aquisição",
    "Mês de Aquisição",
    "Dia de Aquisição",
    "Valor de Aquisição",
    "Ano de Realização",
    "Mês de Realização",
    "Dia de Realização",
    "Valor de Realização",
    "Despesas e Encargos",
    "Imposto retido no estrangeiro",
    "País da Contraparte",
  ];

  const sortedIRSCapitalGainsData = Object.entries(
    fiscalData.byYear[year].capitalGains.irs
  ).sort((capitalGainA, capitalGainB) => {
    const { column, order } = sortConfig;
    if (column === null) return 0;

    const valuesA = [
      capitalGainA[1]["Ticker"],
      capitalGainA[1]["País da fonte"],
      capitalGainA[1]["Código"],
      capitalGainA[1]["Ano de Aquisição"],
      capitalGainA[1]["Mês de Aquisição"],
      capitalGainA[1]["Dia de Aquisição"],
      capitalGainA[1]["Valor de Aquisição"],
      capitalGainA[1]["Ano de Realização"],
      capitalGainA[1]["Mês de Realização"],
      capitalGainA[1]["Dia de Realização"],
      capitalGainA[1]["Valor de Realização"],
      capitalGainA[1]["Despesas e Encargos"],
      capitalGainA[1]["Imposto retido no estrangeiro"],
      capitalGainA[1]["País da Contraparte"],
    ];

    const valuesB = [
      capitalGainB[1]["Ticker"],
      capitalGainB[1]["País da fonte"],
      capitalGainB[1]["Código"],
      capitalGainB[1]["Ano de Aquisição"],
      capitalGainB[1]["Mês de Aquisição"],
      capitalGainB[1]["Dia de Aquisição"],
      capitalGainB[1]["Valor de Aquisição"],
      capitalGainB[1]["Ano de Realização"],
      capitalGainB[1]["Mês de Realização"],
      capitalGainB[1]["Dia de Realização"],
      capitalGainB[1]["Valor de Realização"],
      capitalGainB[1]["Despesas e Encargos"],
      capitalGainB[1]["Imposto retido no estrangeiro"],
      capitalGainB[1]["País da Contraparte"],
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
            {capitalGainsIRSColumns.map((label, index) => (
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
          {sortedIRSCapitalGainsData.map(([year, data], index) => {
            let capitalGains =
              fiscalData.byYear[data["Ano de Realização"]].capitalGains.raw;
            let isPortugueseCountry =
              capitalGains.find(
                (item) => item.sell.asset.ticker === data["Ticker"]
              ).sell.asset.countryDomiciled.alpha2 === "PT";
            return (
              <tr key={index}>
                <td className={clsx(styles.textEnd)}>
                  <strong>{data["Ticker"]}</strong>
                </td>
                <td className={clsx(styles.textEnd)}>
                  <div className="tooltipContainer">
                    <span>{data["País da fonte"]}</span>
                    {!data["País da fonte"] && (
                      <i className="fa-solid fa-triangle-exclamation tooltip">
                        <div className="tooltipContent">
                          <div>
                            Não encontrámos o país para o ISIN:{" "}
                            <strong>
                              {
                                capitalGains.find(
                                  (item) =>
                                    item.sell.asset.ticker === data["Ticker"]
                                ).sell.asset.isin
                              }
                            </strong>
                          </div>
                        </div>
                      </i>
                    )}

                    {isPortugueseCountry && (
                      <i className="fa-solid fa-circle-info tooltip">
                        <div className="tooltipContent">
                          <div>
                            Para empresas domiciliadas em Portugal obtidas em
                            corretoras estrangeiras, assume-se o{" "}
                            <u>país de domicilio da corretora</u>.
                          </div>
                        </div>
                      </i>
                    )}
                  </div>
                </td>
                <td className={clsx(styles.textEnd)}>
                  <span>{data["Código"]}</span>
                </td>
                <td className={clsx(styles.textEnd)}>
                  <span>{data["Ano de Aquisição"]}</span>
                </td>
                <td className={clsx(styles.textEnd)}>
                  <span>{data["Mês de Aquisição"]}</span>
                </td>
                <td className={clsx(styles.textEnd)}>
                  <span>{data["Dia de Aquisição"]}</span>
                </td>
                <td className={clsx(styles.textEnd)}>
                  <div className="tooltipContainer">
                    <span>
                      {Math.round(data["Valor de Aquisição"] * 100) / 100}€
                    </span>
                    {data.transaction.buy.netAmountCurrency !== "EUR" && (
                      <i className="fa-solid fa-circle-info tooltip">
                        <div className="tooltipContent">
                          <div>
                            Moeda original:{" "}
                            <strong>
                              {data.transaction.buy.netAmountCurrency}
                            </strong>
                          </div>
                          <div>
                            Taxa de câmbio:{" "}
                            <strong>
                              {Math.round(
                                data.transaction.buy.exchangeRate * 1000
                              ) / 1000}
                            </strong>
                          </div>
                        </div>
                      </i>
                    )}
                  </div>
                </td>
                <td className={clsx(styles.textEnd)}>
                  <span>{data["Ano de Realização"]}</span>
                </td>
                <td className={clsx(styles.textEnd)}>
                  <span>{data["Mês de Realização"]}</span>
                </td>
                <td className={clsx(styles.textEnd)}>
                  <span>{data["Dia de Realização"]}</span>
                </td>
                <td className={clsx(styles.textEnd)}>
                  <div className="tooltipContainer">
                    <span>
                      {Math.round(data["Valor de Realização"] * 100) / 100}€
                    </span>
                    {data.transaction.buy.netAmountCurrency !== "EUR" && (
                      <i className="fa-solid fa-circle-info tooltip">
                        <div className="tooltipContent">
                          <div>
                            Moeda original:{" "}
                            <strong>
                              {data.transaction.sell.netAmountCurrency}
                            </strong>
                          </div>
                          <div>
                            Taxa de câmbio:{" "}
                            <strong>
                              {Math.round(
                                data.transaction.sell.exchangeRate * 1000
                              ) / 1000}
                            </strong>
                          </div>
                        </div>
                      </i>
                    )}
                  </div>
                </td>
                <td className={clsx(styles.textEnd)}>
                  {Math.round(data["Despesas e Encargos"] * 100) / 100 === 0
                    ? "-"
                    : Math.round(data["Despesas e Encargos"] * 100) / 100 + "€"}
                </td>
                <td className={clsx(styles.textEnd)}>
                  {Math.round(data["Imposto retido no estrangeiro"] * 100) /
                    100 ===
                  0
                    ? "-"
                    : Math.round(data["Imposto retido no estrangeiro"] * 100) /
                        100 +
                      "€"}
                </td>
                <td className={clsx(styles.textEnd)}>
                  <span>{data["País da Contraparte"]}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {fiscalData.byYear[year].capitalGains.raw.length === 0 && (
        <p className={clsx(styles.textCenter, styles.textMuted)}>
          Nenhum dado disponível para exibir
        </p>
      )}
    </div>
  );
}
