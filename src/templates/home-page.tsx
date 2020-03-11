import { graphql } from 'gatsby';
import React from 'react';

import { ILocation, LocationContext } from '../context/location';
// tslint:disable: ordered-imports
import Layout from '../components/layout';
import { IPageInfo } from '../components/paginator';
import Feed, { IFeedPostList } from '../components/feed';
import SEO from '../components/seo';
// tslint:enable: ordered-imports

interface IBlogIndexProps {
  data: { posts: IFeedPostList };
  location: ILocation;
  pageContext: {
    pageInfo: IPageInfo;
  };
}

function BlogIndex({
  data: { posts },
  location,
  pageContext: { pageInfo }
}: IBlogIndexProps) {
  return (
    <LocationContext.Provider value={location}>
      <Layout>
        <SEO title="Blog" defaultMetaTitle={true} pageInfo={pageInfo} />
        <Feed
          feedPostList={posts}
          pageInfo={pageInfo}
          header="Data Version Control in Real Life"
          leadParagraph={
            <>
              We write about machine learning workflow. From data versioning and
              processing to model productionization. We share our news,
              findings, interesting reads, community takeaways.
            </>
          }
        />
      </Layout>
    </LocationContext.Provider>
  );
}

export default BlogIndex;

export const pageQuery = graphql`
  query($skip: Int, $limit: Int) {
    posts: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fileAbsolutePath: { regex: "/content/blog/" } }
      skip: $skip
      limit: $limit
    ) {
      ...FeedPostList
    }
  }
`;
