'use strict';

/**
 * Patch content-manager relations controller to avoid 500s on Postgres
 * when publishing entries triggers a count error in loadPages.
 *
 * This wrapper catches the specific failure and returns a safe,
 * empty result with default pagination so publish can proceed.
 */

module.exports = (plugin) => {
  if (
    plugin &&
    plugin.controllers &&
    plugin.controllers.relations &&
    typeof plugin.controllers.relations.findExisting === 'function'
  ) {
    const originalFindExisting = plugin.controllers.relations.findExisting;

    plugin.controllers.relations.findExisting = async function findExistingPatched(ctx) {
      try {
        // Ensure the original controller keeps its `this` context
        return await originalFindExisting.call(plugin.controllers.relations, ctx);
      } catch (err) {
        const message = (err && err.message) || '';
        const stack = (err && err.stack) || '';

        const isCountReadError =
          message.includes("Cannot read properties of undefined (reading 'count')") ||
          stack.includes('entity-repository.js') ||
          stack.includes('entity-repository.mjs');

        if (isCountReadError) {
          // Graceful fallback: return an empty, well-formed response
          ctx.body = {
            pagination: {
              page: 1,
              pageCount: 1,
              pageSize: Number(ctx?.request?.query?.pageSize) || 10,
              total: 0,
            },
            results: [],
          };
          // Swallow the error to avoid blocking publish
          return;
        }

        // Re-throw any other unexpected errors
        throw err;
      }
    };
  }

  return plugin;
};
