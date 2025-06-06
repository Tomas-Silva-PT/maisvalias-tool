import clsx from "clsx";
import styles from "./styles.module.css";
import React, { useState } from "react";

export default function ErrorPopup({ title, children, closeFunction, error }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleCopy = () => {
    if (error) {
      navigator.clipboard.writeText(error);
    }
  };

  return (
    <div id="popup" className={clsx(styles.container)}>
      <div className={clsx(styles.content)}>
        <div className={clsx(styles.header)}>
          <div className={clsx(styles.icon)}>!</div>
          <div className={clsx(styles.title)}>{title}</div>
        </div>

        <div className={clsx(styles.body)}>
          {children}

          {error && (
            <div className={clsx(styles.errorDetails)}>
              <button
                className={clsx(styles.toggleButton)}
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? "Esconder erro técnico" : "Mostrar erro técnico"}
              </button>

              {showDetails && (
                <div className={clsx(styles.detailsContent)}>
                  <textarea
                    readOnly
                    value={error.stack}
                    rows={10}
                    className={clsx(styles.textarea)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className={clsx(styles.footer)}>
          <div className={clsx(styles.button)} onClick={closeFunction}>
            Fechar
          </div>
        </div>
      </div>
    </div>
  );
}
