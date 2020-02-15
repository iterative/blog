const path = require('path');
require('./config/prismjs/dvc');
const { imageMaxWidth } = require('./src/constants');

const title = 'Data Version Control · DVC';
const keywords =
  'git, data, version control, machine learning models management, datasets';
const description =
  'Data Version Control Blog. We write about machine learning workflow. From data versioning and processing to model productionization. We share our news, findings, interesting reads, community takeaways.';

const plugins = [
  'gatsby-plugin-twitter',
  {
    options: {
      imagesDvcPath: 'uploads.dvc',
      imagesPath: 'static/uploads'
    },
    resolve: 'dvc-image-plugin'
  },
  {
    options: {
      name: 'blog',
      path: path.join(__dirname, 'content', 'blog')
    },
    resolve: 'gatsby-source-filesystem'
  },
  {
    options: {
      name: 'authors',
      path: path.join(__dirname, 'content', 'authors')
    },
    resolve: 'gatsby-source-filesystem'
  },
  {
    options: {
      name: 'assets',
      path: path.join(__dirname, 'content', 'assets')
    },
    resolve: 'gatsby-source-filesystem'
  },
  {
    options: {
      name: 'images',
      path: path.join(__dirname, 'static', 'uploads')
    },
    resolve: 'gatsby-source-filesystem'
  },
  {
    options: {
      plugins: [
        {
          resolve: 'gatsby-remark-embedder'
        },
        {
          options: {
            includeDefaultCss: true
          },
          resolve: 'gatsby-remark-embed-gist'
        },
        {
          resolve: 'gatsby-remark-relative-images'
        },
        {
          options: {
            maxWidth: imageMaxWidth,
            withWebp: true
          },
          resolve: 'gatsby-remark-images'
        },
        'resize-image-plugin',
        'gatsby-remark-responsive-iframe',
        {
          resolve: 'gatsby-remark-prismjs'
        },
        'gatsby-remark-copy-linked-files',
        'gatsby-remark-smartypants',
        'external-link-plugin'
      ]
    },
    resolve: 'gatsby-transformer-remark'
  },
  'gatsby-plugin-typescript',
  'gatsby-plugin-postcss',
  {
    options: {
      ref: true
    },
    resolve: 'gatsby-plugin-svgr'
  },
  'gatsby-plugin-tslint',
  'gatsby-transformer-sharp',
  'gatsby-plugin-sharp',

  {
    options: {
      feeds: [
        {
          description,
          output: '/rss.xml',
          query: `
              {
                allMarkdownRemark(
                  sort: { fields: [frontmatter___date], order: DESC }
                  filter: { fileAbsolutePath: { regex: "/content/blog/" } }
                ) {
                  edges {
                    node {
                      html
                      fields {
                        slug
                      }
                      frontmatter {
                        title
                        date
                        description
                        descriptionLong
                      }
                    }
                  }
                }
              }
            `,
          serialize: ({ query: { site, allMarkdownRemark } }) => {
            return allMarkdownRemark.edges.map(edge => {
              return Object.assign({}, edge.node.frontmatter, {
                custom_elements: [{ 'content:encoded': edge.node.html }],
                date: edge.node.frontmatter.date,
                description:
                  edge.node.descriptionLong || edge.node.descriptionLong,
                guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                url: site.siteMetadata.siteUrl + edge.node.fields.slug
              });
            });
          },
          title
        }
      ],
      query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `
    },
    resolve: `gatsby-plugin-feed`
  },
  {
    options: {
      background_color: '#eff4f8',
      display: 'minimal-ui',
      icon: 'static/512.png',
      name: 'dvc.org',
      short_name: 'dvc.org',
      start_url: '/',
      theme_color: '#eff4f8'
    },
    resolve: 'gatsby-plugin-manifest'
  },
  'gatsby-plugin-react-helmet',
  'gatsby-plugin-sitemap'
];

if (process.env.CONTEXT === 'production') {
  plugins.push({
    options: {
      respectDNT: true,
      trackingId: process.env.GA_ID
    },
    resolve: 'gatsby-plugin-google-analytics'
  });
}

module.exports = {
  plugins,
  siteMetadata: {
    description,
    keywords,
    siteUrl: 'https://blog.dvc.org',
    title
  }
};
