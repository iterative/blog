var React = require('react');

exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  const headComponents = getHeadComponents();
  replaceHeadComponents([
    ...headComponents,
    <script
      async
      key="reddit-media-script"
      src="//embed.redditmedia.com/widgets/platform.js"
      charSet="UTF-8"
    />
  ]);
};
