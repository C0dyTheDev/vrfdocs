import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'VR Framework Docs',
  tagline: 'Build immersive VR experiences in Unity, faster',
  favicon: 'img/favicon.ico',

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
      title: 'VR Framework',
      logo: {
        alt: 'VR Framework Logo',
        src: 'img/logo.svg',
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
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'json', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
