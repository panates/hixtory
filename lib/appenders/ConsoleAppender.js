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
 * @class ConsoleAppender
 * @extends Appender
 */
class ConsoleAppender extends Appender {

  _write(chunk, encoding, callback) {
    try {
      const data = typeof chunk === 'object' ?
          JSON.stringify(chunk) : chunk;
      console.log(data);
    } finally {
      callback();
    }
  }

}

module.exports = ConsoleAppender;
