'use strict';

/**
 * devotion service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::devotion.devotion');
