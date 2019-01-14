/* eslint-disable */

const assert = require('assert');
const Hixtory = require('../');
const {createLogger, appenders} = Hixtory;
const config = require('../lib/config');
const MockAppender = require('./support/MockAppender');

describe('Logger', function() {

  describe('Init and configure logger', function() {

    it('should create logger', function() {
      const logger = createLogger();
      assert.strictEqual(logger.level, 'info');
      assert.deepStrictEqual(logger.levels, config.hixtory.levels);
      assert.deepStrictEqual(logger.colors, config.hixtory.colors);
      assert(!logger.defaultMeta);
    });

    it('should reconfigure after create', function() {
      const logger = createLogger();
      assert.deepStrictEqual(logger.levels, config.hixtory.levels);
      assert.deepStrictEqual(logger.colors, config.hixtory.colors);
      assert(typeof logger.trace, 'function');
      logger.configure({
        levels: 'npm'
      });
      assert.deepStrictEqual(logger.levels, config.npm.levels);
      assert.deepStrictEqual(logger.colors, config.npm.colors);
      assert(!logger.trace);
      assert(typeof logger.http, 'function');
      logger.configure();
      assert.deepStrictEqual(logger.levels, config.hixtory.levels);
    });

    it('should configure predefined levels', function() {
      const logger = createLogger({
        levels: 'npm'
      });
      assert.deepStrictEqual(logger.levels, config.npm.levels);
      assert.deepStrictEqual(logger.colors, config.npm.colors);
    });

    it('should throw if unknown predefined level given', function() {
      assert.throws(() => {
        createLogger({
          levels: 'other'
        });
      }, /There is no predefined levels/);
    });

    it('should configure custom levels', function() {
      const logger = createLogger({
        levels: ['error', 'info']
      });
      assert.deepStrictEqual(logger.levels, ['error', 'info']);
    });

    it('should configure logger level', function() {
      const logger = createLogger({
        level: 'debug'
      });
      assert.strictEqual(logger.level, 'debug');
    });

    it('should set levels after create', function() {
      const logger = createLogger();
      assert.deepStrictEqual(logger.levels, config.hixtory.levels);
      assert.deepStrictEqual(logger.colors, config.hixtory.colors);
      logger.setLevels('npm');
      assert.deepStrictEqual(logger.levels, config.npm.levels);
      assert.deepStrictEqual(logger.colors, config.npm.colors);
    });

    it('should not set levels of child logger', function() {
      const logger = createLogger();
      const child = logger.createChild();
      assert.throws(() => {
        child.setLevels('npm');
      }, /Levels of child loggers can't be changed/);
    });

    it('should setLevels() check predefined levels exists', function() {
      const logger = createLogger();
      assert.throws(() => {
        logger.setLevels('nothing');
      }, /There is no predefined levels/);
    });

    it('should setLevels() validate argument', function() {
      const logger = createLogger();
      assert.throws(() => {
        logger.setLevels(1234);
      }, /type required to set levels/);
    });

    it('should setLevels() validate if level name is valid', function() {
      const logger = createLogger();
      assert.throws(() => {
        logger.setLevels(['-ab', 'abc']);
      }, /is not a valid level name/);
    });

    it('should set colors after create', function() {
      const logger = createLogger();
      assert.deepStrictEqual(logger.levels, config.hixtory.levels);
      assert.deepStrictEqual(logger.colors, config.hixtory.colors);
      logger.setColors({error: 'brown'});
      assert.deepStrictEqual(logger.colors, {error: 'brown'});
    });

    it('should setColors validate arguments', function() {
      const logger = createLogger();
      assert.throws(() => {
        logger.setColors(1234);
      }, /Object type required to set colors/);
    });

    it('should change logger level', function() {
      const logger = createLogger({
        level: 'debug'
      });
      assert.strictEqual(logger.level, 'debug');
      logger.level = 'error';
      assert.strictEqual(logger.level, 'error');
    });

    it('should not change logger level if not level is not configured', function() {
      const logger = createLogger({});
      assert.throws(() => {
        logger.level = 'other';
      }, /No such level/);
    });

    it('should configure default meta', function() {
      const logger = createLogger({
        defaultMeta: {any: 'property'}
      });
      assert.deepStrictEqual(logger.defaultMeta, {any: 'property'});
    });

    it('should configure label', function() {
      const logger = createLogger({
        label: 'label1'
      });
      assert.strictEqual(logger.label, 'label1');
    });

    it('should configure targets', function() {
      const logger = createLogger({
        targets: {
          console: new appenders.ConsoleAppender()
        }
      });
      assert(logger.targets.console);
      assert(logger.targets.console.appender instanceof
          appenders.ConsoleAppender);
      assert.strictEqual(logger.targets.console.name, 'console');
    });

    it('should add targets after create', function() {
      const logger = createLogger({
        targets: {
          console: new appenders.ConsoleAppender()
        }
      });
      logger.addTarget('console2', {
        appender: new appenders.ConsoleAppender
      });
      assert(logger.targets.console);
      assert(logger.targets.console.appender instanceof
          appenders.ConsoleAppender);
      assert.strictEqual(logger.targets.console.name, 'console');
      assert(logger.targets.console2);
      assert(logger.targets.console2.appender instanceof
          appenders.ConsoleAppender);
      assert.strictEqual(logger.targets.console2.name, 'console2');
    });

    it('should not add targets if name already exists', function() {
      const logger = createLogger({
        targets: {
          console: new appenders.ConsoleAppender()
        }
      });
      assert.throws(() => {
        logger.addTarget('console', {
          appender: new appenders.ConsoleAppender
        });
      });
    });

    it('should remove targets after create', function() {
      const appender = new appenders.ConsoleAppender();
      const logger = createLogger({
        targets: {
          console: appender
        }
      });
      const child = logger.createChild({
        targets: {
          console: {
            enabled: false
          }
        }
      });
      child.removeTarget('console');
      assert.strictEqual(appender.closed, false);
      logger.removeTarget('console');
      logger.removeTarget('unknown');
      assert(!logger.targets.console);
    });

    it('should validate "targets" property is object', function() {
      assert.throws(() => {
        createLogger({targets: 123});
      }, /Object type required/);
    });

    it('should validate each "targets" has name', function() {
      assert.throws(() => {
        createLogger({
          targets: {
            '': null
          }
        });
      }, /ou must provide target name/);
    });

    it('should validate each "targets" item is object', function() {
      assert.throws(() => {
        createLogger({
          targets: {
            console: 123
          }
        });
      }, /Object type required/);
    });

    it('should validate "target.appender" is Appender', function() {
      assert.throws(() => {
        createLogger({
          targets: {
            console: {
              appender: 123
            }
          }
        });
      }, /Appender instance required/);
    });

    it('should validate "target.filter" is function', function() {
      assert.throws(() => {
        createLogger({
          targets: {
            console: {
              filter: 123
            }
          }
        });
      }, /Function type required/);
    });

    it('should validate "target.level"', function() {
      assert.throws(() => {
        createLogger({
          targets: {
            console: {
              level: 'other'
            }
          }
        });
      }, /No such level/);
    });

  });

  describe('Init and configure child logger', function() {

    it('should create child logger', function() {
      const logger = createLogger();
      const child = logger.createChild();
      assert.strictEqual(child.parent, logger);
      assert.strictEqual(child.root, logger);
      assert.strictEqual(child.level, 'info');
      assert.deepStrictEqual(child.levels, config.hixtory.levels);
      assert.deepStrictEqual(child._colors, config.hixtory.colors);
      assert(!child.defaultMeta);
    });

    it('should not configure levels of child loggers', function() {
      const logger = createLogger();
      assert.throws(() => {
        logger.createChild({
          levels: 'npm'
        });
      }, /Levels of child loggers can't be changed/);
    });

    it('should overwrite level', function() {
      const logger = createLogger();
      const child = logger.createChild({level: 'warn'});
      assert.strictEqual(child.level, 'warn');
    });

    it('should validate level', function() {
      const logger = createLogger();
      assert.throws(() => {
        logger.createChild({level: 'other'});
      }, /No such level/);
    });

    it('should configure default meta', function() {
      const logger = createLogger();
      const child = logger.createChild({
        defaultMeta: {any: 'property'}
      });
      assert.deepStrictEqual(child.defaultMeta, {any: 'property'});
    });

    it('should overwrite label', function() {
      const logger = createLogger();
      const child = logger.createChild({
        label: 'label1'
      });
      assert.deepStrictEqual(child.label, 'label1');
    });

    it('should reset child level', function() {
      const logger = createLogger();
      const child = logger.createChild({
        level: 'debug'
      });
      assert.strictEqual(child.level, 'debug');
      child.level = null;
      assert.strictEqual(child.level, 'info');
    });

    it('should configure targets', function() {
      const logger = createLogger({
        targets: {
          console: new appenders.ConsoleAppender()
        }
      });
      const child = logger.createChild({
        targets: {
          console2: new appenders.ConsoleAppender()
        }
      });
      assert(child.targets.console);
      assert(child.targets.console2);
      assert(child.targets.console.appender instanceof
          appenders.ConsoleAppender);
      assert(child.targets.console2.appender instanceof
          appenders.ConsoleAppender);
    });

    it('should disable targets', function() {
      const logger = createLogger({
        targets: {
          console: new appenders.ConsoleAppender()
        }
      });
      const child = logger.createChild({
        targets: {
          console: null
        }
      });
      assert.strictEqual(child.targets.console.enabled, false);
    });

    it('should overwrite target properties', function() {
      const logger = createLogger({
        targets: {
          console: {
            appender: new appenders.ConsoleAppender(),
            level: 'debug',
            filter: () => true,
            format: () => true
          }
        }
      });
      const child = logger.createChild({
        targets: {
          console: {
            appender: new appenders.ConsoleAppender(),
            enabled: false,
            level: 'warn',
            filter: () => true,
            format: [() => true]
          }
        }
      });
      assert.strictEqual(logger.targets.console.level, 'debug');
      assert.strictEqual(child.targets.console.level, 'warn');
      assert.notStrictEqual(child.targets.console.appender, logger.targets.console.appender);
      assert.strictEqual(child.targets.console.enabled, false);
      assert.notStrictEqual(child.targets.console.filter, logger.targets.console.filter);
      assert.notStrictEqual(child.targets.console.format, logger.targets.console.format);

      child.targets.console.appender = null;
      assert.strictEqual(child.targets.console.appender, logger.targets.console.appender);
      child.targets.console.enabled = null;
      assert.strictEqual(child.targets.console.enabled, true);
      child.targets.console.filter = null;
      assert.strictEqual(child.targets.console.filter, null);
      child.targets.console.filter = undefined;
      assert.strictEqual(child.targets.console.filter, logger.targets.console.filter);
      child.targets.console.format = null;
      assert.strictEqual(child.targets.console.format, null);
      child.targets.console.format = undefined;
      assert.strictEqual(child.targets.console.format, logger.targets.console.format);
      child.targets.console.level = null;
      assert.strictEqual(child.targets.console.level, logger.targets.console.level);
    });

    it('should update after reconfigure parent', function() {
      const logger = createLogger({
        levels: 'npm',
        level: 'verbose',
        targets: {
          console: {
            appender: new appenders.ConsoleAppender(),
            level: 'debug'
          }
        }
      });
      const child1 = logger.createChild({
        level: 'http',
        targets: {
          console: null
        }
      });
      const child2 = child1.createChild({
        level: 'http',
        targets: {
          console: {
            level: 'silly'
          }
        }
      });
      logger.configure({
        targets: {
          console: {
            appender: new appenders.ConsoleAppender(),
            level: 'error'
          }
        }
      }); // reset configuration
      assert.deepStrictEqual(logger.levels, config.hixtory.levels);
      assert.strictEqual(logger.level, 'info');
      assert.strictEqual(child2.level, 'info');
      assert.strictEqual(child2.targets.console.level, 'error');
    });

  });

  describe('Logging', function() {

    it('should write to appenders', function() {
      const mock = new MockAppender();
      const logger = createLogger({
        level: 'trace',
        defaultMeta: {id: 1},
        targets: {mock}
      });

      let i = 0;
      for (const level of config.hixtory.levels) {
        const message = 'Log ' + ++i;
        logger.log(level, message);
        assert(mock.lastChunk);
        assert.strictEqual(mock.lastChunk.level, level);
        assert.strictEqual(mock.lastChunk.message, message);
        assert.strictEqual(mock.lastChunk.id, 1);
        logger[level](message);
        assert.strictEqual(mock.lastChunk.level, level);
        assert.strictEqual(mock.lastChunk.message, message);
        assert.strictEqual(mock.lastChunk.id, 1);
      }
      logger.error(new Error('Any error message'));
      assert.strictEqual(mock.lastChunk.message, 'Any error message');
      assert(mock.lastChunk.stack);
      assert.strictEqual(mock.lastChunk.id, 1);
    });

    it('should child.log() write to both parent and child appenders', function() {
      const mock1 = new MockAppender();
      const mock2 = new MockAppender();
      const logger = createLogger({
        level: 'trace',
        targets: {mock1}
      });
      const child = logger.createChild({
        level: 'trace',
        targets: {mock2}
      });
      let i = 0;
      for (const level of config.hixtory.levels) {
        const message = 'Log ' + ++i;
        child.log(level, message);
        assert.strictEqual(mock1.lastChunk.level, level);
        assert.strictEqual(mock1.lastChunk.message, message);
        assert.strictEqual(mock2.lastChunk.level, level);
        assert.strictEqual(mock2.lastChunk.message, message);
        logger[level](message);
        assert.strictEqual(mock1.lastChunk.level, level);
        assert.strictEqual(mock1.lastChunk.message, message);
        assert.strictEqual(mock2.lastChunk.level, level);
        assert.strictEqual(mock2.lastChunk.message, message);
      }
    });

    it('should not write to appenders twice', function() {
      const mock1 = new MockAppender();
      const mock2 = new MockAppender();
      const logger = createLogger({
        level: 'trace',
        targets: {mock1}
      });
      const child = logger.createChild({
        level: 'trace',
        targets: {
          mock1: new MockAppender(),
          mock2
        }
      });
      child.info('test');
      assert(!mock1.lastChunk);
    });

    it('should log if level is lover than logger level', function() {
      const mock = new MockAppender();
      const logger = createLogger({
        level: 'warn',
        targets: {mock}
      });
      logger.error(1);
      assert.strictEqual(mock.lastChunk.level, 'error');
      logger.warn(1);
      assert.strictEqual(mock.lastChunk.level, 'warn');
      logger.info(1);
      assert.strictEqual(mock.lastChunk.level, 'warn');
    });

    it('should filter before write to appenders', function() {
      const mock = new MockAppender();
      const logger = createLogger({
        level: 'trace',
        targets: {
          mock: {
            appender: mock,
            filter: (o) => o.message.includes('it is ok')
          }
        }
      });
      logger.info('not ok');
      assert(!mock.lastChunk);
      logger.info('it is ok 1');
      assert.strictEqual(mock.lastChunk.message, 'it is ok 1');
    });

    it('should add data to meta before logging', function() {
      const mock = new MockAppender();
      const logger = createLogger({
        targets: {mock}
      });
      logger.meta({id: 1}).info('message');
      assert.strictEqual(mock.lastChunk.id, 1);
      assert.strictEqual(mock.lastChunk.message, 'message');
    });

    it('should throw if level is not valid', function() {
      const mock = new MockAppender();
      const logger = createLogger({
        targets: {mock}
      });
      assert.throws(() => {
        logger.log('other', 'message');
      });
    });

    it('should not log after close', function() {
      const mock = new MockAppender();
      const logger = createLogger({
        targets: {mock}
      });
      return logger.close().then(() => {
        logger.info('message');
        assert(!mock.lastChunk);
      });
    });

  });

  describe('Graceful shutdown', function() {

    it('should graceful shutdown all appenders', function() {
      const mock = new MockAppender();
      const logger = createLogger({
        targets: {mock}
      });
      let i = 0;
      mock.on('close', () => {
        i++;
      });
      return logger.close().then(() => {
        assert.strictEqual(i, 1);
        return mock.close();
      });
    });

    it('should close child logger', function() {
      const mock1 = new MockAppender();
      const mock2 = new MockAppender();
      const logger = createLogger({
        level: 'trace',
        targets: {mock1}
      });
      const child = logger.createChild({
        level: 'trace',
        targets: {mock2}
      });
      assert.strictEqual(logger.children.length, 1);
      return child.close(() => {
        assert.strictEqual(logger.children.length, 0);
      });
    });

  });

});
