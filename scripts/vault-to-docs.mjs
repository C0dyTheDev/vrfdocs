#!/usr/bin/env node
/**
 * Normalise the Obsidian vault in `tutorials/` into what Docusaurus wants.
 *
 * `tutorials/` *is* the vault - Obsidian opens it directly - so this script edits
 * the notes in place rather than copying them anywhere. Write a note however
 * Obsidian likes, run this, and the same file is a valid Docusaurus doc:
 *
 *   - front matter gains the `id`, `title` and `sidebar_label` the sidebar needs,
 *     and loses the Obsidian-only keys (`dg-*`, `publish`, `cssclasses`, ...)
 *   - `[[wikilinks]]`, `[[wikilinks|aliases]]` and `[[note#heading]]` become real
 *     `/tutorials/...` links
 *   - `![[embeds]]` (with an optional `|width`) become image tags, and the
 *     attachment is copied out of the vault into `static/img/vault/`
 *   - every folder gets a `_category_.json` so the sidebar keeps its order
 *
 * Nothing is ever deleted: a note this script does not understand is left alone
 * and reported. Attachments are copied, not moved, unless you pass `--move`.
 *
 * Usage:
 *   npm run docs:normalize            # fix the notes in place
 *   npm run docs:normalize -- --check # report only, non-zero exit if work is due
 *   npm run docs:normalize -- --move  # also remove the attachment from the vault
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');

/** The vault, which is also the docs folder of the `tutorials` plugin. */
const DOCS = path.join(SITE_ROOT, 'tutorials');

/** Where attachments end up, and the URL they are served from. */
const ASSETS = path.join(SITE_ROOT, 'static', 'img', 'vault');
const ASSET_URL = '/img/vault';

/** `routeBasePath` of the tutorials docs plugin. */
const ROUTE_BASE = '/tutorials';

/** Sidebar order of the top-level folders. Anything else lands after them. */
const CATEGORY_ORDER = ['Getting Started', 'Modules', 'Additions', 'Onboarding'];

/** Folders inside the vault that are not documentation. */
const IGNORED_DIRS = new Set(['.obsidian', '.trash', 'templates']);

/** Front matter Docusaurus understands, and that a note may set for itself. */
const KEEP_KEYS = new Set([
  'id',
  'title',
  'sidebar_label',
  'sidebar_position',
  'sidebar_class_name',
  'slug',
  'description',
  'tags',
  'keywords',
  'image',
  'draft',
  'unlisted',
  'pagination_label',
  'pagination_next',
  'pagination_prev',
  'hide_title',
  'hide_table_of_contents',
]);

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.ogv']);

const CHECK_ONLY = process.argv.includes('--check');
const MOVE_ASSETS = process.argv.includes('--move');

const notes = [];
const warnings = [];
const changed = [];
const copiedAssets = new Set();

const warn = (message) => warnings.push(message);

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), onFile);
    } else {
      onFile(path.join(dir, entry.name));
    }
  }
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['"]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function titleCase(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function yamlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Flat `key: value` front matter, which is all a note here uses. */
function splitFrontmatter(raw) {
  if (!raw.startsWith('---')) return {data: {}, body: raw, had: false};

  const end = raw.indexOf('\n---', 3);
  if (end === -1) return {data: {}, body: raw, had: false};

  const block = raw.slice(4, end);
  const body = raw.slice(raw.indexOf('\n', end + 1) + 1);
  const data = {};

  for (const line of block.split(/\r?\n/)) {
    const match = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1);
    }

    data[match[1]] = value;
  }

  return {data, body, had: true};
}

// ---------------------------------------------------------------------------
// Indexing
// ---------------------------------------------------------------------------

/** Every file in the vault that is not a note, so embeds can find attachments. */
function indexAttachments() {
  const byName = new Map();

  walk(DOCS, (file) => {
    if (path.extname(file).toLowerCase() === '.md') return;
    if (path.basename(file) === '_category_.json') return;

    const key = path.basename(file).toLowerCase();
    if (!byName.has(key)) byName.set(key, file);
  });

  // Anything already published stays findable, so re-running is a no-op.
  if (fs.existsSync(ASSETS)) {
    for (const file of fs.readdirSync(ASSETS)) {
      const key = file.toLowerCase();
      if (!byName.has(key)) byName.set(key, path.join(ASSETS, file));
    }
  }

  return byName;
}

function indexNotes() {
  walk(DOCS, (file) => {
    if (path.extname(file).toLowerCase() !== '.md') return;

    const raw = fs.readFileSync(file, 'utf8');
    const {data, body, had} = splitFrontmatter(raw);
    const rel = path.relative(DOCS, file).split(path.sep).join('/');
    const isHome = rel === 'index.md';
    const slug = path.basename(file, '.md');
    const dir = path.dirname(rel) === '.' ? '' : path.dirname(rel);

    notes.push({
      file,
      raw,
      data,
      body,
      hadFrontmatter: had,
      rel,
      dir,
      slug,
      isHome,
      url: isHome ? ROUTE_BASE : `${ROUTE_BASE}/${dir ? `${dir}/` : ''}${slug}`,
    });
  });

  const byName = new Map();

  for (const note of notes) {
    for (const key of [note.slug, note.data.title, note.data.sidebar_label]) {
      if (!key) continue;
      const lower = String(key).toLowerCase();
      if (!byName.has(lower)) byName.set(lower, note);
    }
  }

  return byName;
}

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

