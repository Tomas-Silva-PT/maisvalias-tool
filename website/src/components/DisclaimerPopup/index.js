import clsx from "clsx";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ArrowRight, Upload, X } from "lucide-react";

export default function DisclaimerPopup({title, message}) {

  function checkAgreement() {
    if (!sessionStorage.getItem("disclaimerPopUpClosed")) {
      document.getElementById("disclaimer-popup").style.display = "flex";
    } else {
      document.getElementById("disclaimer-popup").style.display = "none";
    }
  }

  function closeWarning () {
    document.getElementById("disclaimer-popup").style.display = "none";
    sessionStorage.setItem("disclaimerPopUpClosed", "true");
  }
  useEffect(() => {
  checkAgreement();

  }, []);

  return (
    <>
      <div id="disclaimer-popup" className={clsx(styles.container)}>
        <div className={clsx(styles.header)}>
          <div className={clsx(styles.title)}><span>⚠️</span> {title}</div>
        </div>
        <div className={clsx(styles.body)}>
          <p>{message}</p>
        </div>
        <div className={clsx(styles.footer)}>
          <div className={clsx(styles.button)} onClick={closeWarning}>
            <div>Compreendo</div>
          </div>
        </div>
      </div>
    </>
  );
}
