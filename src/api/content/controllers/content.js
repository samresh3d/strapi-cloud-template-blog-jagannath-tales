'use strict';

/**
 * content controller
 * @typedef {import('@strapi/strapi').factories}
 */

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::content.content');
