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
const StreamAppender = require('./StreamAppender');
const {DateRollingFileStream} = require('streamroller');

/**
 *
 * @class DateFileAppender
 * @extends StreamAppender
 */
class DateFileAppender extends StreamAppender {

  /**
   *
   * @param {!Object} options
   * @param {number} [options.highWaterMark]
   * @param {string} options.filename
   * @param {boolean} [options.compress=false]
   * @param {string} [options.pattern='.YYYY-MM-DD']
   * @param {number} [options.daysToKeep]
   * @param {boolean} [options.alwaysIncludePattern=false]
   * @override
   */
  constructor(options) {
    super(options);
  }

  /**
   * @override
   */
  _createStream() {
    const options = this._options;
    return new DateRollingFileStream(
        options.filename,
        (options.pattern || '.yyyy-MM-dd').replace(/Y/g, 'y')
            .replace(/D/g, 'd'), {
          compress: options.compress,
          daysToKeep: options.daysToKeep,
          alwaysIncludePattern: options.alwaysIncludePattern,
          keepFileExt: true
        });
  }

  /**
   * @override
   */
  _transform(chunk) {
    return (typeof chunk === 'object' ?
        JSON.stringify(chunk, null, 2) : chunk) +
        /* istanbul ignore next */
        (process.platform === 'win32' ? '\r\n' : '\n');
  }

}

module.exports = DateFileAppender;
