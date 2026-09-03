import {useState, type FormEvent, type ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './report-bug.module.css';

/**
 * Bug report form. Posts to the `/api/bug-report` serverless function, which
 * mails the report on. Nothing is stored: the inbox is the tracker.
 */

const SEVERITIES = ['Blocker', 'Major', 'Minor', 'Cosmetic'] as const;

type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMPTY = {
  title: '',
  severity: 'Major',
  area: '',
  description: '',
  steps: '',
  expected: '',
  actual: '',
  vrfVersion: '',
  unityVersion: '',
  platform: '',
  reporter: '',
  reporterEmail: '',
  website: '', // honeypot - real people never see this
};

export default function ReportBug(): ReactNode {
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const set =
    (name: keyof typeof EMPTY) =>
    (event: {target: {value: string}}) =>
      setValues((previous) => ({...previous, [name]: event.target.value}));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...values,
          pageUrl: typeof window === 'undefined' ? '' : window.location.href,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setValues(EMPTY);
      setStatus('sent');
    } catch {
      setError('The report could not be sent. Check your connection and try again.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <Layout title="Report a bug" description="Report a bug in the VR Framework.">
        <main className={clsx('container', styles.page)}>
          <div className={styles.done}>
            <p className="vrf-annotation">Filed</p>
            <Heading as="h1" className={styles.title}>
              Report sent
            </Heading>
            <p className={styles.lead}>
              Thanks - the report is on its way to the VR Framework team. If you left an
              email address, expect any follow-up questions there.
            </p>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setStatus('idle')}>
              Report another bug
            </button>
          </div>
        </main>
      </Layout>
    );
  }

  const sending = status === 'sending';

  return (
    <Layout title="Report a bug" description="Report a bug in the VR Framework.">
      <main className={clsx('container', styles.page)}>
        <p className="vrf-annotation">Support</p>
        <Heading as="h1" className={styles.title}>
          Report a bug
        </Heading>
        <p className={styles.lead}>
          Tell us what broke. The more precisely you can describe what you did and what
          happened instead, the faster it gets fixed. Only the first three fields are
          required - fill in the rest when you know them.
        </p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="title">
              Summary <span className={styles.required}>required</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={200}
              placeholder="Teleport ray disappears after grabbing an object"
              value={values.title}
              onChange={set('title')}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="severity">
                Severity <span className={styles.required}>required</span>
              </label>
              <select
                id="severity"
                name="severity"
                value={values.severity}
                onChange={set('severity')}>
                {SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
              <p className={styles.hint}>
                Blocker: nothing works. Cosmetic: it looks wrong but functions.
              </p>
            </div>

            <div className={styles.field}>
              <label htmlFor="area">Area / module</label>
              <input
                id="area"
                name="area"
                type="text"
                maxLength={120}
                placeholder="Interaction, Movement, Localization..."
                value={values.area}
                onChange={set('area')}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="description">
              What happened <span className={styles.required}>required</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              maxLength={8000}
              placeholder="Describe the bug, including any error message or stack trace from the Unity console."
              value={values.description}
              onChange={set('description')}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="steps">Steps to reproduce</label>
            <textarea
              id="steps"
              name="steps"
              rows={5}
              maxLength={8000}
              placeholder={'1. Open the sample scene\n2. Grab the cube\n3. Point at the floor'}
              value={values.steps}
              onChange={set('steps')}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="expected">Expected result</label>
              <textarea
                id="expected"
                name="expected"
                rows={3}
                maxLength={2000}
                value={values.expected}
                onChange={set('expected')}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="actual">Actual result</label>
              <textarea
                id="actual"
                name="actual"
                rows={3}
                maxLength={2000}
                value={values.actual}
                onChange={set('actual')}
              />
            </div>
          </div>

          <fieldset className={styles.fieldset}>
            <legend>Environment</legend>
            <div className={styles.row3}>
              <div className={styles.field}>
                <label htmlFor="vrfVersion">VR Framework version</label>
                <input
                  id="vrfVersion"
                  name="vrfVersion"
                  type="text"
                  maxLength={80}
                  value={values.vrfVersion}
                  onChange={set('vrfVersion')}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="unityVersion">Unity version</label>
                <input
                  id="unityVersion"
                  name="unityVersion"
                  type="text"
                  maxLength={80}
                  placeholder="6000.0.23f1"
                  value={values.unityVersion}
                  onChange={set('unityVersion')}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="platform">Headset / platform</label>
                <input
                  id="platform"
                  name="platform"
                  type="text"
                  maxLength={120}
                  placeholder="Quest 3, PCVR, Editor..."
                  value={values.platform}
                  onChange={set('platform')}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>You (optional)</legend>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="reporter">Name</label>
                <input
                  id="reporter"
                  name="reporter"
                  type="text"
                  maxLength={200}
                  value={values.reporter}
                  onChange={set('reporter')}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="reporterEmail">Email</label>
                <input
                  id="reporterEmail"
                  name="reporterEmail"
                  type="email"
                  maxLength={200}
                  value={values.reporterEmail}
                  onChange={set('reporterEmail')}
                />
                <p className={styles.hint}>Only used to reply with follow-up questions.</p>
              </div>
            </div>
          </fieldset>

          {/* Honeypot. Hidden from people, irresistible to bots. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={set('website')}
            />
          </div>

          {status === 'error' && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className="button button--secondary button--lg"
              disabled={sending}>
              {sending ? 'Sending...' : 'Send report'}
            </button>
            <p className={styles.hint}>
              Attachments are not supported - paste log excerpts into the description, or
              link to a video.
            </p>
          </div>
        </form>
      </main>
    </Layout>
  );
}
