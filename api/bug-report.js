/**
 * Bug report intake.
 *
 * Vercel serverless function backing /report-bug. It validates the submitted
 * form, formats it as an email and hands it to Resend. Nothing is persisted -
 * the mail in the inbox is the record.
 *
 * This file lives next to the generated API Markdown because Vercel only picks
 * up functions from the repository-root `api/` directory. The Docusaurus docs
 * plugin globs `.md`/`.mdx` only, so it ignores this file.
 *
 * Environment (Vercel project settings):
 *   RESEND_API_KEY   required - https://resend.com/api-keys
 *   BUG_REPORT_TO    optional - defaults to kulhanek@cie-group.cz
 *   BUG_REPORT_FROM  optional - defaults to Resend's shared onboarding sender,
 *                               which can only deliver to the Resend account
 *                               owner. Switch to a verified domain sender
 *                               (e.g. "VRF Bugs <bugs@cie-group.cz>") to send
 *                               anywhere else.
 */

const TO = process.env.BUG_REPORT_TO || 'kulhanek@cie-group.cz';
const FROM = process.env.BUG_REPORT_FROM || 'VRF Bug Reports <onboarding@resend.dev>';

const SEVERITIES = ['Blocker', 'Major', 'Minor', 'Cosmetic'];

/** Field name -> label, max length. Order drives the email body. */
const FIELDS = [
  {name: 'title', label: 'Summary', max: 200, required: true},
  {name: 'severity', label: 'Severity', max: 32, required: true},
  {name: 'area', label: 'Area / module', max: 120},
  {name: 'description', label: 'Description', max: 8000, required: true},
  {name: 'steps', label: 'Steps to reproduce', max: 8000},
  {name: 'expected', label: 'Expected result', max: 2000},
  {name: 'actual', label: 'Actual result', max: 2000},
  {name: 'vrfVersion', label: 'VR Framework version', max: 80},
  {name: 'unityVersion', label: 'Unity version', max: 80},
  {name: 'platform', label: 'Headset / platform', max: 120},
  {name: 'reporter', label: 'Reported by', max: 200},
  {name: 'reporterEmail', label: 'Reporter email', max: 200},
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Crude per-instance throttle. Serverless instances are short-lived, so this
 *  only blunts a burst from one client - it is not a real rate limiter. */
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function throttled(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Method not allowed.'});
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('bug-report: RESEND_API_KEY is not set');
    return res.status(500).json({error: 'Bug reporting is not configured yet. Please email us directly.'});
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (throttled(ip)) {
    return res.status(429).json({error: 'Too many reports from this address. Try again in a minute.'});
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return res.status(400).json({error: 'Malformed request.'});
  }

  // Honeypot: a real browser leaves this hidden field empty. Answer 200 so a
  // bot cannot tell it was rejected.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return res.status(200).json({ok: true});
  }

  const values = {};
  for (const field of FIELDS) {
    const raw = typeof body[field.name] === 'string' ? body[field.name].trim() : '';
    if (field.required && !raw) {
      return res.status(400).json({error: `${field.label} is required.`});
    }
    if (raw.length > field.max) {
      return res.status(400).json({error: `${field.label} is too long (max ${field.max} characters).`});
    }
    values[field.name] = raw;
  }

  if (!SEVERITIES.includes(values.severity)) {
    return res.status(400).json({error: 'Unknown severity.'});
  }
  if (values.description.length < 20) {
    return res.status(400).json({error: 'Please describe the bug in a little more detail.'});
  }
  if (values.reporterEmail && !EMAIL_RE.test(values.reporterEmail)) {
    return res.status(400).json({error: 'That reporter email does not look valid.'});
  }

  const meta = [
    ['Submitted', new Date().toISOString()],
    ['User agent', String(req.headers['user-agent'] || '').slice(0, 300)],
    ['Page', String(body.pageUrl || '').slice(0, 300)],
  ];

  const rows = FIELDS.filter((f) => values[f.name]).map((f) => [f.label, values[f.name]]);

  const text = [...rows, ...meta]
    .map(([label, value]) => `${label}:\n${value}`)
    .join('\n\n');

  const html = [
    '<div style="font-family:ui-monospace,Consolas,monospace;font-size:14px;line-height:1.55;color:#2b2b2b">',
    ...[...rows, ...meta].map(
      ([label, value]) =>
        `<p style="margin:0 0 14px"><strong style="text-transform:uppercase;letter-spacing:.08em;font-size:11px;color:#757169">${escapeHtml(
          label,
        )}</strong><br>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`,
    ),
    '</div>',
  ].join('');

  const payload = {
    from: FROM,
    to: [TO],
    subject: `[VRF bug · ${values.severity}] ${values.title}`,
    text,
    html,
  };
  if (values.reporterEmail) payload.reply_to = values.reporterEmail;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('bug-report: Resend rejected the message', response.status, detail);
      return res.status(502).json({error: 'The report could not be delivered. Please try again later.'});
    }
  } catch (error) {
    console.error('bug-report: Resend request failed', error);
    return res.status(502).json({error: 'The report could not be delivered. Please try again later.'});
  }

  return res.status(200).json({ok: true});
};
