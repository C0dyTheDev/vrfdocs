#!/usr/bin/env node
/**
 * Generate the API reference in `api/` from the VR Framework C# sources.
 *
 * The sources are NOT part of this repo - they live in the Unity project
 * (`<UnityProject>/Assets/vrframework`) and stay there. This script reads them
 * in place:
 *
 *   1. finds every assembly definition inside the package (third-party plugins
 *      and test assemblies excluded) and maps it to the `.csproj` Unity
 *      generates for it in the Unity project root
 *   2. runs `docfx metadata` over those projects, which parses the C# with
 *      Roslyn - so XML doc comments, inherited members and resolved Unity types
 *      all come out correctly - into intermediate YAML under `.docfx/`
 *   3. converts that YAML into Docusaurus Markdown in `api/`
 *
 * The `api/` directory is fully owned by this script: it is wiped on every run.
 * Edit the C# doc comments, not the generated Markdown. The generated Markdown
 * IS committed, because the Vercel build has no access to the Unity project.
 *
 * Requirements:
 *   - .NET SDK 8 or newer
 *   - docfx:  dotnet tool install -g docfx
 *   - the Unity project opened at least once, so the `.csproj` files exist
 *
 * Usage:
 *   npm run gen:api
 *   npm run gen:api -- --source "C:/path/to/UnityProject/Assets/vrframework"
 *   VRF_SOURCE="C:/path/to/UnityProject/Assets/vrframework" npm run gen:api
 *
 * Or set the path once per machine in `api.config.json` (gitignored, see
 * `api.config.example.json`).
 */

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Output location inside the site, and the route the docs plugin serves it on. */
const OUT_DOCS = path.join(SITE_ROOT, 'api');
/**
 * Files in `api/` that this script does not own. Vercel only serves functions
 * from the repository-root `api/` directory, so the bug-report endpoint has to
 * live alongside the generated reference - and must survive a regeneration.
 */
const OUT_DOCS_KEEP = new Set(['bug-report.js']);

const ROUTE_BASE = '/api';

/** Scratch directory for the docfx config and its YAML output. Gitignored. */
const WORK_DIR = path.join(SITE_ROOT, '.docfx');

/** Path guesses used when nothing else says where the package lives. */
const SOURCE_GUESSES = [
  ['..', '..', '..', 'Unity Projects', 'VRF4.0_Core', 'Assets', 'vrframework'],
  ['..', 'VRF4.0_Core', 'Assets', 'vrframework'],
  ['..', '..', 'VRF4.0_Core', 'Assets', 'vrframework'],
];

/** Folders inside the package whose assemblies are never documented. */
const DEFAULT_EXCLUDES = ['ThirdPartyPlugins', 'Samples', 'Tests'];

/**
 * Sidebar order of the namespaces. Anything not listed lands after these,
 * alphabetically.
 */
const NAMESPACE_ORDER = ['VRFramework.Core.Runtime'];

/** Type sections on a namespace page, in render order. */
const TYPE_SECTIONS = [
  ['Class', 'Classes'],
  ['Struct', 'Structs'],
  ['Interface', 'Interfaces'],
  ['Enum', 'Enums'],
  ['Delegate', 'Delegates'],
];

/** Member sections, in render order. */
const MEMBER_SECTIONS = [
  ['Constructor', 'Constructors'],
  ['Field', 'Fields'],
  ['Property', 'Properties'],
  ['Method', 'Methods'],
  ['Operator', 'Operators'],
  ['Event', 'Events'],
];

const warnings = [];
const warn = (msg) => warnings.push(msg);

function readConfig() {
  const configPath = path.join(SITE_ROOT, 'api.config.json');
  if (!fs.existsSync(configPath)) return {};
  try {
    // `replace` strips a UTF-8 BOM - PowerShell's `Out-File -Encoding utf8`
    // writes one and JSON.parse chokes on it.
    const raw = fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
  } catch (error) {
    warn(`could not read api.config.json: ${error.message}`);
    return {};
  }
}

/**
 * Package root (the folder that holds `Runtime/` and `Editor/`), resolved in
 * this order:
 *   1. `--source <path>` on the command line
 *   2. the `VRF_SOURCE` environment variable
 *   3. `source` in `api.config.json` at the repo root (per machine, gitignored)
 *   4. the guesses above, relative to the repo
 */
