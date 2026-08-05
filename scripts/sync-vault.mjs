#!/usr/bin/env node
/**
 * Sync the Obsidian vault tutorials into the Docusaurus `tutorials/` section.
 *
 * What it does:
 *   - copies every note under VAULT_DOCS into `tutorials/`, kebab-cased
 *   - rewrites Obsidian front matter (drops the `dg-*` digital-garden keys) and
 *     adds `title` / `sidebar_position`
 *   - rewrites `[[wikilinks]]` and `[[wikilinks|aliases]]` to Docusaurus links
 *   - rewrites `![[embeds]]` (with optional `|width`) to real image references
 *     and copies the referenced attachments into `static/img/vault/`
 *   - writes a `_category_.json` per folder so the sidebar keeps a sane order
 *
 * The `tutorials/` directory is fully owned by this script: it is wiped on every
 * run. Edit the notes in the vault, not the generated Markdown.
 *
 * Usage:
 *   npm run sync:vault
 *   npm run sync:vault -- --vault "D:/path/to/obsidian_vault/VRFramework"
 *   VRF_VAULT="D:/path/to/obsidian_vault/VRFramework" npm run sync:vault
 *
 * Or set the path once per machine in `vault.config.json` (gitignored, see
 * `vault.config.example.json`).
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Vault root (the folder that holds `web/` and `img/`), resolved in this order:
 *   1. `--vault <path>` on the command line
 *   2. the `VRF_VAULT` environment variable
 *   3. `vault` in `vault.config.json` at the repo root (per machine, gitignored)
 *   4. the guesses below, relative to the repo
 */
const VAULT_GUESSES = [
  ['..', 'obsidian_vault', 'VRFramework'],
  ['..', '..', 'obsidian_vault', 'VRFramework'],
  ['..', '..', '!!CIE WORK', 'VRF', 'obsidian_vault', 'VRFramework'],
];

function readVaultConfig() {
  const configPath = path.join(SITE_ROOT, 'vault.config.json');
  if (!fs.existsSync(configPath)) return null;
  try {
    // `replace` strips a UTF-8 BOM - PowerShell's `Out-File -Encoding utf8`
    // writes one and JSON.parse chokes on it.
    const raw = fs.readFileSync(configPath, 'utf8').replace(/^﻿/, '');
    const {vault} = JSON.parse(raw);
    return vault ? path.resolve(SITE_ROOT, vault) : null;
  } catch (error) {
    warn(`could not read vault.config.json: ${error.message}`);
    return null;
  }
}

function resolveVaultRoot() {
  const argIndex = process.argv.indexOf('--vault');
  if (argIndex !== -1 && process.argv[argIndex + 1]) {
    return path.resolve(process.argv[argIndex + 1]);
  }
  if (process.env.VRF_VAULT) return path.resolve(process.env.VRF_VAULT);

  const fromConfig = readVaultConfig();
  if (fromConfig) return fromConfig;

  for (const guess of VAULT_GUESSES) {
    const candidate = path.resolve(SITE_ROOT, ...guess);
    if (fs.existsSync(path.join(candidate, NOTES_SUBDIR))) return candidate;
  }
  return path.resolve(SITE_ROOT, ...VAULT_GUESSES[0]);
}

/** Folder inside the vault that holds the publishable notes. */
const NOTES_SUBDIR = 'web';

/** Folders inside the vault that are searched for attachments. */
const ATTACHMENT_SUBDIRS = ['img'];

/** Output locations inside the site. */
const OUT_DOCS = path.join(SITE_ROOT, 'tutorials');
const OUT_ASSETS = path.join(SITE_ROOT, 'static', 'img', 'vault');
const ASSET_URL_BASE = '/img/vault';

/** Route prefix of the tutorials docs plugin (`routeBasePath`). */
const ROUTE_BASE = '/tutorials';

/**
 * Sidebar order of the top-level folders. Anything not listed lands after these,
 * alphabetically.
 */
const CATEGORY_ORDER = ['Getting Started', 'Modules', 'Additions', 'Onboarding'];

/**
 * Notes that should become the section landing page (`/tutorials`).
 * Matched against the note name without its numeric Obsidian sort prefix.
 */
const HOME_NOTES = new Set(['VR Framework Docs']);

/** Front matter keys copied through from the vault. Everything else is dropped. */
const KEEP_FRONTMATTER_KEYS = new Set(['title', 'description', 'tags', 'draft']);

const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.avif',
]);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.ogv']);

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const warnings = [];
const warn = (msg) => warnings.push(msg);

