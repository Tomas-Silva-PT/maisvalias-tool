import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import HomepageHowItWorks from "@site/src/components/HomepageHowItWorks";
import HomepageTryNow from "@site/src/components/HomepageTryNow";
import HomepageDisclaimer from "@site/src/components/HomepageDisclaimer";


import Heading from "@theme/Heading";
import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header
      className={clsx(
        "hero hero--primary",
        styles.heroBanner,
        styles.homepageHeader
      )}
    >
      <div className={clsx(styles.heroContent)}>
        <div className={clsx("container", styles.heroSection, 'hero-fade-in')}>
          <Heading as="h1" className="hero__title hero-title">
            {siteConfig.title}
          </Heading>
          <p className="hero__subtitle hero-subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/intro"
            >
              Começar já - 5min ⏱️
            </Link>
          </div>
        </div>
        <svg
          viewBox="0 0 100 100"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={clsx(styles.stockline)}
        >
          <polyline
            points="-1,83 14,75 32,61 45,61 63,40 78,44 94,45 103,7"
            fill="none"

            strokeWidth="4"
            className="animated-line"
          />
        </svg>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Bem-vindo`}
      description="Ferramenta de cálculo das mais valias IRS PT <head />"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageHowItWorks />
        <HomepageTryNow />
        <HomepageDisclaimer />
      </main>
    </Layout>
  );
}
