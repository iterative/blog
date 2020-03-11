// Components
import { graphql } from 'gatsby';
import React from 'react';

import Feed, { IFeedPostList } from '../components/feed';
import Layout from '../components/layout';
import { IPageInfo } from '../components/paginator';
import SEO from '../components/seo';
import { ILocation, LocationContext } from '../context/location';

interface ITagPageTemplateProps {
  data: { posts: IFeedPostList };
  location: ILocation;
  pageContext: {
    tag: string;
    pageInfo: IPageInfo;
  };
  path: string;
}

const Tags = ({
  data: { posts },
  pageContext: { tag, pageInfo },
  path,
  location
}: ITagPageTemplateProps) => {
  const title = `Posts tagged with "${tag}"`;

  return (
    <LocationContext.Provider value={location}>
      <Layout>
        <SEO title={title} defaultMetaTitle={true} path={path} />
        <Feed
          pageInfo={pageInfo}
          feedPostList={posts}
          bigFirst={false}
          header={title}
        />
      </Layout>
    </LocationContext.Provider>
  );
};

export default Tags;

export const pageQuery = graphql`
  query($tag: String, $skip: Int, $limit: Int) {
    posts: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
      skip: $skip
      limit: $limit
    ) {
      ...FeedPostList
    }
  }
`;