function publishAsset(name, attachments) {
  const found = attachments.get(name.toLowerCase());

  if (!found) {
    warn(`missing attachment: ${name}`);
    return false;
  }

  const target = path.join(ASSETS, path.basename(found));

  if (path.resolve(found) !== path.resolve(target)) {
    if (!CHECK_ONLY) {
      fs.mkdirSync(ASSETS, {recursive: true});
      fs.copyFileSync(found, target);
      if (MOVE_ASSETS) fs.rmSync(found);
    }
    copiedAssets.add(path.basename(found));
  }

  return true;
}

function convertEmbed(target, attachments) {
  const [rawName, rawSize] = target.split('|').map((part) => part.trim());
  const extension = path.extname(rawName).toLowerCase();

  if (!publishAsset(rawName, attachments)) return `<!-- missing attachment: ${rawName} -->`;

  const url = `${ASSET_URL}/${encodeURI(path.basename(rawName))}`;
  const alt = path.basename(rawName, extension).replace(/[-_]+/g, ' ');

  if (VIDEO_EXTENSIONS.has(extension)) {
    return `<video controls src="${url}"${rawSize ? ` width="${rawSize}"` : ''}></video>`;
  }

  if (!IMAGE_EXTENSIONS.has(extension)) return `[${alt}](${url})`;

  if (rawSize && /^\d+$/.test(rawSize)) {
    return `<img src="${url}" alt="${alt}" width="${rawSize}" />`;
  }

  return `![${alt}](${url})`;
}

function convertBody(note, byName, attachments) {
  let out = note.body;

  // ![[attachment]] and ![[attachment|width]]
  out = out.replace(/!\[\[([^\]]+)\]\]/g, (_match, target) => convertEmbed(target, attachments));

  // [[Note]], [[Note|Alias]], [[Note#Heading|Alias]]
  out = out.replace(/\[\[([^\]]+)\]\]/g, (_match, target) => {
    const [linkPart, alias] = target.split('|').map((part) => part.trim());
    const [notePart, heading] = linkPart.split('#').map((part) => part.trim());
    const hit = byName.get(notePart.toLowerCase()) ?? byName.get(slugify(notePart));

    if (!hit) {
      warn(`unresolved wikilink [[${target}]] in ${note.rel} - left as plain text`);
      return alias || notePart;
    }

    return `[${alias || notePart}](${hit.url}${heading ? `#${slugify(heading)}` : ''})`;
  });

  // A relative image the way Obsidian writes it once the file is in a subfolder.
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    if (/^(https?:|\/|data:)/.test(url)) return match;

    const name = path.basename(decodeURI(url));
    if (!publishAsset(name, attachments)) return match;

    return `![${alt}](${ASSET_URL}/${encodeURI(name)})`;
  });

  return out;
}

function renderFrontmatter(note) {
  const data = {...note.data};

  // What Obsidian and its publish plugins leave behind.
  for (const key of Object.keys(data)) {
    if (key.startsWith('dg-') || !KEEP_KEYS.has(key)) delete data[key];
  }

  const title = data.title || note.data.title || firstHeading(note.body) || titleCase(note.slug);

  const lines = ['---'];
  lines.push(`id: ${note.isHome ? 'index' : note.slug}`);
  lines.push(`title: ${yamlString(title)}`);
  lines.push(`sidebar_label: ${yamlString(data.sidebar_label || title)}`);

  if (note.isHome) {
    lines.push('slug: /');
    lines.push('sidebar_position: 0');
  }

  for (const [key, value] of Object.entries(data)) {
    if (key === 'id' || key === 'title' || key === 'sidebar_label') continue;
    if (note.isHome && (key === 'slug' || key === 'sidebar_position')) continue;
    lines.push(`${key}: ${yamlString(value)}`);
  }

  lines.push('---');
  return lines.join('\n');
}

function firstHeading(body) {
  const match = /^#\s+(.+)$/m.exec(body);
  return match ? match[1].trim() : null;
}

function writeCategoryFiles() {
  for (const entry of fs.readdirSync(DOCS, {withFileTypes: true})) {
    if (!entry.isDirectory() || IGNORED_DIRS.has(entry.name)) continue;

    const label = titleCase(entry.name);
    const position = CATEGORY_ORDER.indexOf(label);
    const file = path.join(DOCS, entry.name, '_category_.json');

    const category = {
      label,
      position: position === -1 ? CATEGORY_ORDER.length + 1 : position + 1,
      link: {type: 'generated-index', title: label},
    };

    const contents = `${JSON.stringify(category, null, 2)}\n`;
    const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;

    if (before === contents) continue;

    changed.push(path.relative(SITE_ROOT, file));
    if (!CHECK_ONLY) fs.writeFileSync(file, contents, 'utf8');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(DOCS)) {
    console.error(`No tutorials folder at ${DOCS}`);
    process.exit(1);
  }

  const attachments = indexAttachments();
  const byName = indexNotes();

  for (const note of notes) {
    const body = convertBody(note, byName, attachments);
    const contents = `${renderFrontmatter(note)}\n\n${body.trimStart().trimEnd()}\n`;

    if (contents === note.raw) continue;

    changed.push(note.rel);
    if (!CHECK_ONLY) fs.writeFileSync(note.file, contents, 'utf8');
  }

  writeCategoryFiles();

  console.log(`Vault:       ${path.relative(SITE_ROOT, DOCS)} (${notes.length} notes)`);
  console.log(`Attachments: ${copiedAssets.size} published to ${path.relative(SITE_ROOT, ASSETS)}`);
  console.log(
    CHECK_ONLY
      ? `Would change: ${changed.length}`
      : `Changed:     ${changed.length}`,
  );

  for (const file of changed) console.log(`  ${file}`);

  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const message of warnings) console.log(`  - ${message}`);
  }

  if (CHECK_ONLY && changed.length) {
    console.log('\nRun `npm run docs:normalize` and commit the result.');
    process.exit(1);
  }
}

main();
