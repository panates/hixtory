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
const {Appender} = require('../../');

/**
 *
 * @class MockAppender
 * @extends Appender
 */
class MockAppender extends Appender {

  constructor(options = {}) {
    super(options);
    this.transform = options.transform;
    this.errorOnClose = options.errorOnClose;
    this.emitErrorOnClose = options.emitErrorOnClose;
  }

  _write(chunk, encoding, callback) {
    this.lastChunk = chunk;
    this.emit('write', chunk, encoding);
    callback();
  }

  // noinspection JSMethodCanBeStatic
  _transform(chunk) {
    return this.transform ?
        this.transform(chunk) : chunk;
  }

  _close(callback) {
    if (this.errorOnClose)
      throw new Error('Any close error');
    if (this.emitErrorOnClose)
      callback(new Error('Any close error'));
    setTimeout(callback, 10);
  }

}

module.exports = MockAppender;
