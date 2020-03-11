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

const express = require('express');
const { s3Url } = require('./s3');

const redirects = require('./middleware/redirects');
const s3Serve = require('./middleware/s3-serve');

const app = express();

const { PORT = 9000 } = process.env;

app.use(redirects);
app.use(s3Serve);

app.listen(PORT, e => {
  /* tslint:disable:no-console */
  console.log(`Listening on http://0.0.0.0:${PORT}/`);
  console.log(`Proxying to ${s3Url}`);
  /* tslint:enable:no-console */
});
