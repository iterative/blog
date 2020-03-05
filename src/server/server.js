/* eslint-env node */

'use strict';

/*
 * Production server. Proxies to S3 depending on HEROKU_APP_NAME (see
 * scripts/deploy-with-s3.js)
 *
 * NOTE: This file doesn't go through babel or webpack. Make sure the syntax and
 * sources this file requires are compatible with the current node version you
 * are running.
 *
 * Required environment variables:
 *
 *  - S3_BUCKET: name of the bucket
 *  - AWS_REGION: region of the bucket
 *  - AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY: IAM token to access bucket
 *  - HEROKU_APP_NAME: If this is a PR, an ID of the PR. Don't add this for
 *    production.
 */

const fs = require('fs');
const crypto = require('crypto');
const url = require('url');
const path = require('path');
const fetch = require('node-fetch');
const express = require('express');
const mime = require('mime-types');
const Wreck = require('@hapi/wreck');
const { s3Url } = require('./s3');

const app = express();

const { PORT = 9000, NODE_ENV } = process.env;

const cacheControl = 'public, max-age=0, s-maxage=999999';
const htmlType = 'text/html; charset=utf-8';

let notFoundPage;
try {
  // in production there's no public folder
  notFoundPage = fs.readFileSync(path.join(__dirname, '../../404.html'));
} catch (e) {
  notFoundPage = fs.readFileSync(path.join(__dirname, '../../public/404.html'));
}

async function serveFile(pathname, res) {
  const target = s3Url + pathname;

  const proxyRes = await Wreck.request('GET', target, {
    redirects: 2,
    timeout: 5000
  });

  const { statusCode, headers: { etag } = {} } = proxyRes;

  if (statusCode !== 200) {
    throw new Error('Response not successful: ' + statusCode);
  }

  res.writeHead(200, {
    'cache-control': cacheControl,
    'content-type': mime.lookup(pathname) || htmlType,
    etag
  });

  proxyRes.pipe(res);
}

app.use(async (req, res) => {
  const { pathname } = url.parse(req.url);

  if (pathname.endsWith('/') && pathname !== '/') {
    res.writeHead(301, { location: pathname.slice(0, -1) }).end();

    return;
  }

  try {
    await serveFile(pathname, res);
  } catch (e) {
    res
      .writeHead(404, {
        'cache-control': cacheControl,
        'content-type': htmlType
      })
      .end(notFoundPage);
  }
});

app.listen(PORT, e => {
  /* tslint:disable:no-console */
  console.log(`Listening on http://0.0.0.0:${PORT}/`);
  console.log(`Proxying to ${s3Url}`);
  /* tslint:enable:no-console */
});
