const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const {createFilePath} = require('gatsby-source-filesystem');
const {siteMetadata} = require('./gatsby-config');

exports.createPages = async ({graphql, actions}) => {
  const {createPage} = actions;

  const blogPost = path.resolve('./src/templates/blog-post.tsx');
  const result = await graphql(`
    {
      allMarkdownRemark(
        filter: { fields: { collection: { eq: "blog" } } }
        sort: { fields: frontmatter___date, order: DESC }
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
    }
  `);

  if (result.errors) {
    throw result.errors;
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges;

  posts.forEach(({node : post}, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;

    createPage({
      path : post.fields.slug,
      component : blogPost,
      context : {slug : post.fields.slug, previous, next}
    });
  });
};

exports.onCreateNode = ({node, actions, getNode}) => {
  const {createNodeField} = actions;

  if (node.internal.type === 'MarkdownRemark') {
    // Get the parent node
    const parent = getNode(_.get(node, 'parent'));
    // Create a field on this node for the "collection" of the parent
    // NOTE: This is necessary so we can filter `allMarkdownRemark` by
    // `collection` otherwise there is no way to filter for only markdown
    // documents of type `post`.
    createNodeField({
      node,
      name : 'collection',
      value : _.get(parent, 'sourceInstanceName')
    });

    // Get slug
    const value = createFilePath({node, getNode}).replace(/^\/[0-9\-]*/, '/');
    createNodeField({name : 'slug', node, value});
  }
};

// Create json to use on https://dvc.org/community

exports.onPostBuild = async function({graphql}) {
  const result = await graphql(`
    {
      allMarkdownRemark(
        filter: { fields: { collection: { eq: "blog" } } }
        sort: { fields: frontmatter___date, order: DESC }
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
        node : {fields : {slug}, frontmatter : {title, date, commentsUrl}}
      }) => {
        const url = `${siteMetadata.siteUrl}/${slug}`;

        return {url, title, date, commentsUrl};
      });

  const dir = path.join(__dirname, '/public/api');
  const filepath = path.join(dir, 'posts.json');

  // Write json file to the public dir,
  // it will be used community page later
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);
  fs.writeFileSync(filepath, JSON.stringify({posts}));
};
