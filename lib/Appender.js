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
const {Writable} = require('stream');
const merge = require('putil-merge');

/**
 *
 * @class Appender
 * @abstract
 */
class Appender extends Writable {

  /**
   *
   * @param {!Object} options
   * @param {number} [options.highWaterMark=100]
   */
  constructor(options = {}) {
    super({
      objectMode: true,
      highWaterMark: options.highWaterMark || 100,
      autoDestroy: true
    });
    this._options = options;
    this._attachCount = 0;
    this._closing = false;
    this._closed = false;
  }

  get closed() {
    return this._closed;
  }

  get closing() {
    return this._closing;
  }

  /**
   *
   * @param {Logger} logger
   * @param {Object} meta
   * @param {Array<Function>} [formatters]
   * @param {Function} [callback]
   * @return {boolean}
   */
  append(logger, meta, formatters, callback) {
    let data;
    if (Array.isArray(meta))
      data = meta.slice();
    else if (typeof meta === 'object') {
      data = merge({}, meta, {descriptor: true});
      if (meta instanceof Error)
        Object.setPrototypeOf(data, Object.getPrototypeOf(meta));
    } else data = meta;

    if (formatters) {
      formatters = Array.isArray(formatters) ? formatters : [formatters];
      for (const format of formatters) {
        data = format(meta, data, logger, this) || data;
      }
    }
    return this.write(this._transform(data), callback);
  }

  /**
   * Closes appender
   * @return {Promise<>}
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this._attachCount || (this._closing || this._closed))
        return resolve();
      this.once('close', (err) => {
        if (err)
          return reject(err);
        resolve();
      });
      /* istanbul ignore next */
      if (this._closing)
        return;
      this._closing = true;
      this._close((err) => {
        if (err)
          return this.emit('close', err);
        this._closing = false;
        this._closed = true;
        this.emit('close');
      });
    });
  }

  /**
   *
   * @protected
   */
  _attach() {
    this._attachCount++;
  }

  /**
   *
   * @protected
   */
  _detach() {
    this._attachCount--;
    setImmediate(() => {
      /* istanbul ignore next */
      if (this._attachCount <= 0)
        this.close().catch(() => 0);
    });
  }

  /* istanbul ignore next: This is abstract */

  // noinspection JSMethodCanBeStatic
  /**
   * @param {Function} callback
   * @protected
   */
  _close(callback) {
    callback();
  }

  /* istanbul ignore next: This is abstract */

  // noinspection JSMethodCanBeStatic
  /**
   *
   * @param {*} chunk
   * @return {*}
   * @protected
   */
  _transform(chunk) {
    return chunk;
  }

}

module.exports = Appender;
