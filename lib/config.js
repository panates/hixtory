/*
 ------------------------
 (c) 2018-present Panates
 Freely distributed under the MIT license.
 */
'use strict';

/**
 *
 * @type {Object}
 */
module.exports = {

  /**
   *
   * @type {Object}
   */
  hixtory: {
    /**
     *
     * @type {Array<String>}
     */
    levels: ['fatal', 'error', 'warn', 'info', 'verbose', 'debug', 'trace'],
    /**
     *
     * @type {Object}
     */
    colors: {
      fatal: 'redBright bgYellow bold',
      error: 'redBright bold',
      warn: 'yellowBright bold',
      info: 'greenBright bold',
      verbose: 'cyanBright bold',
      debug: 'blueBright bold',
      trace: 'magentaBright bold'
    }
  },

  /**
   *
   * @type {Object}
   */
  cli: {
    /**
     *
     * @type {Array<String>}
     */
    levels: ['error', 'warn', 'help', 'data', 'info', 'debug',
      'prompt', 'verbose', 'input', 'silly'],
    /**
     *
     * @type {Object}
     */
    colors: {
      error: 'redBright bold',
      warn: 'yellowBright bold',
      help: 'cyanBright bold',
      data: 'grey bold',
      info: 'greenBright bold',
      debug: 'blueBright bold',
      prompt: 'grey bold',
      verbose: 'cyanBright bold',
      input: 'grey bold',
      silly: 'magentaBright bold'
    }
  },

  /**
   *
   * @type {Object}
   */
  npm: {
    /**
     *
     * @type {Array<String>}
     */
    levels: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    /**
     *
     * @type {Object}
     */
    colors: {
      error: 'redBright bold',
      warn: 'yellowBright bold',
      info: 'greenBright bold',
      http: 'greenBright bold',
      verbose: 'cyanBright bold',
      debug: 'blueBright bold',
      silly: 'magentaBright bold'
    }
  },

  /**
   *
   * @type {Object}
   */
  syslog: {
    /**
     *
     * @type {Array<String>}
     */
    levels: ['emerg', 'alert', 'crit', 'error', 'warning',
      'notice', 'info', 'debug'],
    /**
     *
     * @type {Object}
     */
    colors: {
      emerg: 'yellowBright bgRed bold',
      alert: 'yellowBright bgRed bold',
      crit: 'redBright bgYellow bold',
      error: 'redBright bold',
      warning: 'yellowBright bold',
      notice: 'yellowBright bold',
      info: 'greenBright bold',
      verbose: 'cyanBright bold',
      debug: 'blueBright bold'
    }
  }

};