function resolveSourceRoot(config) {
  const argIndex = process.argv.indexOf('--source');
  if (argIndex !== -1 && process.argv[argIndex + 1]) {
    return path.resolve(process.argv[argIndex + 1]);
  }
  if (process.env.VRF_SOURCE) return path.resolve(process.env.VRF_SOURCE);
  if (config.source) return path.resolve(SITE_ROOT, config.source);

  for (const guess of SOURCE_GUESSES) {
    const candidate = path.resolve(SITE_ROOT, ...guess);
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.resolve(SITE_ROOT, ...SOURCE_GUESSES[0]);
}

/** Walks up from the package until the folder that holds `Assets/`. */
function resolveUnityProject(sourceRoot, config) {
  if (config.unityProject) return path.resolve(SITE_ROOT, config.unityProject);
  let dir = sourceRoot;
  while (dir !== path.dirname(dir)) {
    if (path.basename(dir) === 'Assets') return path.dirname(dir);
    dir = path.dirname(dir);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

function yamlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Makes a string safe inside a Markdown table cell. */
function cell(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

/** Splits a uid parameter list on the commas that are not inside `{}` generics. */
function splitParameters(list) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of list) {
    if (char === '{' || char === '(') depth += 1;
    if (char === '}' || char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  if (current) parts.push(current);
  return parts;
}

/** Splits a member uid into its short name and its parameter type names. */
function memberParts(uid) {
  const open = uid.indexOf('(');
  const owner = open === -1 ? uid : uid.slice(0, open);
  const name = owner.slice(owner.lastIndexOf('.') + 1);
  if (open === -1) return {name, parameters: null};
  const list = uid.slice(open + 1, uid.lastIndexOf(')'));
  const parameters = list
    ? splitParameters(list).map((part) => part.replace(/[{}]/g, '.').split('.').filter(Boolean).pop())
    : [];
  return {name, parameters};
}

/** A stable heading anchor for a member, derived from its uid. */
function anchor(uid) {
  const {name, parameters} = memberParts(uid);
  return slugify(parameters?.length ? `${name}-${parameters.join('-')}` : name) || slugify(uid);
}

// ---------------------------------------------------------------------------
// Assembly discovery
// ---------------------------------------------------------------------------

/**
 * Every assembly definition under the package that should be documented,
 * paired with the `.csproj` Unity generated for it.
 */
function findProjects(sourceRoot, unityProject, excludes) {
  const found = [];
  walk(sourceRoot, (file) => {
    if (path.extname(file) !== '.asmdef') return;
    const rel = path.relative(sourceRoot, file);
    if (excludes.some((part) => rel.split(path.sep).includes(part))) return;

    let name;
    try {
      name = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')).name;
    } catch (error) {
      warn(`could not read ${rel}: ${error.message}`);
      return;
    }
    if (!name || /\.Tests?$/i.test(name)) return;

    const csproj = path.join(unityProject, `${name}.csproj`);
    if (!fs.existsSync(csproj)) {
      warn(`no ${name}.csproj in the Unity project - open Unity once to regenerate the C# projects`);
      return;
    }
    found.push({name, csproj});
  });
  return found.sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// docfx
// ---------------------------------------------------------------------------

function runDocfx(projects, ymlDir) {
  fs.rmSync(WORK_DIR, {recursive: true, force: true});
  fs.mkdirSync(WORK_DIR, {recursive: true});

  const configPath = path.join(WORK_DIR, 'docfx.json');
  const config = {
    metadata: [
      {
        src: projects.map((project) => ({
          files: [path.basename(project.csproj)],
          src: path.dirname(project.csproj).replace(/\\/g, '/'),
        })),
        dest: ymlDir.replace(/\\/g, '/'),
        // Unity writes the `<DefineConstants>` (UNITY_EDITOR and friends) into a
        // single `Debug|AnyCPU` property group and never generates a Release one,
        // so building the default Release configuration drops every define and
        // code behind `#if UNITY_EDITOR` disappears mid-compile.
        properties: {Configuration: 'Debug', Platform: 'AnyCPU'},
        // Public surface only - the API reference documents what consumers can
        // call, not the internals.
        filter: null,
        includePrivateMembers: false,
        disableDefaultFilter: false,
      },
    ],
  };
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  const docfx = process.env.DOCFX ?? (process.platform === 'win32' ? 'docfx.exe' : 'docfx');
  const result = spawnSync(docfx, ['metadata', configPath], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });

  if (result.error?.code === 'ENOENT') {
    console.error('docfx not found. Install it once with:\n  dotnet tool install -g docfx');
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(result.stdout ?? '');
    console.error(result.stderr ?? '');
    console.error('docfx metadata failed.');
    process.exit(result.status ?? 1);
  }
  for (const line of (result.stdout ?? '').split(/\r?\n/)) {
    // Keep the noise down: only surface docfx warnings and errors.
    if (/\b(warning|error)\b/i.test(line)) warn(`docfx: ${line.replace(/\u001b\[[0-9;]*m/g, '').trim()}`);
  }
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

const TYPE_KINDS = new Set(['Class', 'Struct', 'Interface', 'Enum', 'Delegate']);

function loadModel(ymlDir) {
  /** @type {Map<string, any>} uid -> item */
  const items = new Map();
  /** @type {Map<string, any>} uid -> reference */
  const references = new Map();

  for (const file of fs.readdirSync(ymlDir)) {
    if (path.extname(file) !== '.yml' || file === 'toc.yml') continue;
    const doc = YAML.parse(fs.readFileSync(path.join(ymlDir, file), 'utf8'));
    for (const item of doc.items ?? []) items.set(item.uid, item);
    for (const reference of doc.references ?? []) {
      if (!references.has(reference.uid)) references.set(reference.uid, reference);
    }
  }

  /** @type {Map<string, {name: string, types: any[], summary?: string}>} */
  const namespaces = new Map();
  /** @type {Map<string, {type: any, url: string}>} uid -> page */
  const pages = new Map();

  for (const item of items.values()) {
    if (item.type === 'Namespace') {
      const entry = namespaces.get(item.uid) ?? {name: item.uid, types: []};
      entry.summary = item.summary;
      namespaces.set(item.uid, entry);
      continue;
    }
    if (!TYPE_KINDS.has(item.type)) continue;

    const ns = item.namespace ?? 'Global';
    const entry = namespaces.get(ns) ?? {name: ns, types: []};
    entry.types.push(item);
    namespaces.set(ns, entry);
    pages.set(item.uid, {
      type: item,
      url: `${ROUTE_BASE}/${slugify(ns)}/${item.id}`,
    });
  }

  for (const entry of namespaces.values()) {
    entry.types.sort((a, b) => a.name.localeCompare(b.name));
  }

  return {items, references, namespaces, pages};
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

/** Link target for a uid: an internal page, a well-known external doc, or none. */
function linkFor(uid, model) {
  const page = model.pages.get(uid);
  if (page) return page.url;

  const owner = uid.includes('(') ? uid.slice(0, uid.indexOf('(')) : uid;
  const parentUid = owner.slice(0, owner.lastIndexOf('.'));
  const parentPage = model.pages.get(parentUid);
  if (parentPage) {
    // Only link to a member that is actually on the page - a cref can point at
    // an internal member, which the reference does not document.
    const member =
      model.items.get(uid) ??
      [...(parentPage.type.children ?? [])].find((child) => child.startsWith(`${owner}(`));
    return member ? `${parentPage.url}#${anchor(member.uid ?? member)}` : null;
  }

  if (/[{(`]/.test(uid)) return null;
  if (/^Unity(Engine|Editor)\./.test(uid)) {
    return `https://docs.unity3d.com/ScriptReference/${uid.split('.').slice(1).join('.')}.html`;
  }
  if (/^System\./.test(uid) || uid === 'System') {
    return `https://learn.microsoft.com/dotnet/api/${uid.toLowerCase()}`;
  }
  return null;
}

/** Renders a type reference as inline code, linked when we can resolve it. */
function typeLink(uid, model, {full = false} = {}) {
  if (!uid) return '';
  const reference = model.references.get(uid);
  const label = (full ? reference?.fullName : reference?.name) ?? reference?.name ?? uid;
  const code = `\`${label}\``;
  const href = linkFor(uid, model);
  return href ? `[${code}](${href})` : code;
}

// ---------------------------------------------------------------------------
// Doc comment text
// ---------------------------------------------------------------------------

/**
 * Turns a docfx doc-comment fragment into Markdown. docfx has already rewritten
 * `<see cref>` into `<xref>` elements, so links are resolved from uids here.
 */
function mdText(text, model) {
  if (!text) return '';
  let out = String(text);

  // `<see langword="null"/>` and friends
  out = out.replace(
    /<xref\s+[^>]*href="langword_csharp_([^"]+)"[^>]*>\s*<\/xref>/g,
    (_m, word) => `\`${word}\``,
  );
  out = out.replace(/<xref\s+[^>]*href="langword_csharp_([^"]*)"[^>]*\/>/g, (_m, word) => `\`${word}\``);

  // `<see cref="..."/>` -> link when the uid is something we document
  const xref = (uid) => {
    let decoded = uid;
    try {
      decoded = decodeURIComponent(uid);
    } catch {
      decoded = uid.replace(/%2A/gi, '*').replace(/%60/gi, '`');
    }
    // A `*` suffix is docfx's "all overloads of this member" uid.
    const clean = decoded.replace(/&amp;/g, '&').replace(/\*$/, '');
    const reference = model.references.get(clean);
    const {name, parameters} = memberParts(clean);
    const label = reference?.name ?? (parameters ? `${name}(${parameters.join(', ')})` : name);
    const href = linkFor(clean, model);
    return href ? `[\`${label}\`](${href})` : `\`${label}\``;
  };
  out = out.replace(/<xref\s+[^>]*href="([^"]+)"[^>]*>\s*<\/xref>/g, (_m, uid) => xref(uid));
  out = out.replace(/<xref\s+[^>]*href="([^"]+)"[^>]*\/>/g, (_m, uid) => xref(uid));

  // Block-level XML doc tags. Unity's own doc comments (which arrive here
  // through `<inheritdoc/>`) contain real HTML, and any HTML block left in the
  // output stops Markdown from being parsed inside it - which then turns a
  // generic like `Func<T, bool>` into an invalid tag at build time.
  out = out.replace(/<\/?(para|p|div)\s*\/?>/g, '\n\n');
  out = out.replace(/<br\s*\/?>/g, '\n');
  out = out.replace(/<\/?(ul|ol)\s*>/g, '\n\n');
  out = out.replace(/<li>([\s\S]*?)<\/li>/g, (_m, text) => `\n- ${text.trim()}`);
  out = out.replace(/<(b|strong)>([\s\S]*?)<\/\1>/g, (_m, _tag, text) => `**${text.trim()}**`);
  out = out.replace(/<(i|em)>([\s\S]*?)<\/\1>/g, (_m, _tag, text) => `*${text.trim()}*`);
  out = out.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, (_m, code) => `\n\n\`\`\`csharp\n${code.trim()}\n\`\`\`\n\n`);
  out = out.replace(/<code[^>]*>([\s\S]*?)<\/code>/g, (_m, code) =>
    code.includes('\n') ? `\n\n\`\`\`csharp\n${code.trim()}\n\`\`\`\n\n` : `\`${code.trim()}\``,
  );
  out = out.replace(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_m, href, label) => `[${label}](${href})`);

  // HTML entities docfx emits for `<`, `>` and `&` inside doc comments
  out = out.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

  return outsideCode(out.replace(/\n{3,}/g, '\n\n').trim(), (segment) =>
    // Doc comments keep the indentation they had in the `<summary>`; four
    // leading spaces would turn a paragraph into a code block.
    escapeAngles(segment.replace(/^[ \t]+/gm, '')),
  );
}

/** Applies `transform` to everything outside code spans and fenced blocks. */
function outsideCode(text, transform) {
  return text
    .split(/(```[\s\S]*?```|`[^`\n]*`)/g)
    .map((segment, index) => (index % 2 ? segment : transform(segment)))
    .join('');
}

/**
 * Escapes every `<` that survived tag conversion. Doc comments are full of
 * generics, and a bare `<T>` would otherwise be parsed as HTML.
 */
function escapeAngles(text) {
  return text.replace(/</g, '&lt;');
}

/** First sentence of a summary, for front matter `description`. */
function firstSentence(text) {
  if (!text) return '';
  const plain = text.replace(/[`*[\]()#]/g, '').replace(/\s+/g, ' ').trim();
  const stop = plain.indexOf('. ');
  return (stop === -1 ? plain : plain.slice(0, stop + 1)).slice(0, 180).trim();
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function sourceUrl(item, config) {
  const remote = item.source?.remote;
  if (!remote?.repo || !config.sourceUrlTemplate) return null;
  return config.sourceUrlTemplate
    .replace('{repo}', remote.repo.replace(/\.git$/, ''))
    .replace('{branch}', remote.branch ?? 'main')
    .replace('{path}', remote.path)
    .replace('{line}', String(item.source.startLine ?? 1));
}

function renderSyntax(item) {
  const content = item.syntax?.content;
  return content ? `\`\`\`csharp\n${content}\n\`\`\`\n` : '';
}

function renderParameters(item, model, {heading = '**Parameters**'} = {}) {
  const parameters = item.syntax?.parameters ?? [];
  if (!parameters.length) return '';
  const rows = parameters.map(
    (parameter) =>
      `| \`${cell(parameter.id)}\` | ${cell(typeLink(parameter.type, model))} | ${cell(mdText(parameter.description, model))} |`,
  );
  return `${heading}\n\n| Name | Type | Description |\n| --- | --- | --- |\n${rows.join('\n')}\n`;
}

function renderTypeParameters(item, model) {
  const typeParameters = item.syntax?.typeParameters ?? [];
  if (!typeParameters.length) return '';
  const rows = typeParameters.map(
    (parameter) => `| \`${cell(parameter.id)}\` | ${cell(mdText(parameter.description, model))} |`,
  );
  return `**Type parameters**\n\n| Name | Description |\n| --- | --- |\n${rows.join('\n')}\n`;
}

function renderReturns(item, model) {
  const value = item.syntax?.return;
  if (!value?.type) return '';
  const description = mdText(value.description, model);
  return `**Returns** ${typeLink(value.type, model)}${description ? ` - ${description}` : ''}\n`;
}

function renderExceptions(item, model) {
  const exceptions = item.exceptions ?? [];
  if (!exceptions.length) return '';
  const rows = exceptions.map(
    (exception) => `| ${cell(typeLink(exception.type, model))} | ${cell(mdText(exception.description, model))} |`,
  );
  return `**Exceptions**\n\n| Type | Condition |\n| --- | --- |\n${rows.join('\n')}\n`;
}

function renderRemarks(item, model) {
  const remarks = mdText(item.remarks, model);
  return remarks ? `**Remarks**\n\n${remarks}\n` : '';
}

function renderExample(item, model) {
  const examples = (Array.isArray(item.example) ? item.example : [item.example]).filter(Boolean);
  if (!examples.length) return '';
  return `**Examples**\n\n${examples.map((example) => mdText(example, model)).join('\n\n')}\n`;
}

function renderMember(member, model, config) {
  const parts = [`### ${member.name.replace(/</g, '\\<')} {#${anchor(member.uid)}}\n`];

  const summary = mdText(member.summary, model);
  if (summary) parts.push(`${summary}\n`);
  parts.push(renderSyntax(member));
  parts.push(renderTypeParameters(member, model));
  parts.push(renderParameters(member, model));
  parts.push(renderReturns(member, model));
  parts.push(renderExceptions(member, model));
  parts.push(renderRemarks(member, model));
  parts.push(renderExample(member, model));

  const source = sourceUrl(member, config);
  if (source) parts.push(`[View source](${source})\n`);

  return parts.filter(Boolean).join('\n');
}

function renderEnumFields(members, model) {
  if (!members.length) return '';

  // A heading per value rather than a table row, because a heading is the only thing
  // Docusaurus counts as an anchor: `<see cref="HandFilter.Either" />` resolves to this
  // page plus `#either`, and an id written into a table cell survives into the HTML but
  // is not registered, so the link is reported broken on every build.
  const sections = members.map((member) => {
    const value = member.syntax?.content?.match(/=\s*(.+)$/)?.[1]?.trim();
    const summary = mdText(member.summary, model);

    return [
      `### ${member.name} {#${anchor(member.uid)}}\n`,
      value ? `\`${member.name} = ${value}\`\n` : '',
      summary ? `${summary}\n` : '',
    ]
      .filter(Boolean)
      .join('\n');
  });

  return `## Fields\n\n${sections.join('\n')}`;
}

function renderTypePage(type, model, config) {
  const members = (type.children ?? [])
    .map((uid) => model.items.get(uid))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  const summary = mdText(type.summary, model);
  const front = [
    '---',
    `id: ${type.id}`,
    `title: ${yamlString(`${type.name} ${type.type.toLowerCase()}`)}`,
    `sidebar_label: ${yamlString(type.name)}`,
  ];
  const description = firstSentence(summary);
  if (description) front.push(`description: ${yamlString(description)}`);
  front.push('# Generated by scripts/gen-api.mjs - edit the C# doc comments instead.');
  front.push('---');

  const parts = [front.join('\n'), `\n# ${type.name.replace(/</g, '\\<')}\n`];

  const facts = [`**${type.type}**`, `namespace \`${type.namespace}\``];
  if (type.assemblies?.length) facts.push(`assembly \`${type.assemblies[0]}\``);
  const source = sourceUrl(type, config);
  if (source) facts.push(`[view source](${source})`);
  parts.push(`${facts.join(' · ')}\n`);

  if (summary) parts.push(`${summary}\n`);
  parts.push(renderSyntax(type));

  if (type.inheritance?.length) {
    const chain = [...type.inheritance, type.uid].map((uid) =>
      uid === type.uid ? `\`${type.name}\`` : typeLink(uid, model),
    );
    parts.push(`**Inheritance:** ${chain.join(' ← ')}\n`);
  }
  if (type.implements?.length) {
    parts.push(`**Implements:** ${type.implements.map((uid) => typeLink(uid, model)).join(', ')}\n`);
  }
  if (type.derivedClasses?.length) {
    const derived = type.derivedClasses.filter((uid) => model.pages.has(uid));
    if (derived.length) {
      parts.push(`**Derived:** ${derived.map((uid) => typeLink(uid, model)).join(', ')}\n`);
    }
  }

  parts.push(renderTypeParameters(type, model));
  parts.push(renderRemarks(type, model));
  parts.push(renderExample(type, model));

  if (type.type === 'Enum') {
    parts.push(renderEnumFields(members, model));
  } else if (type.type === 'Delegate') {
    parts.push(renderParameters(type, model));
    parts.push(renderReturns(type, model));
  } else {
    for (const [kind, heading] of MEMBER_SECTIONS) {
      const section = members.filter((member) => member.type === kind);
      if (!section.length) continue;
      parts.push(`## ${heading}\n`);
      for (const member of section) parts.push(renderMember(member, model, config));
    }
  }

  return `${parts.filter(Boolean).join('\n').replace(/\n{3,}/g, '\n\n')}\n`;
}

function renderNamespacePage(entry, model) {
  const front = [
    '---',
    'id: index',
    `title: ${yamlString(entry.name)}`,
    'sidebar_label: Overview',
    'sidebar_position: 0',
    '# Generated by scripts/gen-api.mjs - edit the C# doc comments instead.',
    '---',
  ];
  const parts = [front.join('\n'), `\n# ${entry.name}\n`];
  const summary = mdText(entry.summary, model);
  if (summary) parts.push(`${summary}\n`);

  for (const [kind, heading] of TYPE_SECTIONS) {
    const section = entry.types.filter((type) => type.type === kind);
    if (!section.length) continue;
    const rows = section.map(
      (type) =>
        `| [\`${cell(type.name)}\`](${model.pages.get(type.uid).url}) | ${cell(firstSentence(mdText(type.summary, model)))} |`,
    );
    parts.push(`## ${heading}\n`);
    parts.push(`| Name | Summary |\n| --- | --- |\n${rows.join('\n')}\n`);
  }

  return `${parts.join('\n')}\n`;
}

function renderIndexPage(namespaces, model) {
  const front = [
    '---',
    'id: index',
    'title: API Reference',
    'slug: /',
    'sidebar_position: 0',
    'sidebar_label: Overview',
    '# Generated by scripts/gen-api.mjs - edit the C# doc comments instead.',
    '---',
  ];
  const parts = [
    front.join('\n'),
    '\n# API Reference\n',
    'Generated from the VR Framework C# sources. Every page here mirrors the doc',
    'comments in the package - fix a description by editing the source, then run',
    '`npm run gen:api`.\n',
    '| Namespace | Types |',
    '| --- | --- |',
  ];
  for (const entry of namespaces) {
    parts.push(`| [${cell(entry.name)}](${ROUTE_BASE}/${slugify(entry.name)}) | ${entry.types.length} |`);
  }
  return `${parts.join('\n')}\n`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------


/** Removes everything this script generated, keeping `OUT_DOCS_KEEP` intact. */
function clearGeneratedDocs() {
  if (!fs.existsSync(OUT_DOCS)) return;
  for (const entry of fs.readdirSync(OUT_DOCS)) {
    if (OUT_DOCS_KEEP.has(entry)) continue;
    fs.rmSync(path.join(OUT_DOCS, entry), {recursive: true, force: true});
  }
}

function main() {
  const config = readConfig();
  const sourceRoot = resolveSourceRoot(config);

  if (!fs.existsSync(sourceRoot)) {
    console.error(`VR Framework package not found: ${sourceRoot}`);
    console.error('Point the script at it with one of:');
    console.error('  npm run gen:api -- --source "<path to Assets/vrframework>"');
    console.error('  set VRF_SOURCE=<path>');
    console.error('  copy api.config.example.json to api.config.json and edit it');
    process.exit(1);
  }

  const unityProject = resolveUnityProject(sourceRoot, config);
  if (!unityProject) {
    console.error(`Could not find the Unity project root above ${sourceRoot}.`);
    console.error('Set "unityProject" in api.config.json.');
    process.exit(1);
  }

  const excludes = config.exclude ?? DEFAULT_EXCLUDES;
  const projects = findProjects(sourceRoot, unityProject, excludes);
  if (!projects.length) {
    console.error(`No assembly definitions to document under ${sourceRoot}.`);
    if (warnings.length) for (const message of warnings) console.error(`  - ${message}`);
    process.exit(1);
  }

  const ymlDir = path.join(WORK_DIR, 'yml');
  console.log(`Package:    ${sourceRoot}`);
  console.log(`Unity:      ${unityProject}`);
  console.log(`Assemblies: ${projects.map((project) => project.name).join(', ')}`);
  runDocfx(projects, ymlDir);

  const model = loadModel(ymlDir);
  const namespaces = [...model.namespaces.values()]
    .filter((entry) => entry.types.length)
    .sort((a, b) => {
      const rank = (name) => {
        const index = NAMESPACE_ORDER.indexOf(name);
        return index === -1 ? NAMESPACE_ORDER.length : index;
      };
      return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name);
    });

  clearGeneratedDocs();
  fs.mkdirSync(OUT_DOCS, {recursive: true});
  fs.writeFileSync(path.join(OUT_DOCS, 'index.md'), renderIndexPage(namespaces, model), 'utf8');

  let typeCount = 0;
  namespaces.forEach((entry, index) => {
    const dir = path.join(OUT_DOCS, slugify(entry.name));
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(
      path.join(dir, '_category_.json'),
      `${JSON.stringify(
        {
          label: entry.name.replace(/^VRFramework\./, ''),
          position: index + 1,
          link: {type: 'doc', id: `${slugify(entry.name)}/index`},
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
    fs.writeFileSync(path.join(dir, 'index.md'), renderNamespacePage(entry, model), 'utf8');
    for (const type of entry.types) {
      fs.writeFileSync(path.join(dir, `${type.id}.md`), renderTypePage(type, model, config), 'utf8');
      typeCount += 1;
    }
  });

  console.log(`Types:      ${typeCount} in ${namespaces.length} namespace(s) -> ${path.relative(SITE_ROOT, OUT_DOCS)}`);
  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const message of warnings) console.log(`  - ${message}`);
  }
}

main();
