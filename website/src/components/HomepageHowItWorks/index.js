import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const HowItWorksList = [
  {
    title: '1. Diz-nos qual a tua corretora e o teu histórico de transações',
    Svg: require('@site/static/img/undraw_filing-system_e3yo.svg').default,
    description: (
      <>
      </>
    ),
  },
  {
    title: '2. Nós calculamos as mais valias e dividendos que tens de declarar no IRS',
    Svg: require('@site/static/img/undraw_printing-invoices_osgs.svg').default,
    description: (
      <>
        
      </>
    ),
  },
  {
    title: '3. Ficas feliz e com menos uma coisa com que te preocupar!',
    Svg: require('@site/static/img/undraw_happy-news_d5bt.svg').default,
    description: (
      <>
        
      </>
    ),
  },
];

function HowItWorks({Svg, title, description}) {
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

export default function HomepageHowItWorks() {
  return (
    <section className={clsx(styles.features, styles.howitworksSection)}>
      <div className="container">
        <h1 className={clsx(styles.howitworksTitle)}>Basta seguir os três passos:</h1>
        <div className="row">
          {HowItWorksList.map((props, idx) => (
            <HowItWorks key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
