/*
 ------------------------
 (c) 2018-present Panates
 Freely distributed under the MIT license.
 */
'use strict';

/**
 * Module dependencies.
 * @private
 */

const Logger = require('./Logger');
const appenders = require('./appenders');
const formatters = require('./formatters');
const config = require('./config');

module.exports = {
  /**
   * @param {Object} [options]
   * @param {string} [options.level] Default level for all appenders
   * @param {Array<String>} [options.levels]
   * @param {Object} [options.appenders]
   * @return {Logger}
   */
  createLogger: function(options) {
    return new Logger(options);
  },

  logger: new Logger({
    targets: {
      console: {
        appender: new appenders.ConsoleAppender(),
        format: formatters.printConsole()
      }
    }
  }),

  /**
   *
   * @type {Object}
   */
  appenders,

  /**
   *
   * @type {Object}
   */
  config,

  /**
   *
   * @type {Object}
   */
  formatters,

  /**
   *
   * @type {Logger}
   */
  Logger,

  /**
   *
   * @type {Appender}
   */
  Appender: require('./Appender'),

  /**
   *
   * @type {StreamAppender}
   */
  StreamAppender: require('./appenders/StreamAppender')

};
