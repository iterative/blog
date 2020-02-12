import cn from 'classnames';
import { graphql, Link } from 'gatsby';
import Image, { FixedObject, FluidObject } from 'gatsby-image';
import React, { useEffect, useRef } from 'react';
import { useRafState, useWindowSize } from 'react-use';

import Meta from '../../meta';

import styles from './styles.module.css';

import { ReactComponent as Placeholder } from './placeholder.svg';

export interface IFeedPostData {
  id: string;
  timeToRead: string;
  fields: {
    slug: string;
  };
  frontmatter: {
    title: string;
    date: string;
    description: string;
    descriptionLong: string;
    picture?: {
      childImageSharp: {
        big: FluidObject;
        small: FluidObject;
      };
    };
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
  };
}

interface IFeedItemProps {
  big?: boolean;
  feedPost: IFeedPostData;
}

function FeedItem({
  big,
  feedPost: { fields, frontmatter, timeToRead }
}: IFeedItemProps) {
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
        <Meta name={name} avatar={avatar} date={date} timeToRead={timeToRead} />
      </div>
    </div>
  );
}

export const query = graphql`
  fragment FeedPost on MarkdownRemark {
    id
    timeToRead
    fields {
      slug
    }
    frontmatter {
      date(formatString: "MMM DD, YYYY")
      title
      description
      descriptionLong
      picture {
        childImageSharp {
          big: fluid(
            maxWidth: 650
            maxHeight: 450
            cropFocus: CENTER
            quality: 90
          ) {
            ...GatsbyImageSharpFluid_withWebp
          }
          small: fluid(
            maxWidth: 300
            maxHeight: 250
            cropFocus: CENTER
            quality: 90
          ) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
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
    }
  }
`;

export default FeedItem;
