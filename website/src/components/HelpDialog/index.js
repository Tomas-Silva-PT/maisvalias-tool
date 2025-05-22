import clsx from "clsx";
import styles from "./styles.module.css";
import React, { use, useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { X } from "lucide-react";

export default function HelpDialog({ visible, docs }) {
  const [linksVisible, setLinksVisible] = useState(false);

  function showLinks() {
    setLinksVisible(!linksVisible);

    const footer = document.getElementById("help-popup-footer");
    const questionmark = document.getElementById("help-popup-question");
    const closemark = document.getElementById("help-popup-close");

    footer.classList.toggle(styles.growned);
    questionmark.classList.toggle(styles.hide);
    closemark.classList.toggle(styles.hide);
  }

  return (
    <>
      {visible && (
        <div id="help-popup" className={clsx(styles.container)}>
          <div className={clsx(styles.header)}></div>
          <div
            id="help-popup-footer"
            className={clsx(styles.footer, styles.shrinked)}
          >
            {docs.map((doc, index) => (
              <p
                key={index}
                onClick={() => window.open(doc.link, "_blank")}
              >
                {doc.message}
              </p>
            ))}
          </div>
          <div
            id="help-popup-body"
            onClick={() => showLinks()}
            className={clsx(styles.body, styles.dialogClosed)}
          >
            <p id="help-popup-question" className={clsx(styles.dialogClosed)}>
              ?
            </p>
            <p id="help-popup-close" className={clsx(styles.hide)}>
              <X className={clsx(styles.dialogOpened)} />
            </p>
          </div>
        </div>
      )}
    </>
  );
}
