import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import Helmet from 'react-helmet';

type MetaProps = JSX.IntrinsicElements['meta'];
type LinkProps = JSX.IntrinsicElements['link'];

interface ISEOProps {
  title: string;
  defaultMetaTitle?: boolean;
  description?: string;
  keywords?: string;
  image?: {
    src: string;
    presentationWidth: number;
    presentationHeight: number;
  };
  lang: string;
  meta: MetaProps[];
  path?: string;
}

function SEO({
  title,
  defaultMetaTitle,
  description,
  keywords,
  image = {
    src: '/social-share.png',
    presentationWidth: 1200,
    presentationHeight: 630
  },
  lang,
  meta,
  path
}: ISEOProps) {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            keywords
            siteUrl
          }
        }
      }
    `
  );

  const metaDescription = description || site.siteMetadata.description;

  const metaKeywords = keywords || site.siteMetadata.keywords;

  const metaTitle =
    title && !defaultMetaTitle ? title : site.siteMetadata.title;

  const imageUrl = site.siteMetadata.siteUrl + image.src;

  const defaultMeta: MetaProps[] = [
    {
      name: 'description',
      content: metaDescription
    },
    {
      property: 'keywords',
      content: metaKeywords
    },
    {
      property: 'og:title',
      content: metaTitle
    },
    {
      property: 'og:description',
      content: metaDescription
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:image',
      content: imageUrl
    },
    {
      property: 'og:image:width',
      content: image.presentationWidth
    },
    {
      property: 'og:image:height',
      content: image.presentationHeight
    },
    {
      name: 'twitter:card',
      content: `summary`
    },
    {
      name: 'twitter:title',
      content: metaTitle
    },
    {
      name: 'twitter:site',
      content: '@dvcORG'
    },
    {
      name: 'twitter:description',
      content: metaDescription
    },
    {
      name: 'twitter:image',
      content: imageUrl
    }
  ];

  let locationLink: LinkProps[] = [];
  if (path) {
    const fullUrl = site.siteMetadata.siteUrl + path;
    locationLink = [
      {
        rel: 'canonical',
        href: fullUrl
      }
    ];
    defaultMeta.push({
      property: 'og:url',
      content: fullUrl
    });
  }

  return (
    <Helmet
      htmlAttributes={{
        lang
      }}
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[...defaultMeta, ...meta]}
      link={[
        ...locationLink,
        {
          rel: 'icon',
          type: 'image/vnd.microsoft.icon',
          href: '/favicon.ico'
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon-32x32.png',
          sizes: '32x32'
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon-16x16.png',
          sizes: '16x16'
        }
      ]}
    />
  );
}

SEO.defaultProps = {
  lang: `en`,
  meta: []
};

export default SEO;
