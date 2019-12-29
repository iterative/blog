const fs = require("fs");
const path = require("path");
const {createFilePath} = require("gatsby-source-filesystem");
const {siteMetadata} = require("./gatsby-config");

exports.createPages = async ({graphql, actions}) => {
  const {createPage} = actions;

  const blogPost = path.resolve("./src/templates/blog-post.tsx");
  const result = await graphql(`
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          filter: { fileAbsolutePath: { regex: "/content/blog/" } }
          limit: 1000
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

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;

    createPage({
      path : post.node.fields.slug,
      component : blogPost,
      context : {slug : post.node.fields.slug, previous, next}
    });
  });
};

exports.onCreateNode = ({node, actions, getNode}) => {
  const {createNodeField} = actions;

  if (node.internal.type === "MarkdownRemark") {
    const value = createFilePath({node, getNode}).replace(/^\/[0-9\-]*/, "/");
    createNodeField({name : "slug", node, value});
  }
};

// Create json to use on https://dvc.org/community

exports.onPostBuild = async function({graphql}) {
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

  const dir = path.join(__dirname, "/public/api");
  const filepath = path.join(dir, "posts.json");

  // Write json file to the public dir,
  // it will be used community page later
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);
  fs.writeFileSync(filepath, JSON.stringify({posts}));
};
