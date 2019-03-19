'use strict';

/**
 * Creator.js controller
 *
 * @description: A set of functions called "actions" for managing `Creator`.
 */

module.exports = {

  /**
   * Retrieve creator records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.creator.search(ctx.query);
    } else {
      return strapi.services.creator.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a creator record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.creator.fetch(ctx.params);
  },

  /**
   * Count creator records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.creator.count(ctx.query);
  },

  /**
   * Create a/an creator record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.creator.add(ctx.request.body);
  },

  /**
   * Update a/an creator record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.creator.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an creator record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.creator.remove(ctx.params);
  }
};
