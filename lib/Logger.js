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
const util = require('util');
const merge = require('putil-merge');
const Appender = require('./Appender');
const LogTarget = require('./LogTarget');
const config = require('./config');

/**
 *
 * @class Logger
 * @extends EventEmitter
 */
class Logger extends EventEmitter {

  /**
   * @param {Object} [options]
   * @param {Object} [options.defaultMeta] An object representing default meta-data of each log
   * @param {string} [options.label] A string representing default label value of each log
   * @param {string} [options.level] A string representing default level of targets.
   * @param {Array<String>} [options.levels] Array of levels ordering from high priority to low or name of predefined levels descriptor. Note that predefined levels also contains color info.
   * @param {Object<String: String>} [options.colors] An object representing default color values
   * @param {Object} [options.targets] An object representing log targets
   */
  constructor(options = {}) {
    super();
    this._init(options);
    this.configure(options);
  }

  /**
   * Returns array of child loggers
   *
   * @return {Array<Logger>}
   */
  get children() {
    return this._children;
  }

  /**
   * Returns default color values
   *
   * @return {{string: string}}
   */
  get colors() {
    return this._colors;
  }

  /**
   * Returns if logger is a child logger
   *
   * @return {boolean}
   */
  get isChild() {
    return !!this.parent;
  }

  /**
   * Returns default label of logger
   *
   * @return {string}
   */
  get label() {
    return this._label;
  }

  /**
   * Sets default label of logger.
   *
   * @param {string|Null} value
   */
  set label(value) {
    if (!value) {
      delete this._label;
      return;
    }
    this._label = value;
  }

  /**
   * Gets default logging level
   *
   * @return {string}
   */
  get level() {
    return this._level;
  }

  /**
   * Sets default logging level
   * @param {string|Null} value
   */
  set level(value) {
    if (!value && this.isChild) {
      delete this._level;
      return;
    }
    if (!this.levels.includes(value || 'info'))
      throw new ErrorEx('No such level "%s"', value);
    this._level = value || 'info';
    this.changed();
  }

  /**
   * Returns array of levels
   *
   * @return {Array<string>}
   */
  get levels() {
    return this._levels;
  }

  /**
   * If this logger is a child returns parent logger, null otherwise
   *
   * @return {Logger}
   */
  get parent() {
    return this._parent;
  }

  /**
   * If this logger is a child returns root logger, self otherwise
   *
   * @return {Logger}
   */
  get root() {
    return this.parent ? this.parent.root : this;
  }

  /**
   * Returns logging targets
   *
   * @return {{string: Object}}
   */
  get targets() {
    return this._targets;
  }

  /**
   * This method configures the logger
   *
   * @param {Object} [options]
   * @param {Object} [options.defaultMeta] An object representing default meta-data of each log
   * @param {string} [options.label] A string representing default label value of each log
   * @param {string} [options.level] A string representing default level of targets.
   * @param {Array<String>} [options.levels] Array of levels ordering from high priority to low or name of predefined levels descriptor. Note that predefined levels also contains color info.
   * @param {Object<String: String>} [options.colors] An object representing default color values
   * @param {Object} [options.targets] An object representing log targets
   */
  configure(options = {}) {
    this._updateCount++;
    try {
      this._removeLevels();
      this._removeTargets();
      this.label = options.label;
      this.setColors(null);
      this._meta = null;
      this.setLevels(options.levels);
      this.level = options.level;
      if (options.targets) {
        if (typeof options.targets !== 'object') // noinspection ExceptionCaughtLocallyJS
          throw new ArgumentError('Object type required for "targets" property');
        for (const n of Object.keys(options.targets))
          this.addTarget(n, options.targets[n]);
      }
    } finally {
      this._updateCount--;
    }
    this.changed();
  }

  /**
   *
   * @param {string} name
   * @param {string} name Name of the target
   * @param {!Object} options An object representing options
   * @param {Appender} [options.appender] An Appender instance. If value is not present, logger will make a deep lookup for parents till an appender instance found.
   * @param {boolean} [options.enabled=true] If true, logging will be enabled for this target, otherwise no log will be written to appender. Default: true
   * @param {Array<Function>} options.format An array of formatter methods
   * @param {Function} options.filter A function for filtering logs. If function returns true log will be written, otherwise will be ignored.
   * @param {string} options.level Logging level for this target. If value is not present, logger will make a deep lookup for parent targets. If no value found, logger's level will be used.
   * @return {Logger} This method returns this Logger for method chaining
   */
  addTarget(name, options) {
    if (this._targets[name])
      throw new ErrorEx('Target "%s" already exists');
    const target = new LogTarget(this, name,
        !options ? {enabled: false} :
            (options instanceof Appender ? {appender: options} : options));
    target.on('change', () => this.changed());
    this._targets[name] = target;
    if (target._appender)
      target._appender._attach();
    this.changed();
    return this;
  }

  /**
   * Removes any target from logger.
   * @param {string} name Name of the target
   * @return {Logger} This method returns this Logger for method chaining
   */
  removeTarget(name) {
    const t = this._targets[name];
    if (t) {
      if (t.hasOwnProperty('_appender'))
        t._appender._detach();
      delete this._targets[name];
      this.changed();
    }
    return this;
  }

