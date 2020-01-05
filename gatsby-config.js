const path = require('path');
const dvc = require('./config/prismjs/dvc');

const netlifyCMSPathConfig = {
  resolve : 'gatsby-plugin-netlify-cms-paths',
  options : {cmsConfig : '/static/admin/config.yml'}
};

const title = 'Data Version Control · DVC';
const keywords = 'data, machine learning models management, datasets, git';
const description =
    'Data Version Control Blog. We write about machine learning workflow. From data versioning and processing to model productionization. We share our news, findings, interesting reads, community takeaways.';

const plugins = [
  'gatsby-plugin-twitter', {
    resolve : 'gatsby-source-filesystem',
    options : {path : path.join(__dirname, 'content', 'blog'), name : 'blog'}
  },
  {
    resolve : 'gatsby-source-filesystem',
    options :
        {path : path.join(__dirname, 'content', 'authors'), name : 'authors'}
  },
  {
    resolve : 'gatsby-source-filesystem',
    options :
        {path : path.join(__dirname, 'content', 'assets'), name : 'assets'}
  },
  {
    resolve : 'gatsby-source-filesystem',
    options :
        {path : path.join(__dirname, 'static', 'uploads'), name : 'images'}
  },
  {
    resolve : 'gatsby-transformer-remark',
    options : {
      plugins : [
        {
          resolve : 'gatsby-remark-embed-gist',
          options : {includeDefaultCss : true}
        },
        {resolve : 'gatsby-remark-relative-images'}, {
          resolve : 'gatsby-remark-images',
          options : {maxWidth : 700, withWebp : true}
        },
        'gatsby-remark-responsive-iframe', {
          resolve : 'gatsby-remark-prismjs',
          options :
              {languageExtensions : [ {language : 'dvc', definition : dvc} ]}
        },
        'gatsby-remark-copy-linked-files', 'gatsby-remark-smartypants',
        'gatsby-remark-component', netlifyCMSPathConfig
      ]
    }
  },
  'gatsby-plugin-typescript', 'gatsby-plugin-postcss',
  {resolve : 'gatsby-plugin-svgr', options : {ref : true}},
  'gatsby-plugin-tslint', 'gatsby-transformer-sharp', 'gatsby-plugin-sharp',

  {
    resolve : `gatsby-plugin-feed`,
    options : {
      query : `
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
        `,
      feeds : [ {
        serialize : ({query : {site, allMarkdownRemark}}) => {
          return allMarkdownRemark.edges.map(edge => {
            return Object.assign({}, edge.node.frontmatter, {
              description :
                  edge.node.descriptionLong || edge.node.descriptionLong,
              date : edge.node.frontmatter.date,
              url : site.siteMetadata.siteUrl + edge.node.fields.slug,
              guid : site.siteMetadata.siteUrl + edge.node.fields.slug,
              custom_elements : [ {'content:encoded' : edge.node.html} ]
            });
          });
        },
        query : `
              {
                allMarkdownRemark(
                  filter: { fields: { collection: { eq: "blog" } } }
                  sort: { fields: frontmatter___date, order: DESC }
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
        output : '/rss.xml',
        title,
        description
      } ]
    }
  },
  {
    resolve : 'gatsby-plugin-manifest',
    options : {
      name : 'dvc.org',
      short_name : 'dvc.org',
      start_url : '/',
      background_color : '#eff4f8',
      theme_color : '#eff4f8',
      display : 'minimal-ui',
      icon : 'static/512.png'
    }
  },
  'gatsby-plugin-react-helmet', {
    resolve : 'gatsby-plugin-netlify-cms',
    options : {modulePath : `${__dirname}/config/netlify/index.js`}
  },
  netlifyCMSPathConfig
];

if (process.env.CONTEXT === 'production') {
  plugins.push({
    resolve : 'gatsby-plugin-google-analytics',
    options : {trackingId : process.env.GA_ID, respectDNT : true}
  });
}

module.exports = {
  siteMetadata :
      {title, description, keywords, siteUrl : 'https://blog.dvc.org'},
  plugins
};
