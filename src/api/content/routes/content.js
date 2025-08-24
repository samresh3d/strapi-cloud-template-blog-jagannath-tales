'use strict';

/**
 * content router
 * @typedef {import('@strapi/strapi').factories}
 */

// @ts-ignore
const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::content.content');
