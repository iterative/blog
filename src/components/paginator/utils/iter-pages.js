const { postsPerPage, postsPerRow } = require('../../../constants');

function paginatedUrl(pathPrefix, page) {
  if (page < 2) {
    return pathPrefix || '/';
  }

  return `${pathPrefix}/page/${page}`;
}

module.exports = function* iterPages({
  itemCount,
  hasHeroItem = false,
  basePath
}) {
  let currentPage = 1;
  let skip = 0;

  const pathPrefix = basePath === '/' ? '' : basePath;

  while (skip < itemCount) {
    const limit =
      hasHeroItem && currentPage === 1
        ? postsPerPage - postsPerRow + 1
        : postsPerPage;

    const nextPage =
      skip + limit < itemCount
        ? paginatedUrl(pathPrefix, currentPage + 1)
        : null;

    const previousPage =
      skip > 0 ? paginatedUrl(pathPrefix, currentPage - 1) : null;

    // For the Paginator component
    const pageInfo = { currentPage, nextPage, previousPage };

    yield {
      pagePath: paginatedUrl(pathPrefix, currentPage),
      paginationContext: { limit, pageInfo, skip }
    };

    currentPage++;
    skip += limit;
  }
};
