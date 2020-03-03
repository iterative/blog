/* eslint-env node */

/*
 * Custom server (with custom routes) See
 * https://nextjs.org/docs/advanced-features/custom-server
 *
 * NOTE: This file doesn't go through babel or webpack. Make sure the syntax and
 * sources this file requires are compatible with the current node version you
 * are running.
 */

const path = require('path');
const express = require('express');
const serve = require('serve-handler');

const port = process.env.PORT || 9000;
const app = express();

const staticFilesOptions = {
  directoryListing: false,
  etag: true,
  headers: [
    {
      headers: [
        // Cache always revalidated by the client, not by the proxy
        // (instant deploys when combined with the post-deploy purge)
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, s-maxage=99999'
        }
      ],
      source: '**'
    }
  ],
  public: path.join(__dirname, '../../public'),
  trailingSlash: false
};

app.use((req, res) => {
  serve(req, res, staticFilesOptions);
});

app.listen(port, e => {
  /* tslint:disable-next-line:no-console */
  console.log(`Listening on http://0.0.0.0:${port}/`);
});
