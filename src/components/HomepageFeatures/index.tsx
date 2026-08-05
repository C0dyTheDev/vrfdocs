import type {ReactNode} from 'react';
import clsx from 'clsx';
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

function Feature({title, to, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="padding-horiz--md">
        <Heading as="h3">
          <Link to={to}>{title}</Link>
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
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
