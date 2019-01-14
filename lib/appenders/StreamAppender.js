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
    this._finished = this._stream && this._stream._writableState.finished;
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
      this._finished = this._stream._writableState.finished;
      /* istanbul ignore else */
      if (!this._finished) {
        const streamFinishListener = this._streamFinishListener = () => {
          this._finished = true;
        };
        this._closed = false;
        this._closing = false;
        this._stream.once('finish', streamFinishListener);
        /* istanbul ignore next */
        this._stream.on('error', (...args) => this.emit('error', ...args));
      }
    }
  }

  _detach() {
//    if (this._stream)
//      this._stream.removeListener('finish', this._streamFinishListener);
    super._detach();
  }

  /**
   * @override
   */
  _close(callback) {
    /* istanbul ignore next */
    if (!this._stream || this._finished)
      return callback();
    let c;
    const doCallback = () => {
      /* istanbul ignore else */
      if (!c) callback();
      c = true;
    };
    this._stream.once('close', doCallback);
    this._stream.once('destroy', doCallback);
    this._stream.end(() => {
      /* istanbul ignore next */
      if (this._stream.destroy)
        this._stream.destroy();
      else doCallback();
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
