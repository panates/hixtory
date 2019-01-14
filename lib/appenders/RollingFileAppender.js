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
const {RollingFileStream} = require('streamroller');

/**
 *
 * @class RollingFileAppender
 * @extends Appender
 */
class RollingFileAppender extends StreamAppender {

  /**
   *
   * @param {!Object} options
   * @param {number} [options.highWaterMark]
   * @param {string} options.filename
   * @param {number} [options.maxSize]
   * @param {number} [options.numBackups]
   * @param {boolean} [options.compress=false]
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
    return new RollingFileStream(
        options.filename,
        options.maxSize,
        options.numBackups, {
          compress: options.compress,
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

module.exports = RollingFileAppender;
