/* eslint-env node */

// CLONE FROM dvc.org. Do not modify only here.

let redirects = require('../../../../redirects-list.json');

const processRedirectString = redirectString => {
  let [regex, replace, code = 301] = redirectString.split(/\s+/g);
  const matchPathname = /^\^?\//.test(regex);
  regex = new RegExp(regex);
  code = Number(code);
  return {
    code,
    matchPathname,
    regex,
    replace
  };
};

exports.processRedirectString = processRedirectString;

// Parse redirects when starting up.
redirects = redirects.map(processRedirectString);

const matchRedirectList = (host, pathname) => {
  const wholeUrl = `https://${host}${pathname}`;

  for (const { matchPathname, regex, replace, code } of redirects) {
    const matchTarget = matchPathname ? pathname : wholeUrl;
    if (regex.test(matchTarget)) {
      return [code, matchTarget.replace(regex, replace)];
    }
  }

  return [];
};

const getRedirect = (host, pathname, { req, dev } = {}) => {
  const httpsRedirect = req != null && !dev && !/^localhost(:\d+)?$/.test(host);
  if (httpsRedirect && req.headers['x-forwarded-proto'] !== 'https') {
    return [301, `https://${host.replace(/^www\./, '')}${req.url}`];
  }

  return matchRedirectList(host, pathname);
};

exports.getRedirect = getRedirect;
