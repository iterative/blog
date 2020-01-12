import cn from 'classnames';
import { Link } from 'gatsby';
import Image from 'gatsby-image';
import React, { useEffect, useRef } from 'react';
import { useRafState, useWindowSize } from 'react-use';

import { IFeedPostData } from '../../../pages/index';
import ConditionalWrapper from '../../common/conditional-wrapper';

import Meta from '../../meta';

import styles from './styles.module.css';

import { ReactComponent as Placeholder } from './placeholder.svg';

interface IFeedItemPorps extends IFeedPostData {
  big?: boolean;
}

function FeedItem({ big, fields, frontmatter, timeToRead }: IFeedItemPorps) {
  const { title, description, date, picture, author } = frontmatter;
  const { avatar, name } = author.childMarkdownRemark.frontmatter;
  const bodyRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowSize();
  const [isOverflown, setIsOverflown] = useRafState(true);

  useEffect(() => {
    if (bodyRef.current) {
      const { scrollHeight, clientHeight } = bodyRef.current;

      setIsOverflown(scrollHeight <= clientHeight);
    }
  }, [width]);

  const image = picture
    ? big
      ? picture.childImageSharp.big
      : picture.childImageSharp.small
    : undefined;

  return (
    <div
      className={cn(
        styles.wrapper,
        big && styles.big,
        !picture && styles.placeholder
      )}
    >
      <Link to={fields.slug} className={styles.pictureLink}>
        {picture ? (
          <Image fluid={image} className={styles.picture} />
        ) : (
          <Placeholder className={styles.picture} />
        )}
      </Link>

      <ConditionalWrapper
        condition={big}
        wrapper={(children: React.ReactNode) => (
          <div className={styles.bodyContainer}>{children}</div>
        )}
      >
        <div
          className={cn(styles.body, !isOverflown && styles.overflown)}
          ref={bodyRef}
        >
          <Link to={fields.slug} className={styles.title}>
            {title}
          </Link>
          <div className={styles.description}>{description}</div>
        </div>
        <div className={styles.meta}>
          <Meta
            name={name}
            avatar={avatar}
            date={date}
            timeToRead={timeToRead}
          />
        </div>
      </ConditionalWrapper>
    </div>
  );
}

export default FeedItem;
