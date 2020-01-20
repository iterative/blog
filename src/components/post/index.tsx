import cn from 'classnames';
import Image from 'gatsby-image';
import ReactMarkdown, { NodeType as MarkdownNodeType } from 'react-markdown';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWindowScroll, useWindowSize } from 'react-use';

import { IBlogPostData } from '../../templates/blog-post';

import { getCommentsCount } from '../../api';
import { siteLinks } from '../../data';
import { pluralizeComments } from '../../utils/i18n';

import Markdown from '../markdown';
import Meta from '../meta';
import PseudoButton from '../pseudo-button';
import Share from '../share';

import styles from './styles.module.css';

const AllowedMarkdownTypes: MarkdownNodeType[] = [
  'text',
  'link',
  'paragraph',
  'strong',
  'delete',
  'emphasis'
];

function Post({ html, timeToRead, frontmatter, fields }: IBlogPostData) {
  const {
    title,
    date,
    picture,
    pictureComment,
    description,
    descriptionLong,
    commentsUrl,
    tags,
    author: {
      childMarkdownRemark: {
        frontmatter: { name, avatar }
      }
    }
  } = frontmatter;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();
  const { y } = useWindowScroll();

  const isFixed = useMemo(() => {
    if (!wrapperRef.current) {
      return false;
    }

    const { bottom } = wrapperRef.current.getBoundingClientRect();

    return bottom > height;
  }, [wrapperRef, width, height, y]);

  const [counterLoaded, setCounterLoaded] = useState(false);
  const [commentsCount, setCommentsCount] = useState();

  useEffect(() => {
    if (!commentsUrl || counterLoaded) {
      return;
    }

    getCommentsCount(commentsUrl).then(response =>
      response.json().then(json => {
        setCommentsCount(json.count);
        setCounterLoaded(true);
      })
    );
  }, [counterLoaded, setCounterLoaded, setCommentsCount, commentsUrl]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <Share
        className={cn(styles.share, isFixed && styles.fixed)}
        text={description}
        slug={fields.slug}
      />
      <div className={styles.head}>
        <div className={styles.headContent}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.description}>
            <ReactMarkdown
              allowedTypes={AllowedMarkdownTypes}
              className={styles.markdown}
            >
              {descriptionLong || description}
            </ReactMarkdown>
          </div>
          <Meta
            commentsCount={commentsCount}
            commentsUrl={commentsUrl}
            name={name}
            avatar={avatar}
            date={date}
            timeToRead={timeToRead}
          />
        </div>
      </div>
      {picture && (
        <>
          <div className={styles.pictureWrapper}>
            <Image
              fluid={picture.childImageSharp.fluid}
              className={styles.picture}
            />
          </div>
          {pictureComment && (
            <div className={styles.pictureComment}>
              <ReactMarkdown
                linkTarget="_blank"
                allowedTypes={AllowedMarkdownTypes}
                className={styles.markdown}
              >
                {pictureComment}
              </ReactMarkdown>
            </div>
          )}
        </>
      )}
      <div className={styles.content}>
        <Markdown html={html} />
      </div>
      {tags && (
        <div className={styles.tags}>
          {tags.map(tag => (
            <div className={styles.tag} key={tag}>
              {tag}
            </div>
          ))}
        </div>
      )}
      {commentsUrl && counterLoaded && (
        <div className={styles.comments}>
          <PseudoButton
            size="big"
            href={commentsUrl}
            target="_blank"
            rel="noopener nofollow"
          >
            Discuss this post
          </PseudoButton>
          <a
            href={commentsUrl}
            className={styles.count}
            target="_blank"
            rel="noopener nofollow"
          >
            {pluralizeComments(commentsCount)}
          </a>
        </div>
      )}
    </div>
  );
}

export default Post;
