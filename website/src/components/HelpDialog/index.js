import clsx from "clsx";
import styles from "./styles.module.css";
import React, { use, useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { X } from "lucide-react";

export default function HelpDialog({ visible, message, link }) {
  const [linksVisible, setLinksVisible] = useState(false);

  function showLinks() {
    setLinksVisible(!linksVisible);
    !linksVisible ? document.getElementById("help-popup-footer").style.display = "block" : document.getElementById("help-popup-footer").style.display = "none";
  }

  return (
    <>
      {visible && (
        <div id="help-popup" className={clsx(styles.container)}>
          <div className={clsx(styles.header)}></div>
          <div id="help-popup-footer"  className={clsx(styles.footer)}>
            <p onClick={() => window.open(link, "_blank")}>{message}</p>

          </div>
          <div
            onClick={() => showLinks()}
            className={clsx(styles.body)}
          >
            <p>?</p>
          </div>
        </div>
      )}
    </>
  );
}
