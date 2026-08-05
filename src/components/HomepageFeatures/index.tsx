import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  to: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Getting Started',
    to: '/tutorials/getting-started/project-setup',
    description: (
      <>
        Go from a clean Unity project to a VR Framework enabled one: package
        manager install, automatic setup and the Scene Builder.
      </>
    ),
  },
  {
    title: 'Modules',
    to: '/tutorials/modules/modules-overview',
    description: (
      <>
        Localization, Progress, Interaction, Minigame, Mistake, Platform, Voice
        React and Audio - what each module does and how to wire it up.
      </>
    ),
  },
  {
    title: 'API Reference',
    to: '/api',
    description: (
      <>
        Generated reference for the framework SDK: types, components and the
        events they expose.
      </>
    ),
  },
];

/** One drawing sheet per section, numbered the way plates in a set are. */
function Feature({title, to, description, index}: FeatureItem & {index: number}) {
  return (
    <Link to={to} className={styles.sheet}>
      <span className={styles.sheetNumber}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <Heading as="h3" className={styles.sheetTitle}>
        {title}
      </Heading>
      <p className={styles.sheetBody}>{description}</p>
      <span className={styles.sheetAction}>Open</span>
    </Link>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.grid}>
          {FeatureList.map((props, idx) => (
            <Feature key={props.title} index={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
