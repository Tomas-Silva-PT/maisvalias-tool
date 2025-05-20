// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'maisvalias-tool',
  tagline: 'Descobre rapidamente as mais valias e dividendos que precisas de declarar no IRS',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://Tomas-Silva-PT.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/maisvalias-tool/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Tomas-Silva-PT', // Usually your GitHub org/user name.
  projectName: 'maisvalias-tool', // Usually your repo name.
  deploymentBranch: "gh-pages",
  
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'maisvalias-tool',
        logo: {
          alt: 'maisvalias-tool Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentação',
          },
          {to: '/about', label: 'Sobre Nós', position: 'left'},
          {to: '/donate', label: 'Donativo', position: 'left'},
          {to: '/faq', label: 'FAQ', position: 'left'},
          {to: '/livedemo', label: 'Demonstração', position: 'left'},
          {
            href: "https://github.com/Tomas-Silva-PT/maisvalias-tool",
            className: "header-github-link",
            "aria-label": "GitHub repository",
            position: "right",
        },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentação',
            items: [
              {
                label: 'Documentação',
                to: '/docs/intro',
              },
              {
                label: 'Conceitos chave',
                to: '/docs/category/conceitos-chave',
              },
              {
                label: 'Corretoras suportadas',
                to: '/docs/category/corretoras-suportadas',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Tomas-Silva-PT/maisvalias-tool',
              },
              {
                label: 'Comunidade',
                href: 'https://github.com/Tomas-Silva-PT/maisvalias-tool/discussions'
              }
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} maisvalias-tool Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
    themes: [
      // ... Your other themes.
      [
        require.resolve("@easyops-cn/docusaurus-search-local"),
        /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
        ({
          // ... Your options.
          // `hashed` is recommended as long-term-cache of index file is possible.
          hashed: true,
  
          // For Docs using Chinese, it is recomended to set:
          // language: ["en", "zh"],
  
          // If you're using `noIndex: true`, set `forceIgnoreNoIndex` to enable local index:
          // forceIgnoreNoIndex: true,
        }),
      ],
    ],
    
};

export default config;
