import { graphql } from 'gatsby';

import React from 'react';

import cn from 'classnames';

import Paginator, { IPageInfo } from '../paginator';
import FeedItem, { IFeedPostData } from './item';

import styles from './styles.module.css';

export interface IFeedPostList {
  edges: Array<{
    node: IFeedPostData;
  }>;
}

interface IFeedProps {
  feedPostList: IFeedPostList;
  bigFirst?: boolean;
  header: React.ReactNode;
  leadParagraph?: React.ReactNode;
  pageInfo: IPageInfo;
}

function Feed({
  feedPostList: { edges },
  pageInfo,
  bigFirst = true,
  header,
  leadParagraph
}: IFeedProps) {
  return (
    <div className={styles.wrapper}>
      <div
        className={cn(styles.meta, {
          [styles.metaSlim]: bigFirst
        })}
      >
        <h2 className={styles.header}>{header}</h2>
        {leadParagraph && <div className={styles.lead}>{leadParagraph}</div>}
      </div>
      <div className={styles.posts}>
        {edges.map(({ node }, index) => (
          <FeedItem
            feedPost={node}
            key={node.id}
            big={bigFirst && index === 0 && pageInfo.currentPage === 1}
          />
        ))}
      </div>
      <Paginator pageInfo={pageInfo} />
    </div>
  );
}

export const query = graphql`
  fragment FeedPostList on MarkdownRemarkConnection {
    edges {
      node {
        ...FeedPost
      }
    }
  }
`;

export default Feed;
