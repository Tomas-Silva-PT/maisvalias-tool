import clsx from "clsx";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

export default function HomepageTryNow() {
  return (
    <>
    <section className={clsx(styles.section)}>
      <svg
        viewBox="0 0 100 100"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className={clsx(styles.stockline)}
      >
        <polyline
          points="-2,90 6,60 22,60 37,64 55,43 68,44 87,29 101,23"
          fill="none"
          stroke-width="4"
          class="animated-line"
        />
      </svg>

      <div className="container">
        <h1 className={clsx(styles.title)}>Experimenta agora</h1>
        <div className={styles.buttons}>
          <Link
            className={clsx("button button--secondary button--lg", styles.link)}
            to="/docs/intro"
          >
            Experimentar
          </Link>
        </div>
      </div>
      
    </section>
    </>
    
    
  );
}
