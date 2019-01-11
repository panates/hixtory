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
const util = require('util');
const fecha = require('fecha');
const clr = require('ansi-colors');
const merge = require('putil-merge');
const wordwrap = require('wordwrap');

/**
 * Adds additional properties to output object. It performs merge operation, so it also can overwrite existing properties.
 *
 * @param {Object} data An object instance which will be merged to meta-data
 * @return {Function}
 */
function add(data) {
  return function add(meta, output) {
    if (typeof output !== 'object')
      return output;
    return merge(output, data);
  };
}

/**
 * Removes properties from output object
 *
 * @param {string} property Name of the property which will be removed from output data
 * @return {Function}
 */
function remove(...property) {
  return function remove(meta, output) {
    if (typeof output !== 'object')
      return output;
    for (const n of property)
      delete output[n];
    return output;
  };
}

/**
 * Adds current timestamp to output object. If format argument is present, date value will be formatted to string.
 *
 * @param {String} [format] Date format string. See [fecha](https://www.npmjs.com/package/fecha) for details
 * @return {Function}
 */
function timestamp(format) {
  return function timestamp(meta, output) {
    if (typeof output !== 'object')
      return output;
    if (!meta.timestamp)
      output.timestamp = new Date();
    if (format && output.timestamp instanceof Date)
      output.timestamp = fecha.format(output.timestamp, format);
    return output;
  };
}

/**
 * Adds color data to given output properties
 *
 * @param {Object} [colors]
 * @param {string|Function} [colors.timestamp='gray']
 * @param {Object|Function} [colors.level]
 * @param {string|Function} [colors.label = 'gray]
 * @param {string|Function} [colors.*]
 * @return {Function}
 */
function colorize(colors) {
  colors = merge.defaults({
    timestamp: 'blueBright',
    label: 'cyan italic'
  }, colors || {});
  colors.level = colors.level || null;

  return function colorize(meta, output, logger) {
    if (typeof output !== 'object')
      return output;
    for (const n of Object.keys(colors)) {
      let color = colors[n];
      if (!color && n === 'level')
        color = logger && logger._colors;
      if (!color)
        continue;
      if (typeof color === 'function')
        color = color(meta, output);
      if (typeof color === 'object')
        color = color[meta[n]];

      let modifier = null;
      for (const s of String(color).split(' ')) {
        if (clr[s])
          modifier = (modifier || clr)[s];
      }
      if (modifier)
        output[n] = modifier(output[n]);
    }
    return output;
  };
}

/**
 * Converts given property oR whole output to lovercase characters
 *
 * @param {string} [property]
 * @return {Function}
 */
function lowerCase(...property) {
  return function lowerCase(meta, output) {
    if (!property.length) {
      if (typeof output === 'string')
        return output.toLowerCase();
      for (const n of Object.keys(output)) {
        if (typeof output[n] === 'string')
          output[n] = output[n].toLowerCase();
      }
      return output;
    }
    for (const n of property) {
      if (typeof output[n] === 'string')
        output[n] = output[n].toLowerCase();
    }
    return output;
  };
}

/**
 * Converts given property of whole output to uppercase characters
 *
 * @param {string} property
 * @return {Function}
 */
