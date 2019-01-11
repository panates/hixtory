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
const {EventEmitter} = require('events');
const {ErrorEx, ArgumentError} = require('errorex');
const Appender = require('./Appender');

/**
 *
 * @class LogTarget
 * @extends EventEmitter
 */
class LogTarget extends EventEmitter {

  /**
   *
   * @param {Logger} logger
   * @param {string} name Name of the target
   * @param {!Object} options An object representing options
   * @param {Appender} [options.appender] An Appender instance. If value is not present, logger will make a deep lookup for parents till an appender instance found.
   * @param {boolean} [options.enabled=true] If true, logging will be enabled for this target, otherwise no log will be written to appender. Default: true
   * @param {Array<Function>} options.format An array of formatter methods
   * @param {Function} options.filter A function for filtering logs. If function returns true log will be written, otherwise will be ignored.
   * @param {string} options.level Logging level for this target. If value is not present, logger will make a deep lookup for parent targets. If no value found, logger's level will be used.
   */
  constructor(logger, name, options) {
    super();
    if (!name)
      throw new ArgumentError('You must provide target name');
    if (typeof options !== 'object')
      throw new ArgumentError('Object type required for target options');
    this._logger = logger;
    this._name = name;
    this.appender = options.appender;
    this.level = options.level;
    this.filter = options.filter;
    this.format = options.format;
    this.enabled = options.enabled;
  }

  get name() {
    return this._name;
  }

  get appender() {
    return this._appender;
  }

  set appender(value) {
    if (value === this._appender)
      return;
    try {
      if (value == null) {
        delete this._appender;
        return;
      }
      if (value instanceof Appender) {
        this._appender = value;
        return;
      }
    } finally {
      this.emit('change');
    }
    throw new ArgumentError('Appender instance required set "appender"');
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    if (value === this._enabled)
      return;
    if (value == null)
      delete this._enabled;
    else this._enabled = !!value;
    this.emit('change');
  }

  get filter() {
    return this._filter;
  }

  set filter(value) {
    if (value === this._filter)
      return;
    try {
      if (value === undefined) {
        delete this._filter;
        return;
      }
      if (!value) {
        this._filter = null;
        return;
      }
      if (typeof value === 'function') {
        this._filter = value;
        return;
      }
    } finally {
      this.emit('change');
    }
    throw new ArgumentError('Function type required to set "filter"');
  }

  get format() {
    return this._format;
  }

  set format(value) {
    if (value === this._format)
      return;
    try {
      if (value === undefined) {
        delete this._format;
        return;
      }
      if (!value) {
        this._format = null;
        return;
      }
      value = Array.isArray(value) ? value : [value];
      this._format = value.filter((x) => typeof x === 'function');
    } finally {
      this.emit('change');
    }
  }

  get level() {
    return this._level;
  }

  set level(value) {
    if (value === this._level)
      return;
    try {
      if (value == null) {
        delete this._level;
        return;
      }
      if (this._logger.levels.includes(value)) {
        this._level = value;
        return;
      }
    } finally {
      this.emit('change');
    }
    throw new ErrorEx('No such level "%s"', value);
  }

}

module.exports = LogTarget;
