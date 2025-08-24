'use strict';

/**
 * miracle service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::miracle.miracle');
