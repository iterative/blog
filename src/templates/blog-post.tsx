import { FixedObject, FluidObject, GatsbyImageProps } from 'gatsby-image';

import { graphql } from 'gatsby';
import React from 'react';

import Layout from '../components/layout';
import Post from '../components/post';
import SEO from '../components/seo';

interface IFluidObject extends FluidObject {
  presentationWidth: number;
  presentationHeight: number;
}

export interface IGatsbyImageProps extends GatsbyImageProps {
  fluid?: IFluidObject;
}

export interface IBlogPostHero {
  picture?: {
    childImageSharp: {
      fluid: IFluidObject;
    };
  };
  pictureComment?: string;
}

export interface IBlogPostFrontmatter {
  title: string;
  date: string;
  description: string;
  descriptionLong?: string;
  commentsUrl?: string;
  tags?: string[];
  picture?: {
    childImageSharp: {
      fluid: IFluidObject;
    };
  };
  pictureComment?: string;
  author: {
    childMarkdownRemark: {
      frontmatter: {
        name: string;
        avatar: {
          childImageSharp: {
            fixed: FixedObject;
          };
        };
      };
    };
  };
}

export interface IBlogPostData {
  id: string;
  html: string;
  timeToRead: string;
  fields: {
    slug: string;
  };
  frontmatter: IBlogPostFrontmatter;
}

interface IBlogPostTemplateProps {
  data: {
    markdownRemark: IBlogPostData;
  };
  pageContext: {
    next: IBlogPostData;
    previous: IBlogPostData;
  };
  path: string;
}

function BlogPostTemplate({ data, path }: IBlogPostTemplateProps) {
  const post = data.markdownRemark;

  return (
    <Layout>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description}
        image={
          post.frontmatter.picture &&
          post.frontmatter.picture.childImageSharp.fluid
        }
        path={path}
      />
      <Post {...post} />
    </Layout>
  );
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(format: HTML)
      html
      timeToRead
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        descriptionLong
        tags
        commentsUrl
        author {
          childMarkdownRemark {
            frontmatter {
              name
              avatar {
                childImageSharp {
                  fixed(width: 40, height: 40, quality: 50, cropFocus: CENTER) {
                    ...GatsbyImageSharpFixed_withWebp
                  }
                }
              }
            }
          }
        }
        picture {
          childImageSharp {
            fluid(maxWidth: 850) {
              ...GatsbyImageSharpFluid_withWebp
              src
              presentationWidth
              presentationHeight
            }
          }
        }
        pictureComment
      }
    }
  }
`;
