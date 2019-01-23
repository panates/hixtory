/* eslint-disable */

const assert = require('assert');
const {rejects, doesNotReject} = require('rejected-or-not');
const clr = require('ansi-colors');
const Hixtory = require('../');
const MockAppender = require('./support/MockAppender');
const {formatters} = Hixtory;
const fecha = require('fecha');

assert.rejects = assert.rejects || rejects;
assert.doesNotReject = assert.doesNotReject || doesNotReject;

describe('Formatters', function() {

  let logger;
  let appender;

  before(() => {
    appender = new MockAppender();
    logger = {
      _colors: Hixtory.config.hixtory.colors
    };
  });

  describe('add formatter', function() {

    const data = {test: 'data'};

    it('should merge log data with given object', function() {
      appender.append(null, data, formatters.add({id: 1}));
      assert.deepStrictEqual(appender.lastChunk, {test: 'data', id: 1});
    });

    it('should ignore if output is not an object', function() {
      appender.append(null, 'abcd', formatters.add({id: 1}));
      assert.deepStrictEqual(appender.lastChunk, 'abcd');
    });

  });

  describe('remove formatter', function() {

    const data = {test: 'data', id: 1};

    it('should remove properties from output', function() {
      appender.append(null, data, formatters.remove('id'));
      assert.deepStrictEqual(appender.lastChunk, {test: 'data'});
    });

    it('should ignore if output is not an object', function() {
      appender.append(null, 'abcd', formatters.remove({id: 1}));
      assert.deepStrictEqual(appender.lastChunk, 'abcd');
    });

  });

  describe('timestamp formatter', function() {

    const data = {timestamp: new Date(2019, 0, 1, 0, 0, 0, 0)};

    it('should set output.timestamp to new Date() if null', function() {
      appender.append(null, {}, formatters.timestamp());
      assert(appender.lastChunk.timestamp instanceof Date);
    });

    it('should not set output.timestamp to if not null', function() {
      const d = new Date();
      appender.append(null, {timestamp: d}, formatters.timestamp());
      assert.strictEqual(appender.lastChunk.timestamp, d);
    });

    it('should convert timestamp to string with given format', function() {
      appender.append(null, data, formatters.timestamp('YYYY-MM-DD'));
      assert.deepStrictEqual(appender.lastChunk, {timestamp: '2019-01-01'});
    });

    it('should ignore if output is not an object', function() {
      appender.append(null, 'abcd', formatters.timestamp());
      assert.deepStrictEqual(appender.lastChunk, 'abcd');
    });

  });

  describe('colorize formatter', function() {

    it('should colorize data properties', function() {
      appender.append(null, {
        timestamp: '2019',
        label: 'label1'
      }, formatters.colorize({
        label: 'yellow bgRed'
      }));
      assert.strictEqual(appender.lastChunk.timestamp, clr.blueBright('2019'));
      assert.strictEqual(appender.lastChunk.label, clr.yellow.bgRed('label1'));
    });

    it('should ignore invalid color modifiers', function() {
      appender.append(null, {label: 'label1'}, formatters.colorize({
        label: 'yellow invalid'
      }));
      assert.strictEqual(appender.lastChunk.label, clr.yellow('label1'));
    });

    it('should use logger level colors if not defined', function() {
      appender.append(logger, {
        level: 'error'
      }, formatters.colorize());
      assert.strictEqual(appender.lastChunk.level, clr.redBright.bold('error'));
    });

    it('should use function callback as color', function() {
      appender.append(logger, {
        label: 'label1'
      }, formatters.colorize({label: () => 'blue'}));
      assert.strictEqual(appender.lastChunk.label, clr.blue('label1'));
    });

    it('should set output.timestamp to new Date() if null', function() {
      appender.append(null, {
        timestamp: '2019',
        label: 'label1'
      }, formatters.colorize());
      assert.strictEqual(appender.lastChunk.timestamp, clr.blueBright('2019'));
      assert.strictEqual(appender.lastChunk.label, clr.cyan.italic('label1'));
    });

    it('should ignore if output is not an object', function() {
      appender.append(null, 'abcd', formatters.colorize());
      assert.deepStrictEqual(appender.lastChunk, 'abcd');
    });

  });

  describe('lowerCase formatter', function() {

    it('should capitalize given properties', function() {
      appender.append(null, {
        prop1: 'ABC',
        prop2: 'ABC'
      }, formatters.lowerCase('prop1'));
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'abc',
        prop2: 'ABC'
      });
    });

    it('should capitalize all properties if no property given', function() {
      appender.append(null, {
        prop1: 'ABC',
        prop2: 'ABC'
      }, formatters.lowerCase());
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'abc',
        prop2: 'abc'
      });
    });

    it('should ignore not string properties', function() {
      appender.append(null, {
        prop1: 'ABC',
        prop2: 1
      }, formatters.lowerCase());
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'abc',
        prop2: 1
      });
      appender.append(null, {
        prop1: 'ABC',
        prop2: 1
      }, formatters.lowerCase('prop2'));
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'ABC',
        prop2: 1
      });
    });

    it('should capitalize whole output if it is a string', function() {
      appender.append(null, 'AbCdE', formatters.lowerCase());
      assert.deepStrictEqual(appender.lastChunk, 'abcde');
    });

  });

  describe('upperCase formatter', function() {

    it('should capitalize given properties', function() {
      appender.append(null, {
        prop1: 'abc',
        prop2: 'abc'
      }, formatters.upperCase('prop1'));
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'ABC',
        prop2: 'abc'
      });
    });

    it('should capitalize all properties if no property given', function() {
      appender.append(null, {
        prop1: 'abc',
        prop2: 'abc'
      }, formatters.upperCase());
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'ABC',
        prop2: 'ABC'
      });
    });

    it('should ignore not string properties', function() {
      appender.append(null, {
        prop1: 'abc',
        prop2: 1
      }, formatters.upperCase());
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'ABC',
        prop2: 1
      });
      appender.append(null, {
        prop1: 'abc',
        prop2: 1
      }, formatters.upperCase('prop2'));
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'abc',
        prop2: 1
      });
    });

    it('should keep color info', function() {
      appender.append(null, {
        prop1: '\u001b[33mabc\u001b[32m'
      }, formatters.upperCase());
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: '\u001b[33mABC\u001b[32m'
      });
    });

    it('should capitalize whole output if it is a string', function() {
      appender.append(null, 'AbCdE', formatters.upperCase());
      assert.deepStrictEqual(appender.lastChunk, 'ABCDE');
    });

  });

  describe('wordWrap formatter', function() {

    it('should wrap all object properties with default length if no option given', function() {
      appender.append(null, {
        prop1: 'word '.repeat(20).trim()
      }, formatters.wordWrap());
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'word word word word word word word word word word word word word word word word\nword word word word'
      });
    });

    it('should wrap all object properties with given length if max length given as argument', function() {
      appender.append(null, {
        prop1: 'word '.repeat(10).trim()
      }, formatters.wordWrap(20));
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'word word word word\nword word word word\nword word'
      });
    });

    it('should wrap each properties with different length', function() {
      appender.append(null, {
        prop1: 'word '.repeat(10).trim(),
        prop2: 'word '.repeat(10).trim(),
        prop3: 'word '.repeat(20).trim(),
        prop4: 'word '.repeat(20).trim()
      }, formatters.wordWrap({prop1: 20, prop2: 25, prop3: null}));
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'word word word word\nword word word word\nword word',
        prop2: 'word word word word word\nword word word word word',
        prop3: 'word word word word word word word word word word word word word word word word\nword word word word',
        prop4: 'word word word word word word word word word word word word word word word word word word word word'
      });
    });

    it('should ignore property if not a string', function() {
      appender.append(null, {
        prop1: 'word '.repeat(10).trim(),
        prop2: 123,
        prop3: null
      }, formatters.wordWrap({prop1: 20, prop2: 25}));
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'word word word word\nword word word word\nword word',
        prop2: 123,
        prop3: null
      });
    });

    it('should wrap if output is string', function() {
      appender.append(null, 'word word word word word word word word word word', formatters.wordWrap(20));
      assert.deepStrictEqual(appender.lastChunk, 'word word word word\nword word word word\nword word');
    });

    it('should not wrap maxLen=0', function() {
      appender.append(null, 'word word word word word word word word word word', formatters.wordWrap(0));
      assert.deepStrictEqual(appender.lastChunk, 'word word word word word word word word word word');
    });

  });

  describe('indent formatter', function() {

    it('should indent all object properties with default length if no option given', function() {
      appender.append(null, {
        prop1: 'line1\nline2\nline3'
      }, formatters.indent());
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'line1\n  line2\n  line3'
      });
    });

    it('should wrap all object properties with given length if max length given as argument', function() {
      appender.append(null, {
        prop1: 'line1\nline2\nline3'
      }, formatters.indent(3));
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'line1\n   line2\n   line3'
      });
    });

    it('should wrap each properties with different length', function() {
      appender.append(null, {
        prop1: 'line1\nline2\nline3',
        prop2: 'line1\nline2\nline3',
        prop3: 'line1\nline2\nline3',
        prop4: 'line1\nline2\nline3'
      }, formatters.indent({prop1: 1, prop2: 3, prop3: null}));
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'line1\n line2\n line3',
        prop2: 'line1\n   line2\n   line3',
        prop3: 'line1\n  line2\n  line3',
        prop4: 'line1\nline2\nline3'
      });
    });

    it('should ignore property if not string', function() {
      appender.append(null, {
        prop1: 'line1\nline2\nline3',
        prop2: 123,
        prop3: null
      }, formatters.indent({prop1: 1, prop2: 2}));
      assert.deepStrictEqual(appender.lastChunk, {
        prop1: 'line1\n line2\n line3',
        prop2: 123,
        prop3: null
      });
    });

    it('should indent if output is string', function() {
      appender.append(null, 'line1\nline2\nline3', formatters.indent(1));
      assert.deepStrictEqual(appender.lastChunk, 'line1\n line2\n line3');
    });

  });

  describe('print formatter', function() {

    it('should convert output object to text', function() {
      appender.append(null, {
        timestamp: '2019-01-01',
        level: 'info',
        label: 'label',
        message: 'Any message'
      }, formatters.print());
      assert.deepStrictEqual(appender.lastChunk, '[2019-01-01][info][label] Any message');
    });

    it('should ignore any property if not present in output', function() {
      appender.append(null, {
        level: 'info',
        message: 'Any message'
      }, formatters.print());
      assert.deepStrictEqual(appender.lastChunk, '[info] Any message');
    });

    it('should define custom format', function() {
      appender.append(null, {
        label: 'label1',
        level: 'info',
        message: 'Any message',
        id: 1
      }, [
        formatters.timestamp('YYYYMMDD'),
        formatters.print({
          fields: {
            label: ' LBL:%s',
            level: ' LVL:%s',
            timestamp: ' [%s]',
            message: ' %s',
            id: (v) => ' ID:' + v
          }
        })
      ]);
      const ds = fecha.format(new Date(), 'YYYYMMDD');
      assert.deepStrictEqual(appender.lastChunk, 'LBL:label1 LVL:info [' + ds +
          '] Any message ID:1');
    });

    it('should print additional enumerable properties', function() {
      const data = {
        level: 'info',
        message: 'Any message',
        id: 1
      };
      Object.defineProperty(data, '_ignore', {
        enumerable: false,
        value: 1
      });
      appender.append(null, data, formatters.print());
      assert.deepStrictEqual(appender.lastChunk, '[info] Any message\n{"id":1}');
    });

    it('should not print additional data in strict mode', function() {
      appender.append(null, {
        level: 'info',
        message: 'Any message',
        id: 1
      }, formatters.print({strict: true}));
      assert.deepStrictEqual(appender.lastChunk, '[info] Any message');
    });

    it('should not print non plain object properties of metadata', function() {
      appender.append(null, {
        level: 'info',
        message: 'Any message',
        ignorethis: new Map()
      }, formatters.print());
      assert.deepStrictEqual(appender.lastChunk, '[info] Any message');
    });

    it('should ignore if output is not an object', function() {
      appender.append(null, 'abcd', [formatters.print()]);
      assert.deepStrictEqual(appender.lastChunk, 'abcd');
    });

    it('should print error stack', function() {
      const e = new Error('Any message');
      e.stack = '[error stack]';
      e.level = 'error';
      appender.append(null, e, formatters.print({printErrorStack: true}));
      assert(appender.lastChunk.includes('[error stack]'));
    });

    it('should printErrorStack can be a function', function() {
      const e = new Error('Any message');
      e.stack = '[error stack]';
      e.level = 'error';
      appender.append(null, e, formatters.print({printErrorStack: () => true}));
      assert(appender.lastChunk.includes('[error stack]'));
    });

  });

  describe('printJson formatter', function() {

    const data = {test: 'data'};

    it('should convert to json string', function() {
      appender.append(null, data, formatters.printJson());
      assert.strictEqual(appender.lastChunk, JSON.stringify(data));
    });

    it('should pretty print with space property', function() {
      appender.append(null, data, formatters.printJson(null, 2));
      assert.strictEqual(appender.lastChunk, JSON.stringify(data, null, 2));
    });

    it('should stringify using a replacer function', function() {
      const replacer = (name, val) => {
        return val + 1;
      };
      appender.append(null, data, formatters.printJson(replacer, 2));
      assert.strictEqual(appender.lastChunk, JSON.stringify(data, replacer, 2));
    });

    it('should ignore if output is not an object', function() {
      appender.append(null, 'abcd', [formatters.printJson()]);
      assert.deepStrictEqual(appender.lastChunk, 'abcd');
    });

  });

  describe('printConsole formatter', function() {

    it('should convert output object to console flavored text', function() {
      appender.append(null, {
        timestamp: '2019-01-01',
        level: 'info',
        label: 'label',
        message: 'Any message'
      }, formatters.printConsole());
      assert.deepStrictEqual(appender.lastChunk, '[\u001b[94m2019-01-01\u001b[39m][INFO][\u001b[36m\u001b[3mlabel\u001b[23m\u001b[39m] Any message');
    });

    it('should disable formatters', function() {
      appender.append(null, {
        level: 'info',
        label: 'label',
        message: 'Any message\nline2'
      }, formatters.printConsole({
        timestamp: false,
        colorize: false,
        upperCase: false,
        wordWrap: false,
        indent: false
      }));
      assert.deepStrictEqual(appender.lastChunk, '[info][label] Any message\nline2');
    });

  });

  describe('printFile formatter', function() {

    it('should convert output object to console flavored text', function() {
      appender.append(null, {
        timestamp: '2019-01-01',
        level: 'info',
        label: 'label',
        message: 'Any message'
      }, formatters.printFile());
      assert.deepStrictEqual(appender.lastChunk, '[2019-01-01][INFO][label] Any message');
    });

    it('should disable formatters', function() {
      appender.append(null, {
        level: 'info',
        label: 'label',
        message: 'Any message\nline2'
      }, formatters.printFile({
        timestamp: false,
        colorize: false,
        upperCase: false,
        wordWrap: false,
        indent: false
      }));
      assert.deepStrictEqual(appender.lastChunk, '[info][label] Any message\nline2');
    });

  });

});
