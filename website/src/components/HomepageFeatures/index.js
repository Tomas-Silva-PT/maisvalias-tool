import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Simples e rápido',
    Svg: require('@site/static/img/undraw_super-woman_6nx2.svg').default,
    description: (
      <>
        Não precisas de ser um mestre em contabilidade nem bom em matemática, obtém em segundos a informação a colocar no IRS.
      </>
    ),
  },
  {
    title: 'Free & Open-Source',
    Svg: require('@site/static/img/undraw_shared-goals_jn0a.svg').default,
    description: (
      <>
        Não existem compromissos, se não gostares do resultado, não perdes nada! Se gostares, podes ajudar e contribuir para o projeto!
      </>
    ),
  },
  {
    title: 'Não armazenamos dados',
    Svg: require('@site/static/img/undraw_security-on_btwg.svg').default,
    description: (
      <>
        Não é necessário criares conta, nem iremos guardar quaisquer dados. O sistema não quer saber quem o utiliza, como ou porquê.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4', 'feature-fade-in')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