  /**
   * Creates a child Logger instance
   *
   * @param {Object} [options]
   * @param {string} [options.level] Log level
   * @param {string} [options.label] Label
   * @param {Object} [options.targets]
   * @return {Logger} This method returns new created child Logger
   */
  createChild(options = {}) {
    const child = Object.create(this);
    child._parent = this;
    child._init(options);
    this._children.push(child);
    child.configure(options);
    return child;
  }

  /**
   *
   * @param {string} level Name of the log level
   * @param {string} message Message text
   * @param {...*} args Arguments to format message with util.format()
   * @return {*}
   */
  log(level, message, ...args) {
    if (this._close)
      return;
    if (!this.levels.includes(level))
      throw new ErrorEx('No such level "%s"', level);
    const meta = {
      level: level,
      label: this.label
    };
    if (typeof message === 'object') {
      merge.defaults(meta, message);
    } else meta.message = util.format(message, ...args);
    if (this.defaultMeta)
      merge.defaults(meta, this.defaultMeta);
    if (this._meta) {
      merge.defaults(meta, this._meta);
      this._meta = null;
    }
    Object.freeze(meta);

    const appendersWriten = [];
    const levelVal = this.levels.indexOf(level);

    const writeToAppenders = (logger) => {
      for (const n of Object.keys(logger._targets)) {
        if (appendersWriten.includes(n))
          continue;
        const target = logger._targets[n];
        if (levelVal <= this.levels.indexOf(target.level || this.level)) {
          appendersWriten.push(n);
          (typeof target.filter !== 'function' || target.filter(meta)) &&
          target.appender.append(this, meta, target.format);
        }
      }
      if (logger.parent)
        writeToAppenders(logger.parent);
    };

    writeToAppenders(this);
    return this;
  }

  /**
   * Allows over-writing and adding properties to meta-data.
   * @param {Object} obj
   * @return {Logger} This method returns this Logger for method chaining
   */
  meta(obj) {
    this._meta = obj;
    return this;
  }

  /**
   * Is used to set default colors in runtime.
   *
   * @param {Object} colors  An object representing default color values.
   * @return {Logger} This method returns this Logger for method chaining
   */
  setColors(colors) {
    if (!colors) {
      if (this.isChild)
        delete this._colors;
      else
        this._colors = {};
      return this;
    }
    if (typeof colors !== 'object')
      throw new ArgumentError('Object type required to set colors');
    this._colors = colors;
    return this;
  }

  setLevels(levels, colors) {
    if (this.isChild) {
      if (!levels)
        return;
      throw new ErrorEx('Levels of child loggers can\'t be changed');
    }

    if (!levels || typeof levels === 'string') {
      const cfg = config[levels || 'hixtory'];
      if (!cfg)
        throw new ArgumentError('There is no predefined levels with name "%s"', levels);
      levels = cfg.levels;
      colors = cfg.colors;
    }

    if (!Array.isArray(levels))
      throw new ArgumentError('String or Array<String> type required to set levels');

    // Remove old logging functions
    this._removeLevels();
    this._levels = this._levels || [];
    for (const level of levels) {
      if (!level.match(/^(\w+)$/))
        throw new ErrorEx('"%s" is not a valid level name', level);
      this._levels.push(level);
      this[level] = function(...args) {
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        return this.log(level, ...args);
      };
    }
    if (colors)
      this.setColors(colors);
    this.changed();
    return this;
  }

  /**
   *
   */
  changed() {
    if (this._updateCount)
      return;
    this._updateCount++;
    try {
      if (!this.levels.includes(this.level))
        this.level = null;

      for (const n of Object.keys(this._targets)) {
        const t = this._targets[n];
        if (!this.levels.includes(t.level))
          t.level = undefined;
        const t2 = this.parent && this.parent.targets[n];
        Object.setPrototypeOf(t, t2 || LogTarget.prototype);
      }
      Object.setPrototypeOf(this._targets,
          this.parent ? this.parent._targets : Object.prototype);
      for (const child of this._children)
        child.changed();
      this.emit('changed');
    } finally {
      this._updateCount--;
    }
  }

  close() {
    // Remove this logger from parent children list
    if (this.parent)
      this.parent._children =
          this.parent._children.splice(this.parent._children.indexOf(this), 1);

    const promises = [];
    const closeAppenders = (logger) => {
      logger._close = true;
      for (const child of logger._children) {
        closeAppenders(child);
      }
      for (const n of Object.keys(logger._targets)) {
        const o = logger._targets[n];
        /* istanbul ignore else */
        if (o) {
          o.appender._detach();
          promises.push(o.appender.close());
        }
      }
    };
    closeAppenders(this.root);
    return Promise.all(promises);
  }

  /**
   * @protected
   */
  _init(options) {
    this._children = [];
    this.defaultMeta = options.defaultMeta;
    this._meta = null;
    this._close = false;
    this._updateCount = 0;
    this._targets = {};
  }

  /**
   *
   * @private
   */
  _removeTargets() {
    this._updateCount++;
    try {
      for (const n of Object.keys(this._targets)) {
        this.removeTarget(n);
      }
      this.changed();
    } finally {
      this._updateCount--;
    }
  }

  /**
   *
   * @private
   */
  _removeLevels() {
    if (this.hasOwnProperty('_levels')) {
      // Remove old log for level methods
      for (const n of this.levels)
        delete this[n];
      this._levels = [];
    }
  }

}

module.exports = Logger;
