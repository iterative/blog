import { Link } from 'gatsby';

import React, { useLayoutEffect, useState } from 'react';

import cn from 'classnames';

import Helmet from 'react-helmet';

import { ILocation, useLocation } from '../../context/location';

import { ReactComponent as ArrowSVG } from './arrow.svg';

import styles from './styles.module.css';

export interface IPageInfo {
  currentPage: number; // used by feed
  nextPage?: string;
  previousPage?: string;
}

export interface IPaginatorProps {
  pageInfo: IPageInfo;
}

// Enables a smooth scroll behavior between pages.
// Doesn't smooth scroll into posts because the paginator isn't mounted in both :)
const smoothScrollTag = (
  <style
    dangerouslySetInnerHTML={{
      __html: `html { scroll-behavior: smooth; }`
    }}
  />
);

export default function Paginator({
  pageInfo: { nextPage, previousPage }
}: IPaginatorProps) {
  if (!previousPage && !nextPage) {
    return null;
  }

  const { state } = useLocation() as ILocation;

  const fromPaginator = Boolean(state?.fromPaginator);

  const [needsSmoothScroll, setNeedsSmoothScroll] = useState(fromPaginator);

  useLayoutEffect(() => {
    // If we aren't coming from a paginator, we add the style tag.
    // Next page change between components with the paginator,
    // will be smooth scrolled
    setNeedsSmoothScroll(true);
  }, [needsSmoothScroll]);

  return (
    <div className={styles.paginator}>
      {needsSmoothScroll && smoothScrollTag}
      {previousPage && (
        <>
          <Link
            className={cn(styles.link, styles.linkPrevious)}
            to={previousPage}
            state={{ fromPaginator: true }}
          >
            <ArrowSVG />
            <span>Newer posts</span>
          </Link>
          <Helmet>
            <link rel="prev" href={previousPage} />
          </Helmet>
        </>
      )}
      {nextPage && (
        <>
          <Link
            className={cn(styles.link, styles.linkNext)}
            to={nextPage}
            state={{ fromPaginator: true }}
          >
            <span>Older posts</span>
            <ArrowSVG />
          </Link>
          <Helmet>
            <link rel="next" href={nextPage} />
          </Helmet>
        </>
      )}
    </div>
  );
}
