import { useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import { PTIRSRules2025 } from "../../maisvalias-tool/classifiers/rules/pt_rules2025.js";
import { Classifier } from "../../maisvalias-tool/classifiers/classifier.js";
import { PTIRSFormatterRegistry } from "../../maisvalias-tool/formatters/pt/irs/pt_irs_formatter.js";

export default function IRSSection({ id, year, fiscalData }) {
  const capitalGains = fiscalData.byYear[year].capitalGains.raw;
  const dividends = fiscalData.byYear[year].dividends.raw;
  console.log("Raw tax events for year", year, { capitalGains, dividends });

  // Classify transactions into IRS panels
  const classifier = new Classifier(PTIRSRules2025);
  const taxEvents = [...capitalGains, ...dividends];
  console.log("Classifying tax events for year", year, taxEvents);
  const classifications = classifier.classify(taxEvents);
  console.log("Classifications for year", year, classifications);

  const panels = Array.from(classifications.keys());
  const classifiedTaxEvents = Array.from(classifications.values());
  console.log("Classified tax events for year", year, classifications);

  // Map panel code → tax events
  const panelEventsMap = {};
  panels.forEach((panel, index) => {
    panelEventsMap[panel.code] = classifiedTaxEvents[index];
  });

  const [activeTab, setActiveTab] = useState(panels[0].code);

  return (
    <>
      <div className={clsx(styles.tabsContainer)}>
        {/* Tabs */}

        {panels.map((panel) => {
          const events = panelEventsMap[panel.code] || [];
          return (
            events.length > 0 && (
              <div
                key={panel.code}
                className={clsx(
                  styles.tab,
                  activeTab === panel.code && styles.tabActive,
                )}
                onClick={() => setActiveTab(panel.code)}
              >
                <div className={clsx(styles.tabBody, styles.textCenter)}>
                  <div className={clsx(styles.tabTitle)}>{panel.title}</div>
                  <div className={clsx(styles.tabSubtitle)}>
                    {panel.subtitle}
                  </div>
                </div>
              </div>
            )
          );
        })}
      </div>
      {/* Conteúdo da tabela do tab ativo */}
      <div className={styles.tabContents}>
        {panels.map((panel) => {
          if (panel.code !== activeTab) return null;

          const events = panelEventsMap[panel.code] || [];
          const formatter = PTIRSFormatterRegistry.getFormatter(panel.code);
          // console.log("Events for panel", panel.code, events);
          const formattedData = formatter ? formatter.format(events) : events;
          // console.log("Formatted data for panel", panel.code, formattedData);
          return (
            formattedData.length > 0 && (
              <div key={panel.code} className={styles.tabPane}>
                <TaxEventTable data={formattedData} />
              </div>
            )
          );
        })}
      </div>
    </>
  );
}

function TaxEventTable({ data }) {
  if (!data || data.length === 0)
    return <div className={styles.textCenter}>Nenhum registo</div>;

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

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.column) return 0;

    const valA = a[sortConfig.column];
    const valB = b[sortConfig.column];

    if (typeof valA === "number" && typeof valB === "number") {
      return sortConfig.order === "asc" ? valA - valB : valB - valA;
    }

    return sortConfig.order === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Os headers são as chaves do primeiro objeto
  const headers = Object.keys(sortedData[0]);

  return (
    <div className={clsx(styles.tableResponsive)}>
      <table className={clsx(styles.table, styles.tableHover)}>
        <thead>
          <tr>
            {headers.map((label, index) => (
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
          {data.map((row, i) => (
            <tr key={i}>
              {headers.map((header) => (
                <td key={header} className={clsx(styles.textEnd)}>
                  <strong>{row[header]}</strong>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
