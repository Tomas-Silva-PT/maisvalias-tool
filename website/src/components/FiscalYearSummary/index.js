import { useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import { ArrowRight, Upload, X } from "lucide-react";
import { PTIRSFormatter } from "../../maisvalias-tool/formatters/pt/irs/irs_xml_formatter.js";
import ErrorPopup from "@site/src/components/ErrorPopup";

export default function FiscalYearSummary({ year, fiscalData }) {
  const [sortConfig, setSortConfig] = useState({
    column: null,
    order: "asc",
  });
  const [activeTab, setActiveTab] = useState(0);
  const [tableMenuActiveTab, setTableMenuActiveTab] = useState(0);
  const [IRSdialogVisible, setIRSdialogVisible] = useState(false);

  function changeTab(tabIdx) {
    setActiveTab(tabIdx);
    setSortConfig({ column: null, order: "asc" });
  }

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

  const dividendsColumns = ["Símbolo", "Data", "Valor", "Despesas", "Balanço"];
  const dividendsIRSColumns = [
    "Ano rendimento",
    "Código Rendimento",
    "País da fonte",
    "Rendimento Bruto",
    "Imposto Pago no Estrangeiro - No país da fonte",
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

  let dividendsBalance =
    Math.round(
      Object.entries(fiscalData.byYear[year].dividends.raw).reduce(
        (acc, [year, data]) => acc + (data.amount - data.fees - data.taxes),
        0
      ) * 100
    ) / 100;

  const sortedCapitalGainsData = Object.entries(
    fiscalData.byYear[year].capitalGains.raw
  ).sort((capitalGainA, capitalGainB) => {
    const { column, order } = sortConfig;
    if (column === null) return 0;

    const valuesA = [
      capitalGainA[1].buy.asset.ticker,
      capitalGainA[1].buy.date,
      capitalGainA[1].realizedValue,
      capitalGainA[1].buyFees + capitalGainA[1].buyTaxes,
      capitalGainA[1].sell.date,
      capitalGainA[1].acquiredValue,
      capitalGainA[1].sellFees + capitalGainA[1].sellTaxes,
      capitalGainA[1].realizedValue -
        capitalGainA[1].acquiredValue -
        (capitalGainA[1].sellFees +
          capitalGainA[1].buyFees +
          capitalGainA[1].sellTaxes +
          capitalGainA[1].buyTaxes),
    ];

    const valuesB = [
      capitalGainB[1].buy.asset.ticker,
      capitalGainB[1].buy.date,
      capitalGainB[1].realizedValue,
      capitalGainB[1].buyFees + capitalGainB[1].buyTaxes,
      capitalGainB[1].sell.date,
      capitalGainB[1].acquiredValue,
      capitalGainB[1].sellFees + capitalGainB[1].sellTaxes,
      capitalGainB[1].realizedValue -
        capitalGainB[1].acquiredValue -
        (capitalGainB[1].sellFees +
          capitalGainB[1].buyFees +
          capitalGainB[1].sellTaxes +
          capitalGainB[1].buyTaxes),
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

  function capitalGainsTable() {
    return (
      <div className={clsx(styles.tableResponsive)}>
        <table className={clsx(styles.table, styles.tableHover)}>
          <thead>
            <tr>
              <td
                className={clsx(styles.textBegin)}
                colSpan={capitalGainsColumns.length}
              >
                <div className={clsx(styles.tableMenu)}>
                  <div
                    onClick={() => setTableMenuActiveTab(0)}
                    className={
                      tableMenuActiveTab === 0 &&
                      clsx(styles.tableMenuActionActive)
                    }
                  >
                    <i
                      style={{ width: "100%", textAlign: "center" }}
                      class="fa-solid fa-user"
                    ></i>
                  </div>
                  <div
                    onClick={() => setTableMenuActiveTab(1)}
                    className={
                      tableMenuActiveTab === 1 &&
                      clsx(styles.tableMenuActionActive)
                    }
                  >
                    <svg width="2rem" height="2rem" viewBox="0 0 24 24">
                      <text x="0" y="18">
                        IRS
                      </text>
                    </svg>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              {capitalGainsColumns.map((label, index) => (
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
            {sortedCapitalGainsData.map(([year, data], index) => {
              let balance =
                Math.round(
                  (data.realizedValue -
                    data.acquiredValue -
                    data.buyFees -
                    data.buyTaxes -
                    data.sellFees -
                    data.sellTaxes) *
                    100
                ) / 100;

              return (
                <tr className={clsx(styles.textEnd)} key={index}>
                  <td className={clsx(styles.textEnd)}>
                    <strong>{data.buy.asset.ticker}</strong>
                  </td>
                  <td className={clsx(styles.textEnd)}>{data.buy.date}</td>
                  <td className={clsx(styles.textEnd, "tooltipContainer")}>
                    {data.acquiredValue}€
                    {data.buy.netAmountCurrency !== "EUR" && (
                      <i class="fa-solid fa-circle-info tooltip">
                        <div className="tooltipContent">
                          <div>
                            Moeda original:{" "}
                            <strong>{data.buy.netAmountCurrency}</strong>
                          </div>
                          <div>
                            Taxa de câmbio:{" "}
                            <strong>
                              {Math.round(data.buy.exchangeRate * 1000) / 1000}
                            </strong>
                          </div>
                        </div>
                      </i>
                    )}
                  </td>
                  <td className={clsx(styles.textEnd)}>
                    {Math.round((data.buyFees + data.buyTaxes) * 100) / 100 ===
                    0
                      ? "-"
                      : Math.round((data.buyFees + data.buyTaxes) * 100) / 100 +
                        "€"}
                  </td>
                  <td className={clsx(styles.textEnd)}>{data.sell.date}</td>
                  <td className={clsx(styles.textEnd, "tooltipContainer")}>
                    {data.realizedValue}€
                    {data.sell.netAmountCurrency !== "EUR" && (
                      <i class="fa-solid fa-circle-info tooltip">
                        <div className="tooltipContent">
                          <div>
                            Moeda original:{" "}
                            <strong>{data.sell.netAmountCurrency}</strong>
                          </div>
                          <div>
                            Taxa de câmbio:{" "}
                            <strong>
                              {Math.round(data.sell.exchangeRate * 1000) / 1000}
                            </strong>
                          </div>
                        </div>
                      </i>
                    )}
                  </td>
                  <td className={clsx(styles.textEnd)}>
                    {Math.round((data.sellFees + data.sellTaxes) * 100) /
                      100 ===
                    0
                      ? "-"
                      : Math.round((data.sellFees + data.sellTaxes) * 100) /
                          100 +
                        "€"}
                  </td>
                  <td
                    className={
                      balance > 0
                        ? clsx(styles.textEnd, styles.textSuccess)
                        : balance < 0
                        ? clsx(styles.textEnd, styles.textDanger)
                        : clsx(styles.textEnd, styles.textWarning)
                    }
                  >
                    <strong>{balance}€</strong>
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
                      (acc, [year, data]) =>
                        acc + data.sellFees + data.sellTaxes,
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
      </div>
    );
  }

  const sortedDividendsData = Object.entries(
    fiscalData.byYear[year].dividends.raw
  ).sort((dividendA, dividendB) => {
    const { column, order } = sortConfig;
    if (column === null) return 0;

    const valuesA = [
      dividendA[1].transaction.asset.ticker,
      dividendA[1].transaction.date,
      dividendA[1].amount,
      dividendA[1].fees + dividendA[1].taxes,
      dividendA[1].amount - dividendA[1].fees - dividendA[1].taxes,
    ];

    const valuesB = [
      dividendB[1].transaction.asset.ticker,
      dividendB[1].transaction.date,
      dividendB[1].amount,
      dividendB[1].fees + dividendB[1].taxes,
      dividendB[1].amount - dividendB[1].fees - dividendB[1].taxes,
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

  function dividendsTable() {
    return (
      <div className={clsx(styles.tableResponsive)}>
        <table className={clsx(styles.table, styles.tableHover)}>
          <thead>
            <tr>
              <td
                className={clsx(styles.textBegin)}
                colSpan={dividendsColumns.length}
              >
                <div className={clsx(styles.tableMenu)}>
                  <div
                    onClick={() => setTableMenuActiveTab(0)}
                    className={
                      tableMenuActiveTab === 0 &&
                      clsx(styles.tableMenuActionActive)
                    }
                  >
                    <i
                      style={{ width: "100%", textAlign: "center" }}
                      class="fa-solid fa-user"
                    ></i>
                  </div>
                  <div
                    onClick={() => setTableMenuActiveTab(1)}
                    className={
                      tableMenuActiveTab === 1 &&
                      clsx(styles.tableMenuActionActive)
                    }
                  >
                    <svg width="2rem" height="2rem" viewBox="0 0 24 24">
                      <text x="0" y="18">
                        IRS
                      </text>
                    </svg>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              {dividendsColumns.map((label, index) => (
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
            {sortedDividendsData.map(([year, data], index) => {
              let balance =
                Math.round((data.amount - data.fees - data.taxes) * 100) / 100;

              return (
                <tr key={index}>
                  <td className={clsx(styles.textEnd)}>
                    <strong>{data.transaction.asset.ticker}</strong>
                  </td>
                  <td className={clsx(styles.textEnd)}>
                    {data.transaction.date}
                  </td>
                  <td className={clsx(styles.textEnd, "tooltipContainer")}>
                    <span>{data.amount}€</span>
                    {data.transaction.netAmountCurrency !== "EUR" && (
                      <i class="fa-solid fa-circle-info tooltip">
                        <div className="tooltipContent">
                          <div>
                            Moeda original:{" "}
                            <strong>
                              {data.transaction.netAmountCurrency}
                            </strong>
                          </div>
                          <div>
                            Taxa de câmbio:{" "}
                            <strong>
                              {Math.round(
                                data.transaction.exchangeRate * 1000
                              ) / 1000}
                            </strong>
                          </div>
                        </div>
                      </i>
                    )}
                  </td>
                  <td className={clsx(styles.textEnd)}>
                    {Math.round((data.fees + data.taxes) * 100) / 100 === 0
                      ? "-"
                      : Math.round((data.fees + data.taxes) * 100) / 100 + "€"}
                  </td>
                  <td
                    className={
                      balance > 0
                        ? clsx(styles.textEnd, styles.textSuccess)
                        : balance < 0
                        ? clsx(styles.textEnd, styles.textDanger)
                        : clsx(styles.textEnd, styles.textWarning)
                    }
                  >
                    <strong>{balance}€</strong>
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
                    Object.entries(
                      fiscalData.byYear[year].dividends.raw
                    ).reduce((acc, [year, data]) => acc + data.amount, 0) * 100
                  ) / 100}
                  €
                </th>
                <th className={clsx(styles.textEnd)}>
                  {Math.round(
                    Object.entries(
                      fiscalData.byYear[year].dividends.raw
                    ).reduce(
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
      </div>
    );
  }

  const sortedIRSDividendsData = Object.entries(
    fiscalData.byYear[year].dividends.irs
  ).sort((dividendA, dividendB) => {
    const { column, order } = sortConfig;
    if (column === null) return 0;

    const valuesA = [
      dividendA[1]["Ano rendimento"],
      dividendA[1]["Código Rendimento"],
      dividendA[1]["País da fonte"],
      dividendA[1]["Rendimento Bruto"],
      dividendA[1]["Imposto Pago no Estrangeiro - No país da fonte"],
    ];

    const valuesB = [
      dividendB[1]["Ano rendimento"],
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

  function dividendsIRSTable() {
    return (
      <div className={clsx(styles.tableResponsive)}>
        <table className={clsx(styles.table, styles.tableHover)}>
          <thead>
            <tr>
              <td
                className={clsx(styles.textBegin)}
                colSpan={dividendsIRSColumns.length}
              >
                <div className={clsx(styles.tableMenu)}>
                  <div
                    onClick={() => setTableMenuActiveTab(0)}
                    className={
                      tableMenuActiveTab === 0 &&
                      clsx(styles.tableMenuActionActive)
                    }
                  >
                    <i
                      style={{ width: "100%", textAlign: "center" }}
                      class="fa-solid fa-user"
                    ></i>
                  </div>
                  <div
                    onClick={() => setTableMenuActiveTab(1)}
                    className={
                      tableMenuActiveTab === 1 &&
                      clsx(styles.tableMenuActionActive)
                    }
                  >
                    <svg width="2rem" height="2rem" viewBox="0 0 24 24">
                      <text x="0" y="18">
                        IRS
                      </text>
                    </svg>
                  </div>
                </div>
              </td>
            </tr>
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
                    <strong>{data["Ano rendimento"]}</strong>
                  </td>
                  <td className={clsx(styles.textEnd)}>
                    {data["Código Rendimento"]}
                  </td>
                  <td className={clsx(styles.textEnd, "tooltipContainer")}>
                    <span>{data["País da fonte"]}</span>
                  </td>
                  <td className={clsx(styles.textEnd)}>
                    {Math.round(data["Rendimento Bruto"] * 100) / 100 === 0
                      ? "-"
                      : Math.round(data["Rendimento Bruto"] * 100) / 100 + "€"}
                  </td>
                  <td className={clsx(styles.textEnd)}>
                    {Math.round(
                      data["Imposto Pago no Estrangeiro - No país da fonte"] *
                        100
                    ) /
                      100 ===
                    0
                      ? "-"
                      : Math.round(
                          data[
                            "Imposto Pago no Estrangeiro - No país da fonte"
                          ] * 100
                        ) /
                          100 +
                        "€"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

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

  function capitalGainsIRSTable() {
    return (
      <div className={clsx(styles.tableResponsive)}>
        <table className={clsx(styles.table, styles.tableHover)}>
          <thead>
            <tr>
              <td
                className={clsx(styles.textBegin)}
                colSpan={capitalGainsIRSColumns.length}
              >
                <div className={clsx(styles.tableMenu)}>
                  <div
                    onClick={() => setTableMenuActiveTab(0)}
                    className={
                      tableMenuActiveTab === 0 &&
                      clsx(styles.tableMenuActionActive)
                    }
                  >
                    <i
                      style={{ width: "100%", textAlign: "center" }}
                      class="fa-solid fa-user"
                    ></i>
                  </div>
                  <div
                    onClick={() => setTableMenuActiveTab(1)}
                    className={
                      tableMenuActiveTab === 1 &&
                      clsx(styles.tableMenuActionActive)
                    }
                  >
                    <svg width="2rem" height="2rem" viewBox="0 0 24 24">
                      <text x="0" y="18">
                        IRS
                      </text>
                    </svg>
                  </div>
                </div>
              </td>
            </tr>
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
              return (
                <tr key={index}>
                  <td className={clsx(styles.textEnd)}>
                    <strong>{data["Ticker"]}</strong>
                  </td>
                  <td className={clsx(styles.textEnd)}>
                    <span>{data["País da fonte"]}</span>
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
                    <span>{Math.round(data["Valor de Aquisição"]*100)/100}€</span>
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
                    <span>{Math.round(data["Valor de Realização"]*100)/100}€</span>
                  </td>
                  <td className={clsx(styles.textEnd)}>
                    {Math.round(
                      data["Despesas e Encargos"] *
                        100
                    ) /
                      100 ===
                    0
                      ? "-"
                      : Math.round(
                          data[
                            "Despesas e Encargos"
                          ] * 100
                        ) /
                          100 +
                        "€"}
                  </td>
                  <td className={clsx(styles.textEnd)}>
                    {Math.round(
                      data["Imposto retido no estrangeiro"] *
                        100
                    ) /
                      100 ===
                    0
                      ? "-"
                      : Math.round(
                          data[
                            "Imposto retido no estrangeiro"
                          ] * 100
                        ) /
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
      </div>
    );
  }

  function exportToExcel(year) {
    console.log("Exporting to Excel...");
    const wsCapitalGains = XLSX.utils.json_to_sheet(
      fiscalData.byYear[year].capitalGains.irs
    );
    const wsDividends = XLSX.utils.json_to_sheet(
      fiscalData.byYear[year].dividends.irs
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsCapitalGains, "Mais valias");
    XLSX.utils.book_append_sheet(wb, wsDividends, "Dividendos");
    XLSX.writeFile(wb, `maisvalias-tool-${year}.xlsx`);
  }

  function exportToIRS(year) {
    setIRSdialogVisible(true);
  }

  function DialogIRSDeclaration({ visible }) {
    const [files, setFiles] = useState([]);
    const [showError, setError] = useState(false);

    function onFileUpload(e) {
      const files = e.target.files;
      setFiles((prev) => Array.from(files));
    }

    function closeDialogIRS() {
      setIRSdialogVisible(false);
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

        const fullfilledIRS = PTIRSFormatter.format(
          xml_irs,
          fiscalData.byYear[year].capitalGains.irs,
          fiscalData.byYear[year].dividends.irs
        );

        const contentFile = document.getElementById("contentFile");
        fullfilledIRS
          .then((irs) => {
            contentFile.classList.remove(clsx(styles.contentStep2Error));

            // console.log("Declaração formatada: " + irs);
            loader.style.display = "none";
            document.getElementById("declaration-upload").style.display =
              "none";
            document.getElementById("declaration-download").style.display =
              "block";

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
          <div className={clsx(styles.dialogIRSDeclaration)}>
            <div className={clsx(styles.dialogIRSDeclarationCard)}>
              <div className={clsx(styles.dialogIRSDeclarationHeader)}>
                <svg width="2rem" height="2rem" viewBox="0 0 24 24">
                  <text x="0" y="18">
                    IRS
                  </text>
                </svg>
                <div className={clsx(styles.dialogIRSDeclarationTitle)}>
                  Preencher declaração
                  <div className={clsx(styles.dialogIRSDeclarationSubtitle)}>
                    Adiciona os resultados da ferramenta à tua declaração do IRS
                  </div>
                </div>
                <X
                  onClick={closeDialogIRS}
                  className={clsx(styles.dialogIRSDeclarationClose)}
                />
              </div>
              <div className={clsx(styles.dialogIRSDeclarationContent)}>
                <div
                  id="declaration-custom-loader-container"
                  className="local-custom-loader-container"
                >
                  <div className="custom-loader"></div>
                  <p className="custom-loader-text">Calculando...</p>
                </div>
                <div id="declaration-upload">
                  <p>
                    Coloca aqui a tua declaração de IRS para podermos
                    preenchê-la com os dados calculados:
                  </p>
                  <div id="contentFile" className={clsx(styles.contentStep2)}>
                    <Upload className={clsx(styles.contentStep2UploadIcon)} />
                    <input
                      className={clsx(styles.contentStep2UploadInput)}
                      id="file-upload"
                      type="file"
                      accept=".xml"
                      onChange={onFileUpload}
                    />
                    <label htmlFor="file-upload">Escolher ficheiro</label>
                    {files.length > 0 && (
                      <>
                        <div className={clsx(styles.contentStep2Files)}>
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className={clsx(styles.contentStep2File)}
                            >
                              <div
                                className={clsx(styles.contentStep2FileName)}
                              >
                                {file.name}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className={clsx(styles.contentStep2Process)}
                          onClick={onDeclarationUpload}
                        >
                          <div className={clsx(styles.contentStep2ProcessText)}>
                            Processar {files.length} ficheiro
                            {files.length !== 1 ? "s" : ""}
                          </div>
                          <ArrowRight />
                        </div>
                      </>
                    )}
                  </div>
                  <p
                    style={{
                      "font-style": "italic",
                      "font-weight": "bold",
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
                    A tua declaração foi preenchida e enviada para o teu
                    dispositivo. Confirma sempre se os resultados estão
                    corretos!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {showError && (
          <ErrorPopup title="Erro" closeFunction={() => setError(false)}>
            <h3>Falha ao processar os ficheiros</h3>
            <span>
              Os ficheiros não são compatíveis com o formato esperado.
            </span>
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
      </>
    );
  }

  return (
    <div className={clsx(styles.container)}>
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
                    ? clsx(styles.borderSuccess, styles.textSuccess)
                    : clsx(styles.borderInactive, styles.textInactive)
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
                  activeTab !== 0
                    ? clsx(styles.borderWarning, styles.textWarning)
                    : clsx(styles.borderInactive, styles.textInactive)
                )}
              >
                <div className={clsx(styles.tabBody, styles.textCenter)}>
                  <i className={clsx(styles.tabIcon, "fa-solid fa-coins")}></i>
                  <span className={clsx(styles.tabTitle)}>Dividendos</span>
                </div>
              </div>
            </div>
            {activeTab === 0 && tableMenuActiveTab === 0 && capitalGainsTable()}
            {activeTab === 0 && tableMenuActiveTab === 1 && capitalGainsIRSTable()}
            {activeTab === 1 && tableMenuActiveTab === 0 && dividendsTable()}
            {activeTab === 1 && tableMenuActiveTab === 1 && dividendsIRSTable()}

            {fiscalData.byYear[year].capitalGains.raw.length === 0 && (
              <p className={clsx(styles.textCenter, styles.textMuted)}>
                Nenhum dado disponível para exibir
              </p>
            )}
          </div>
        </div>
      </div>
      <DialogIRSDeclaration visible={IRSdialogVisible} />
    </div>
  );
}
