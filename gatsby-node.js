const fs = require('fs');
const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');
const tagToSlug = require('./src/utils/tag-to-slug');
const iterPages = require('./src/components/paginator/utils/iter-pages');
const { siteMetadata } = require('./gatsby-config');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const blogPost = path.resolve('./src/templates/blog-post.tsx');
  const homePage = path.resolve('./src/templates/home-page.tsx');
  const tagPage = path.resolve('./src/templates/tag-page.tsx');
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          filter: { fileAbsolutePath: { regex: "/content/blog/" } }
          limit: 9999
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
        home: allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          filter: { fileAbsolutePath: { regex: "/content/blog/" } }
          limit: 9999
        ) {
          pageInfo {
            itemCount
          }
        }
        tags: allMarkdownRemark(limit: 9999) {
          group(field: frontmatter___tags) {
            fieldValue
            pageInfo {
              itemCount
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    throw result.errors;
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;

    createPage({
      component: blogPost,
      context: {
        currentPage: index + 1,
        next,
        previous,
        slug: post.node.fields.slug
      },
      path: post.node.fields.slug
    });
  });

  const home = result.data.home;

  for (const { paginationContext, pagePath } of iterPages({
    basePath: '/',
    hasHeroItem: true,
    itemCount: home.pageInfo.itemCount
  })) {
    createPage({
      component: homePage,
      context: paginationContext,
      path: pagePath
    });
  }

  const tags = result.data.tags.group;

  tags.forEach(({ fieldValue: tag, pageInfo: { itemCount } }) => {
    const basePath = `/tags/${tagToSlug(tag)}`;

    for (const { paginationContext, pagePath } of iterPages({
      basePath,
      itemCount
    })) {
      createPage({
        component: tagPage,
        context: { tag, ...paginationContext },
        path: pagePath
      });
    }
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'MarkdownRemark') {
    const value = createFilePath({
      getNode,
      node,
      trailingSlash: false
    }).replace(/^\/[0-9\-]*/, '/');
    createNodeField({
      name: 'slug',
      node,
      value
    });
  }
};

// Create json to use on https://dvc.org/community

exports.onPreBuild = async function({ graphql }) {
  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        filter: { fileAbsolutePath: { regex: "/content/blog/" } }
        limit: 3
      ) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              date
              commentsUrl
              picture {
                childImageSharp {
                  resize(
                    width: 160
                    height: 160
                    fit: COVER
                    cropFocus: CENTER
                  ) {
                    src
                  }
                }
              }
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    throw new Error(result.errors);
  }

  const posts = result.data.allMarkdownRemark.edges.map(
    ({
      node: {
        fields: { slug },
        frontmatter: { title, date, commentsUrl, picture }
      }
    }) => {
      const url = `${siteMetadata.siteUrl}/${slug}`;
      let pictureUrl = null;

      if (picture) {
        const {
          childImageSharp: {
            resize: { src }
          }
        } = picture;

        pictureUrl = `${siteMetadata.siteUrl}${src}`;
      }

      return {
        commentsUrl,
        date,
        pictureUrl,
        title,
        url
      };
    }
  );

  const dir = path.join(__dirname, '/public/api');
  const filepath = path.join(dir, 'posts.json');

  // Write json file to the public dir,
  // it will be used community page later
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeFileSync(filepath, JSON.stringify({ posts }));
};

// Ignore warnings about CSS inclusion order, because we use CSS modules.
// https://spectrum.chat/gatsby-js/general/having-issue-related-to-chunk-commons-mini-css-extract-plugin~0ee9c456-a37e-472a-a1a0-cc36f8ae6033?m=MTU3MjYyNDQ5OTAyNQ==
exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  if (stage === 'build-javascript') {
    const config = getConfig();
    const miniCssExtractPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'MiniCssExtractPlugin'
    );
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.ignoreOrder = true;
    }
    actions.replaceWebpackConfig(config);
  }
};
