'use strict';

/**
 * festival-calendar service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::festival-calendar.festival-calendar');
