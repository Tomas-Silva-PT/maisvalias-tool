import clsx from "clsx";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import React, { useEffect, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

const steps = [
  {
    num: 1,
    title: "Selecionar corretora",
    description:
      "Das corretoras suportadas, escolhe a que utilizas para os teus investimentos",
  },
  {
    num: 2,
    title: "Indicar histórico de transações",
    description:
      "Coloca os ficheiros da corretora referentes ao histórico de transações, desde o ano da criação da conta na mesma",
  },
  {
    num: 3,
    title: "Obter resultados",
    description: "Aqui estão os resultados do cálculo das mais-valias",
  },
];

const brokers = [
  {
    name: "Trading212",
    logo: "/img/brokers/trading212.png"
  },
  {
    name: "eToro",
    logo: "/img/brokers/etoro.png"
  },
  {
    name: "XTB",
    logo: "/img/brokers/xtb.png"
  },
  {
    name: "Degiro",
    logo: "/img/brokers/degiro.png"
  },
  {
    name: "Revolut",
    logo: "/img/brokers/revolut.png"
  }
];




export default function LiveDemoForm() {
  const [step, setStep] = useState(1);
  const [broker, setBroker] = useState({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let newProgress = ((step - 1) / 2) * 100;
    setProgress(newProgress);
  }, [step]);

  function Header(props) {
    let step = props.step;
    return (
      <>
        <div className={clsx(styles.header)}>
        <HeaderSteps step={step}/>
        <HeaderProgress step={step}/>
        </div>
      </>
    );
  }
  
  function HeaderSteps(props) {
    let currStep = props.step;
    return (
      <>
        <div className={clsx(styles.headerSteps)}>
          {steps.map((step) => (
            <HeaderStep
              step={currStep}
              num={step.num}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </>
    );
  }
  
  function HeaderStep(props) {
    let currStep = props.step;
    let num = props.num;
    let title = props.title;
    let description = props.description;
    return (
      <>
        <div key={num} className={clsx(styles.headerStep, currStep >= num ? styles.headerStepActive : styles.headerStepInactive)}>
          <div className={clsx(styles.headerStepNum)}>{num}</div>
          <div className={clsx(styles.headerStepTitle)}>{title}</div>
        </div>
      </>
    );
  }
  
  function HeaderProgress(props) {
    let currStep = props.step;
    return (
      <>
        <div
          className={clsx(styles.headerProgressContainer)}
        >
          <div className={clsx(styles.headerProgress)}
               style={{ width: `${progress}%` }}>
          </div>
        </div>
      </>
    );
  }
  
  function Content(props) {
    let currStep = props.step;
    let currStepData = steps[currStep - 1];
    let description = currStepData.description;
    return (
      <>
          <div className={clsx(styles.content)}>
            <h3>{description}:</h3>
            {
              currStepData.num === 1 && 
              (
                <ContentStep1 />
              )
            }
            {
              currStepData.num === 1 && 
              (
                <ContentStep2 />
              )
            }
            {
              currStepData.num === 1 && 
              (
                <ContentStep3 />
              )
            }
          </div>
      </>
    )
  }
  
  function onBrokerSelected(broker) {
    setStep((step) => step + 1);
    setBroker(broker);
  }
  
  function ContentStep1(props) {
    
    return (
      <>
        <div className={clsx(styles.contentStep1)}>
          {brokers.map((broker) => (
            <div className={clsx(styles.contentStep1Broker)} onClick={ () => onBrokerSelected(broker)}>
              <img style={{ width: "100%", height: "auto" }} alt={broker.name} src={useBaseUrl(broker.logo)} />
            </div>
          ))}
        </div>
      </>
    );
  }
  
  function ContentStep2(props) {
  
    return (
      <>
      </>
    );
   }
  
  function ContentStep3(props) { 
  
    return (
      <>
      </>
    );
  }
  return (
    <>
      <section className={clsx(styles.form)}>
        <Header step={step}/>
        <Content step={step} />
      </section>
    </>
  );
}
