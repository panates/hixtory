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
const Appender = require('../Appender');

/**
 *
 * @class StreamAppender
 * @extends Appender
 */
class StreamAppender extends Appender {

  /**
   *
   * @param {!Object} options
   * @param {number} [options.highWaterMark]
   * @param {Writable} [options.stream]
   */
  constructor(options) {
    super(options);
    this._stream = options.stream;
  }

  /**
   * @override
   */
  _write(chunk, encoding, callback) {
    try {
      this._stream.write(chunk, encoding, callback);
    } catch (e) /* istanbul ignore next */ {
      callback(e);
    }
  }

  /**
   * @override
   */
  _attach() {
    super._attach();
    /* istanbul ignore else */
    if (this._attachCount === 1) {
      this._stream = this._createStream();
      /* istanbul ignore else */
      if (this._stream && !this._stream._writableState.destroyed) {
        this._state = 'idle';
        /* istanbul ignore next */
        this._stream.on('error', (...args) => this.emit('error', ...args));
      }
    }
  }

  /**
   * @override
   */
  _close(callback) {
    /* istanbul ignore next */
    if (!this._stream || this._stream._writableState.destroyed)
      return callback();
    this._stream.once('close', callback);
    this._stream.end(() => {
      this._stream.destroy();
    });
  }

  /**
   *
   * @protected
   */
  _createStream() {
    return this._stream;
  }

}

module.exports = StreamAppender;
