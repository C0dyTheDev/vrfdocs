# VR Framework Docs

Documentation site for the VR Framework, built with
[Docusaurus 3](https://docusaurus.io/).

The site has two documentation sections:

| Section | Route | Source directory | Where the content comes from |
| --- | --- | --- | --- |
| Tutorials | `/tutorials` | `tutorials/` | Generated from the Obsidian vault (`obsidian_vault/VRFramework/web`) |
| API | `/api` | `api/` | Generated from the C# sources in the Unity project (`<UnityProject>/Assets/vrframework`) |

## Requirements

Node.js >= 20.

> **Important: the checkout path must not contain a `!` character.**
> Webpack/Rspack treat `!` as a loader separator inside module requests, so a
> path such as `...\!!CIE WORK\VRF\vrfdocs` makes every module resolution fail
> with `Module not found: Can't resolve 'CIE WORK\VRF\vrfdocs\node_modules\...'`.
> Junctions and `--preserve-symlinks` do not help - Docusaurus resolves the site
> directory to its real path. This is why the repo lives in
> `Syncthing\Documents\VRFramework\vrfdocs` and not next to the rest of the VRF
> work folder.

## Commands

```bash
npm install            # once
npm run docs:normalize # turn the Obsidian notes in tutorials/ into Docusaurus docs
npm run docs:check     # same, but only reports - for CI
npm run gen:api        # regenerate api/ from the C# sources
npm start            # dev server on http://localhost:3000
npm run build        # production build into build/
npm run serve        # serve the production build locally
npm run typecheck    # tsc
```

## Tutorials: the vault

`tutorials/` **is** the Obsidian vault - open that folder in Obsidian and write.
Nothing is generated from anywhere else and nothing is wiped, so the Markdown in
this repo is the source.

Obsidian's own syntax is not quite Docusaurus's, so run this after writing:

```bash
npm run docs:normalize        # fix the notes in place
npm run docs:normalize -- --check   # report only, non-zero exit if work is due
npm run docs:normalize -- --move    # also take the attachment out of the vault
```

`scripts/vault-to-docs.mjs` edits the notes where they are:

- gives every note the `id`, `title` and `sidebar_label` the sidebar needs,
  taking the title from the front matter, the first heading, or the file name
- drops the front matter Docusaurus does not know (`dg-publish`, `cssclasses`,
  anything else that is not a documented key)
- turns `[[Wikilinks]]`, `[[Note|Alias]]` and `[[Note#Heading]]` into real
  `/tutorials/...` links; one that resolves to nothing is left as plain text and
  reported
- turns `![[Image.png]]` embeds into image references and copies the attachment
  into `static/img/vault/`; `![[Image.png|661]]` becomes an `<img width="661">`
- writes a `_category_.json` per folder so the sidebar order is
  Getting Started → Modules → Additions → Onboarding
  (`CATEGORY_ORDER` in the script)
- makes `index.md` the section landing page at `/tutorials`

It never deletes a note and never moves one. Attachments are copied rather than
moved unless you pass `--move`, so a freshly pasted screenshot still renders in
Obsidian until you decide otherwise.

Notes are parsed as CommonMark, not MDX (`markdown.format: 'detect'` in
`docusaurus.config.ts`), so `<` and `{` in the note text cannot break the build.

### Adding a section to the tutorials

Make the folder in `tutorials/`, put the notes in it, run
`npm run docs:normalize`. For a specific place in the sidebar, add the folder's
label to `CATEGORY_ORDER` in `scripts/vault-to-docs.mjs`.

## API section

Generated from the VR Framework C# sources by `scripts/gen-api.mjs`:

```bash
npm run gen:api
npm run gen:api -- --source "C:/path/to/UnityProject/Assets/vrframework"
```

The sources are **not** part of this repo and stay where they are, inside the
Unity project. The script reads them in place and:

1. finds every `.asmdef` under the package (skipping `ThirdPartyPlugins`,
   `Samples` and `Tests`) and maps it to the `.csproj` Unity generates for it in
   the Unity project root
2. runs `docfx metadata` over those projects - Roslyn parses the C#, so XML doc
   comments, inherited members and Unity types all resolve properly - into
   intermediate YAML under `.docfx/` (gitignored)
3. converts that YAML into Docusaurus Markdown in `api/`: one folder per
   namespace with a `_category_.json` and an overview page, one page per type,
   with parameter/return/exception tables, cross-links between framework types,
   and outbound links to the Unity and .NET reference for foreign types

### One-time setup

```bash
dotnet tool install -g docfx     # needs the .NET SDK 8 or newer
```

Open the Unity project once so the `.csproj` files exist - they are what carries
the assembly references. Then point the script at the package. The location is
resolved in this order:

1. `--source <path>`
2. the `VRF_SOURCE` environment variable
3. `source` in `api.config.json` at the repo root - copy
   `api.config.example.json` to `api.config.json` and edit it. That file is
   gitignored, so every machine can have its own path
4. a few guesses relative to the repo

`api.config.json` also takes `sourceUrlTemplate` (the "view source" links, with
`{repo}` `{branch}` `{path}` `{line}` - drop the key to omit the links),
`unityProject` (defaults to the folder above `Assets/`) and `exclude`.

### Rules

`api/` is fully owned by the script and wiped on every run - fix a description
by editing the XML doc comment in the C# source, then re-run `npm run gen:api`.

The generated Markdown **is committed**, exactly like `tutorials/`: the Vercel
build has no access to the Unity project, so `npm run build` must find the pages
already in the repo. Regenerate and commit whenever the public API changes.

Sidebar order comes from `NAMESPACE_ORDER` in `scripts/gen-api.mjs`; everything
not listed follows alphabetically.

## Design

The identity comes from the logo: a "V" drawn as a construction sketch with
dimension lines, fused to a solid "R". The site repeats that - graphite line
work on drafting paper. The palette is dark grey and white only; there is no
blue anywhere, including in Infima's defaults and the syntax highlighting.

`src/css/custom.css` is the whole theme, in five layers: the VRF tokens, a
bridge that maps them onto Infima's variables, the paper/grid/grain surfaces,
type, then the components. Change a colour in the token block at the top and it
propagates.

A few Infima variables are hard-coded to blue-tinted greys and have to be
overridden by name rather than through the palette - `--ifm-toc-link-color`,
`--ifm-color-content-secondary`, and the `.footer--dark` block. If something
turns blue after a Docusaurus upgrade, that is the first place to look. Syntax
highlighting uses the `graphiteLight` / `graphiteDark` Prism themes defined in
`docusaurus.config.ts`; they carry meaning with weight and italics instead of
hue.

### Brand assets

```bash
npm run gen:brand
```

`scripts/gen-brand.mjs` derives every brand asset from
`static/img/vault/VRFrameworkLogo.png` (which the vault sync provides). The
source is white line art on transparency, so it is invisible on the light
theme; the script re-inks it using only the alpha channel, which keeps the
pencil texture and the gradient in the "R":

| Output | Used by |
| --- | --- |
| `vrf-wordmark.png` / `-ink.png` | navbar (`srcDark` / `src`) |
| `vrf-mark.png` / `-ink.png` | homepage hero plate |
| `favicon.png` | browser tab, graphite on paper |

Re-run it if the logo changes in the vault. The assets are committed, so the
build does not depend on it.

## Before deploying

- set the real `url` / `baseUrl` in `docusaurus.config.ts` - it is currently the
  Vercel domain
- uncomment `editUrl` if "edit this page" links should point at the repo. Leave
  it off for `tutorials/`: those files are generated and the next sync
  overwrites any edit
- the navbar and footer still link to GitLab while the source lives on GitHub
