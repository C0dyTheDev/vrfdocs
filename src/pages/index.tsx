import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

/**
 * The hero is laid out as a drawing sheet: the logo sits in a framed plate with
 * dimension ticks, the copy sits beside it in the title block.
 */
function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroCopy}>
          <p className={clsx('vrf-annotation', styles.heroEyebrow)}>Unity · Virtual Reality</p>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroTagline}>{siteConfig.tagline}</p>
          <div className={styles.heroButtons}>
            <Link className="button button--secondary button--lg" to="/tutorials">
              Get started
            </Link>
            <Link
              className="button button--outline button--secondary button--lg"
              to="/api">
              API reference
            </Link>
          </div>
        </div>

        <div className={styles.heroPlate} aria-hidden="true">
          <ThemedImage
            className={styles.heroMark}
            alt=""
            sources={{
              light: useBaseUrl('/img/vrf-mark-ink.png'),
              dark: useBaseUrl('/img/vrf-mark.png'),
            }}
          />
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Documentation for the VR Framework: setup guides, module reference and the API.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