/** Strips an Obsidian ordering prefix such as the `1` in `1VR Framework Docs`. */
function stripSortPrefix(name) {
  const match = /^(\d+)[\s._-]*(.+)$/.exec(name);
  if (!match) return {order: null, name};
  return {order: Number(match[1]), name: match[2]};
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, onFile);
    else onFile(full);
  }
}

/** Very small front matter reader - the vault only uses flat `key: value`. */
function splitFrontmatter(raw) {
  if (!raw.startsWith('---')) return {data: {}, body: raw};
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return {data: {}, body: raw};
  const block = raw.slice(4, end);
  const body = raw.slice(raw.indexOf('\n', end + 1) + 1);
  const data = {};
  for (const line of block.split(/\r?\n/)) {
    const match = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[match[1]] = value;
  }
  return {data, body};
}

function yamlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

// ---------------------------------------------------------------------------
// Vault indexing
// ---------------------------------------------------------------------------

function indexAttachments(vaultRoot) {
  /** @type {Map<string, string>} lowercased file name -> absolute path */
  const byName = new Map();
  for (const sub of ATTACHMENT_SUBDIRS) {
    const dir = path.join(vaultRoot, sub);
    if (!fs.existsSync(dir)) continue;
    walk(dir, (file) => {
      const key = path.basename(file).toLowerCase();
      if (!byName.has(key)) byName.set(key, file);
    });
  }
  return byName;
}

function indexNotes(notesRoot) {
  /** @type {Array<{source: string, relDir: string, noteName: string, order: number|null}>} */
  const notes = [];
  walk(notesRoot, (file) => {
    if (path.extname(file).toLowerCase() !== '.md') return;
    const rel = path.relative(notesRoot, file);
    const relDir = path.dirname(rel) === '.' ? '' : path.dirname(rel);
    const {order, name} = stripSortPrefix(path.basename(file, '.md'));
    notes.push({source: file, relDir, noteName: name, order});
  });
  return notes;
}

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

function buildPlan(notes) {
  /** @type {Map<string, {docUrl: string, outPath: string, title: string}>} */
  const byNoteName = new Map();
  const plan = [];

  for (const note of notes) {
    const isHome = HOME_NOTES.has(note.noteName) && note.relDir === '';
    const slug = slugify(note.noteName);
    const outDir = path.join(OUT_DOCS, ...note.relDir.split(path.sep).filter(Boolean).map(slugify));
    const outPath = isHome
      ? path.join(OUT_DOCS, 'index.md')
      : path.join(outDir, `${slug}.md`);

    const routeDir = note.relDir
      ? note.relDir.split(path.sep).filter(Boolean).map(slugify).join('/')
      : '';
    const docUrl = isHome
      ? ROUTE_BASE
      : `${ROUTE_BASE}/${routeDir ? `${routeDir}/` : ''}${slug}`;

    const entry = {...note, isHome, slug, outPath, docUrl};
    plan.push(entry);

    if (byNoteName.has(note.noteName)) {
      warn(`duplicate note name "${note.noteName}" - wikilinks to it are ambiguous`);
    } else {
      byNoteName.set(note.noteName, entry);
    }
  }

  return {plan, byNoteName};
}

function convertEmbed(target, attachments, usedAssets) {
  const [rawName, rawSize] = target.split('|').map((part) => part.trim());
  const ext = path.extname(rawName).toLowerCase();
  const found = attachments.get(rawName.toLowerCase());

  if (!found) {
    warn(`missing attachment: ${rawName}`);
    return `<!-- missing attachment: ${rawName} -->`;
  }

  usedAssets.set(rawName, found);
  const url = `${ASSET_URL_BASE}/${encodeURI(rawName)}`;
  const alt = path.basename(rawName, ext).replace(/[-_]+/g, ' ');

  if (VIDEO_EXTENSIONS.has(ext)) {
    return `<video controls src="${url}"${rawSize ? ` width="${rawSize}"` : ''}></video>`;
  }
  if (!IMAGE_EXTENSIONS.has(ext)) {
    return `[${alt}](${url})`;
  }
  if (rawSize && /^\d+$/.test(rawSize)) {
    return `<img src="${url}" alt="${alt}" width="${rawSize}" />`;
  }
  return `![${alt}](${url})`;
}

