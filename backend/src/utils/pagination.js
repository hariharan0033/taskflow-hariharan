const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse ?page= and ?limit= query params.
 * Returns { page, limit, skip } ready for Prisma, plus a validation error if invalid.
 */
function parsePagination(query) {
  const page = parseInt(query.page, 10) || 1;
  const limit = Math.min(parseInt(query.limit, 10) || DEFAULT_LIMIT, MAX_LIMIT);

  if (page < 1 || limit < 1) {
    return { error: 'page and limit must be positive integers' };
  }

  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Build the pagination metadata object for the response.
 */
function paginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = { parsePagination, paginationMeta };
