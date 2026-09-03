import type {PrismTheme} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Syntax highlighting in the site palette: graphite on paper, no hue. Weight
 * and italics carry the meaning that colour normally would, so code blocks sit
 * in the drafting aesthetic instead of fighting it.
 */
const graphiteLight: PrismTheme = {
  plain: {color: '#2b2b2b', backgroundColor: 'transparent'},
  styles: [
    {types: ['comment', 'prolog', 'cdata'], style: {color: '#948f86', fontStyle: 'italic'}},
    {types: ['punctuation', 'operator'], style: {color: '#8a857c'}},
    {types: ['keyword', 'atrule', 'selector', 'tag', 'builtin'], style: {color: '#141414', fontWeight: 'bold'}},
    {types: ['function', 'class-name', 'maybe-class-name'], style: {color: '#141414'}},
    {types: ['string', 'char', 'attr-value', 'regex'], style: {color: '#565349', fontStyle: 'italic'}},
    {types: ['number', 'boolean', 'constant', 'symbol'], style: {color: '#4f4f4f'}},
    {types: ['property', 'attr-name', 'variable'], style: {color: '#3a3833'}},
    {types: ['deleted'], style: {textDecorationLine: 'line-through'}},
    {types: ['inserted'], style: {textDecorationLine: 'underline'}},
  ],
};

const graphiteDark: PrismTheme = {
  plain: {color: '#e7e4dd', backgroundColor: 'transparent'},
  styles: [
    {types: ['comment', 'prolog', 'cdata'], style: {color: '#6f6b64', fontStyle: 'italic'}},
    {types: ['punctuation', 'operator'], style: {color: '#948f86'}},
    {types: ['keyword', 'atrule', 'selector', 'tag', 'builtin'], style: {color: '#ffffff', fontWeight: 'bold'}},
    {types: ['function', 'class-name', 'maybe-class-name'], style: {color: '#ffffff'}},
    {types: ['string', 'char', 'attr-value', 'regex'], style: {color: '#b4afa6', fontStyle: 'italic'}},
    {types: ['number', 'boolean', 'constant', 'symbol'], style: {color: '#c2beb6'}},
    {types: ['property', 'attr-name', 'variable'], style: {color: '#d2cec6'}},
    {types: ['deleted'], style: {textDecorationLine: 'line-through'}},
    {types: ['inserted'], style: {textDecorationLine: 'underline'}},
  ],
};

const config: Config = {
  title: 'VR Framework Docs',
  tagline: 'Build immersive VR experiences in Unity, faster',
  favicon: 'img/favicon.png',

  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Production URL. Change this when a custom domain (e.g. vrf.cie-group.cz) is
  // pointed at the Vercel project - it drives canonical links, the sitemap and
  // absolute og:image URLs.
  url: 'https://vrfdocs.vercel.app',
  baseUrl: '/',

  organizationName: 'vr-framework',
  projectName: 'vrfdocs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    // `.md` files are parsed as plain CommonMark (no JSX), `.mdx` keeps full MDX.
    // This keeps Obsidian-exported Markdown from breaking the build on `<`, `{`, etc.
    format: 'detect',
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        // Default docs plugin instance = the tutorials section.
        docs: {
          id: 'default',
          path: 'tutorials',
          routeBasePath: 'tutorials',
          sidebarPath: './sidebars.ts',
          // editUrl: 'https://git.cie-group.cz/vr-framework/vrfdocs/-/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      // Second docs plugin instance = the API reference.
      // The SDK doc generator is expected to emit Markdown into ./api.
      '@docusaurus/plugin-content-docs',
      {
        id: 'api',
        path: 'api',
        routeBasePath: 'api',
        sidebarPath: './sidebarsApi.ts',
      },
    ],
  ],

  themeConfig: {
    image: 'img/vault/VRFrameworkLogo.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      // No `title`: the wordmark already reads "VR Framework".
      logo: {
        alt: 'VR Framework',
        src: 'img/vrf-wordmark-ink.png',
        srcDark: 'img/vrf-wordmark.png',
        width: 176,
        height: 28,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialsSidebar',
          position: 'left',
          label: 'Tutorials',
        },
        {
          type: 'docSidebar',
          docsPluginId: 'api',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API',
        },
        {
          to: '/report-bug',
          label: 'Report a bug',
          position: 'right',
        },
        {
          href: 'https://git.cie-group.cz/vr-framework',
          label: 'GitLab',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Tutorials',
          items: [
            {label: 'Introduction', to: '/tutorials'},
            {label: 'Project Setup', to: '/tutorials/getting-started/project-setup'},
            {label: 'Modules Overview', to: '/tutorials/modules/modules-overview'},
          ],
        },
        {
          title: 'Reference',
          items: [{label: 'API', to: '/api'}],
        },
        {
          title: 'More',
          items: [
            {label: 'Report a bug', to: '/report-bug'},
            {
              label: 'VR Framework on GitLab',
              href: 'https://git.cie-group.cz/vr-framework',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} CIE Group. Built with Docusaurus.`,
    },
    prism: {
      theme: graphiteLight,
      darkTheme: graphiteDark,
      additionalLanguages: ['csharp', 'json', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
