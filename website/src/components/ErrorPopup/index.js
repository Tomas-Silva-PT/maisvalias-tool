import clsx from "clsx";
import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";

export default function ErrorPopup({ title, children, closeFunction }) {


  function closePopup() {
    document.getElementById("popup").style.display = "none";
  }

  return (
    <>
      ( <div id="popup" className={clsx(styles.container)}>
        <div className={clsx(styles.content)}>
          <div className={clsx(styles.header)}>
            <div className={clsx(styles.icon)}>!</div>
            <div className={clsx(styles.title)}>{title}</div>
          </div>
          <div className={clsx(styles.body)}>
            {children}
          </div>
          <div className={clsx(styles.footer)}>
            <div className={clsx(styles.button)} onClick={closeFunction}>
              <div>Fechar</div>
            </div>
          </div>
        </div>
      </div> )
    </>
  );
}
