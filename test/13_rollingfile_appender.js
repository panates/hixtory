/* eslint-disable */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const {appenders} = require('../');
const {RollingFileAppender} = appenders;

describe('RollingFileAppender', function() {

  const filename = path.resolve(__dirname, 'tempfile.log');

  function deleteTemp() {
    if (fs.existsSync(filename))
      fs.unlinkSync(filename);
  }

  beforeEach(deleteTemp);
  after(deleteTemp);

  it('should close()', function() {
    const appender = new RollingFileAppender({filename});
    appender._attach();
    appender._detach();
    return appender.close().then(() => {
      assert.strictEqual(appender.closing, false);
      assert.strictEqual(appender.closed, true);
    });
  });

  it('should write text data to stream', function() {
    const appender = new RollingFileAppender({filename});
    appender._attach();
    appender.append(null, 'text');
    appender._detach();
    return appender.close(() => {
      assert(fs.existsSync(filename));
      assert.strictEqual(fs.readFileSync(filename, 'utf8'), 'text\n');
    });
  });

  it('should write object data to stream', function() {
    const appender = new RollingFileAppender({filename});
    appender._attach();
    appender.append(null, {});
    appender._detach();
    return appender.close(() => {
      assert(fs.existsSync(filename));
      assert.strictEqual(fs.readFileSync(filename, 'utf8'), '{}\n');
    });
  });

});