function upperCase(...property) {
  const upperCaseKeepColors = (s) => s.toUpperCase()
      .replace(/\x1b\[\d+M/g, (v) => v.toLowerCase());
  return function upperCase(meta, output) {
    if (!property.length) {
      if (typeof output === 'string')
        return upperCaseKeepColors(output);
      for (const n of Object.keys(output)) {
        if (typeof output[n] === 'string')
          output[n] = upperCaseKeepColors(output[n]);
      }
      return output;
    }
    for (const n of property) {
      if (typeof output[n] === 'string')
        output[n] = upperCaseKeepColors(output[n]);
    }
    return output;
  };
}

/**
 * Wraps any string property or whole text output
 *
 * @param {{string:number}|number} [arg1=80]
 * @return {Function}
 */
function wordWrap(arg1) {
  const defaultWrap = wordwrap(parseInt(arg1, 10) || 80);
  let wrapFns;
  if (typeof arg1 === 'object') {
    wrapFns = merge.clone(arg1);
    for (const n of Object.keys(wrapFns)) {
      const x = parseInt(wrapFns[n], 10);
      wrapFns[n] = x ? wordwrap(x) : defaultWrap;
    }
  }
  const wrap = (property, value) => {
    if (typeof value !== 'string')
      return value;
    if (!wrapFns)
      return defaultWrap(value);
    if (wrapFns && wrapFns[property])
      return wrapFns[property](value);
    return value;
  };

  return function wordWrap(meta, output) {
    if (typeof output !== 'object')
      return defaultWrap(String(output));
    for (const n of Object.keys(output))
      output[n] = wrap(n, output[n]);
    return output;
  };
}

/**
 *
 *
 * @param {{string:number}|number} [arg1=2]
 * @return {Function}
 */
function indent(arg1) {
  const defaultIndent = parseInt(arg1, 10) || 2;
  let indents;
  if (typeof arg1 === 'object') {
    indents = merge.clone(arg1);
    for (const n of Object.keys(indents)) {
      const x = parseInt(indents[n], 10);
      indents[n] = x || defaultIndent;
    }
  }
  const doIndent = (value, size) =>
      value.replace(/\n/g, '\n' + ' '.repeat(size));

  const indentProp = (property, value) => {
    if (typeof value !== 'string')
      return value;
    if (!indents)
      return doIndent(value, defaultIndent);
    if (indents && indents[property])
      return doIndent(value, indents[property]);
    return value;
  };

  return function indent(meta, output) {
    if (typeof output !== 'object')
      return doIndent(String(output), defaultIndent);
    for (const n of Object.keys(output))
      output[n] = indentProp(n, output[n]);
    return output;
  };
}

/**
 * Converts output data to string representation
 *
 * [timestamp][level][label]message
 * @param {{string: string|Null|Function}} [fields]
 * @param {Object} [options]
 * @param {Boolean} [options.strict=false]
 * @return {Function}
 */
function print(fields, options = {}) {
  fields = fields || {
    timestamp: '[%s]',
    level: '[%s]',
    label: '[%s]',
    message: null
  };
  return function print(meta, output) {
    if (typeof output !== 'object')
      return output;
    let result = '';
    for (const n of Object.keys(fields)) {
      const fmt = fields[n] || ' %s';
      let v;
      if (typeof fmt === 'function')
        v = fmt(output[n], meta, output);
      else if (output[n])
        v = util.format(fmt, output[n]);
      if (v) result += v;
    }
    if (!options.strict) {
      const o = merge.filter((_, n) => !fields.hasOwnProperty(n))({}, output);
      if (Object.keys(o).length)
        result += '\n' + JSON.stringify(o);
    }
    return result.trim();
  };
}

/**
 * Converts output object to string representation using JSON.stringify
 *
 * @param {Function|Array<any>} [replacer] A function that alters the behavior of the stringification process,
 *        or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object
 *        to be included in the JSON string. If this value is null or not provided, all properties of the object are included
 *        in the resulting JSON string.
 * @param {number|string} [space] A String or Number object that's used to insert white space into the output JSON string for readability purposes.
 * @return {Function}
 */
function printJson(replacer, space) {
  return function printJson(meta, output) {
    if (typeof output !== 'object')
      return output;
    return JSON.stringify(output, replacer, space);
  };
}

/**
 * Formatters combination for console output
 *
 * @return {Function}
 */
function printConsole() {
  const funcs = [
    timestamp('YYYY-MM-DD HH:mm:ss'),
    colorize(),
    upperCase('level'),
    print(),
    wordWrap(160),
    indent()
  ];
  return function printConsole(meta, output, ...args) {
    for (const fn of funcs) {
      output = fn(meta, output, ...args);
    }
    return output;
  };
}

/**
 * Format combination for log files
 *
 * @return {Function}
 */
function printFile() {
  const funcs = [
    timestamp('YYYY-MM-DD HH:mm:ss'),
    upperCase('level'),
    print(),
    indent()
  ];
  return function printFile(meta, output, ...args) {
    for (const fn of funcs) {
      output = fn(meta, output, ...args);
    }
    return output;
  };
}

module.exports = {
  add,
  remove,
  timestamp,
  colorize,
  lowerCase,
  upperCase,
  wordWrap,
  indent,
  print,
  printJson,
  printConsole,
  printFile
};
