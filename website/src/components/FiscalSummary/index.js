import clsx from "clsx";
import styles from "./styles.module.css";

export default function FiscalSummary({ id, fiscalData }) {
  let balance =
    Math.round(
      (fiscalData.summary.gains +
        fiscalData.summary.dividends -
        fiscalData.summary.losses -
        fiscalData.summary.fees -
        fiscalData.summary.taxes) *
        100
    ) / 100;

  // let balanceStatus = balance > 0 ? clsx(styles.textEnd, styles.textSuccess) : balance < 0 ? clsx(styles.textEnd, styles.textDanger) : clsx(styles.textEnd, styles.textWarning);
  let balanceStatus = clsx(styles.textPrimary);
  let balanceBorder = clsx(styles.borderPrimary);
  // let balanceBorder = balance > 0 ? clsx(styles.borderSuccess) : balance < 0 ? clsx(styles.borderDanger) : clsx(styles.borderWarning);


  let totalExpenses =
    Math.round((fiscalData.summary.fees + fiscalData.summary.taxes) * 100) /
    100;

  return (
    <div id={id} className={clsx(styles.container)}>
      <div className={clsx(styles.cardContainer)}>
        <div className={clsx(styles.card, styles.borderSuccess)}>
          <div className={clsx(styles.cardBody, styles.textCenter)}>
            <i
              className={clsx(styles.textSuccess, "fas fa-arrow-up fa-2x")}
            ></i>
            <h4 className={clsx(styles.textSuccess)}>
              {fiscalData.summary.gains}€
            </h4>
            <small>Total de Ganhos</small>
          </div>
        </div>
      </div>
      <div className={clsx(styles.cardContainer)}>
        <div className={clsx(styles.card, styles.borderDanger)}>
          <div className={clsx(styles.cardBody, styles.textCenter)}>
            <i
              className={clsx(styles.textDanger, "fas fa-arrow-down fa-2x")}
            ></i>
            <h4 className={clsx(styles.textDanger)}>
              {fiscalData.summary.losses}€
            </h4>
            <small>Total de Perdas</small>
          </div>
        </div>
      </div>
      <div className={clsx(styles.cardContainer)}>
        <div className={clsx(styles.card, styles.borderWarning)}>
          <div className={clsx(styles.cardBody, styles.textCenter)}>
            <i className={clsx(styles.textWarning, "fas fa-coins fa-2x")}></i>
            <h4 className={clsx(styles.textWarning)}>
              {fiscalData.summary.dividends}€
            </h4>
            <small>Total de Dividendos</small>
          </div>
        </div>
      </div>
      <div className={clsx(styles.cardContainer)}>
        <div className={clsx(styles.card, styles.borderDanger)}>
          <div className={clsx(styles.cardBody, styles.textCenter)}>
            <i
              className={clsx(
                styles.textDanger,
                "fas fa-building-columns fa-2x"
              )}
            ></i>
            <h4 className={clsx(styles.textDanger)}>{totalExpenses}€</h4>
            <small>Total de Despesas</small>
          </div>
        </div>
      </div>
      <div className={clsx(styles.cardContainer)}>
        <div className={clsx(styles.card, balanceBorder)}>
          <div className={clsx(styles.cardBody, styles.textCenter)}>
            <i
              className={clsx(balanceStatus, "fas fa-calculator fa-2x")}
            ></i>
            <h4 className={balanceStatus}>{balance}€</h4>
            <small>Balanço</small>
          </div>
        </div>
      </div>
    </div>
  );
}
