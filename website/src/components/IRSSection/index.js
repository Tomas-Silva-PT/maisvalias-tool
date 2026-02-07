import { useState } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import { PTIRSRules2025 } from "../../maisvalias-tool/classifiers/rules/pt_rules2025.js";
import { Classifier } from "../../maisvalias-tool/classifiers/classifier.js";

export default function IRSSection({ id, year, fiscalData }) {
  let capitalGains = fiscalData.byYear[year].capitalGains.irs;
  let dividends = fiscalData.byYear[year].dividends.irs;

 
  // Classify transactions into IRS panels
  const classifier = new Classifier(PTIRSRules2025);
  const taxEvents = [...capitalGains, ...dividends];

  const classifications = classifier.classify(taxEvents);
  const panels = Array.from(classifications.keys());

  const [activeTab, setActiveTab] = useState(
  [...classifications.keys()][0].code
);


return (
  <div className={clsx(styles.tabsContainer)}>
    {panels.map(panel => (
      <div key={panel.code} 
           className={clsx(styles.tab, activeTab === panel.code ? clsx(styles.tabActive): ""
                      )} 
           onClick={() => setActiveTab(panel.code)}>
        <div className={clsx(styles.tabBody, styles.textCenter)}>
          <div className={clsx(styles.tabTitle)} >{panel.title}</div>
          <div className={clsx(styles.tabSubtitle)}>{panel.subtitle}</div>
        </div>
      </div>
      
    ))}
  </div>
);

}