function convertBody(body, ctx) {
  const {attachments, byNoteName, usedAssets, sourceLabel} = ctx;

  // `![[attachment]]` / `![[attachment|width]]`
  let out = body.replace(/!\[\[([^\]]+)\]\]/g, (_m, target) =>
    convertEmbed(target, attachments, usedAssets),
  );

  // `[[Note]]` / `[[Note|Alias]]` / `[[Note#Heading|Alias]]`
  out = out.replace(/\[\[([^\]]+)\]\]/g, (_m, target) => {
    const [linkPart, alias] = target.split('|').map((part) => part.trim());
    const [notePart, heading] = linkPart.split('#').map((part) => part.trim());
    const {name} = stripSortPrefix(notePart);
    const label = alias || notePart;
    const hit = byNoteName.get(name) ?? byNoteName.get(notePart);
    if (!hit) {
      warn(`unresolved wikilink [[${target}]] in ${sourceLabel} - rendered as plain text`);
      return label;
    }
    const anchor = heading ? `#${slugify(heading)}` : '';
    return `[${label}](${hit.docUrl}${anchor})`;
  });

  return out;
}

function renderFrontmatter(entry, data) {
  const lines = ['---'];
  lines.push(`id: ${entry.isHome ? 'index' : entry.slug}`);
  lines.push(`title: ${yamlString(data.title || entry.noteName)}`);
  lines.push(`sidebar_label: ${yamlString(entry.noteName)}`);
  if (entry.isHome) {
    lines.push('slug: /');
    lines.push('sidebar_position: 0');
  } else if (entry.order !== null) {
    lines.push(`sidebar_position: ${entry.order}`);
  }
  for (const [key, value] of Object.entries(data)) {
    if (key === 'title' || !KEEP_FRONTMATTER_KEYS.has(key)) continue;
    lines.push(`${key}: ${yamlString(value)}`);
  }
  lines.push('# Generated by scripts/sync-vault.mjs - edit the Obsidian note instead.');
  lines.push('---');
  return lines.join('\n');
}

function writeCategoryFiles(notesRoot) {
  const dirs = fs
    .readdirSync(notesRoot, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const dir of dirs) {
    const position = CATEGORY_ORDER.indexOf(dir);
    const outDir = path.join(OUT_DOCS, slugify(dir));
    if (!fs.existsSync(outDir)) continue;
    const category = {
      label: dir,
      position: position === -1 ? CATEGORY_ORDER.length + 1 : position + 1,
      link: {type: 'generated-index', title: dir},
    };
    fs.writeFileSync(
      path.join(outDir, '_category_.json'),
      `${JSON.stringify(category, null, 2)}\n`,
      'utf8',
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const vaultRoot = resolveVaultRoot();
  const notesRoot = path.join(vaultRoot, NOTES_SUBDIR);

  if (!fs.existsSync(notesRoot)) {
    console.error(`Vault notes folder not found: ${notesRoot}`);
    console.error('Point the script at the vault with one of:');
    console.error('  npm run sync:vault -- --vault "<path to obsidian_vault/VRFramework>"');
    console.error('  set VRF_VAULT=<path>');
    console.error('  copy vault.config.example.json to vault.config.json and edit it');
    process.exit(1);
  }

  const attachments = indexAttachments(vaultRoot);
  const notes = indexNotes(notesRoot);
  const {plan, byNoteName} = buildPlan(notes);

  fs.rmSync(OUT_DOCS, {recursive: true, force: true});
  fs.rmSync(OUT_ASSETS, {recursive: true, force: true});
  fs.mkdirSync(OUT_DOCS, {recursive: true});
  fs.mkdirSync(OUT_ASSETS, {recursive: true});

  const usedAssets = new Map();

  for (const entry of plan) {
    const raw = fs.readFileSync(entry.source, 'utf8');
    const {data, body} = splitFrontmatter(raw);
    const converted = convertBody(body, {
      attachments,
      byNoteName,
      usedAssets,
      sourceLabel: path.relative(notesRoot, entry.source),
    });
    const contents = `${renderFrontmatter(entry, data)}\n\n${converted.trimStart()}\n`;
    fs.mkdirSync(path.dirname(entry.outPath), {recursive: true});
    fs.writeFileSync(entry.outPath, contents, 'utf8');
  }

  for (const [name, source] of usedAssets) {
    fs.copyFileSync(source, path.join(OUT_ASSETS, name));
  }

  writeCategoryFiles(notesRoot);

  console.log(`Vault:      ${vaultRoot}`);
  console.log(`Notes:      ${plan.length} -> ${path.relative(SITE_ROOT, OUT_DOCS)}`);
  console.log(`Attachments:${String(usedAssets.size).padStart(4)} -> ${path.relative(SITE_ROOT, OUT_ASSETS)}`);
  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const message of warnings) console.log(`  - ${message}`);
  }
}

main();
