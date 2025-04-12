import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import Heading from "@theme/Heading";
import styles from "./index.module.css";

import LiveDemoForm from "@site/src/components/LiveDemoForm";


function LiveDemoHeader() {
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
        <div className={clsx("container", styles.heroSection, "hero-fade-in")}>
          <Heading as="h1" className="hero__title hero-title">
            {siteConfig.title}
          </Heading>
          <p className="hero__subtitle hero-subtitle">{siteConfig.tagline}</p>
        </div>
        <svg
          viewBox="0 0 100 100"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className={clsx(styles.stockline)}
        >
          <polyline
            points="-1,84 14,78 32,65 45,65 63,47 78,51 94,52 103,22"
            fill="none"
            stroke-width="4"
            class="animated-line"
          />
        </svg>
      </div>
    </header>
  );
}

function LiveDemoContent() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <>
      <LiveDemoForm />
    </>
  );
}

export default function LiveDemoPage() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Bem-vindo`}
      description="Ferramenta de cálculo das mais valias IRS PT <head />"
    >
      <LiveDemoHeader />
      <main>
        <LiveDemoContent />
      </main>
    </Layout>
  );
}
