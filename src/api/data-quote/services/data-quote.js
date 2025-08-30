'use strict';

/**
 * data-quote service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::data-quote.data-quote');
