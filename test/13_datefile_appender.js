/* eslint-disable */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const {appenders} = require('../');
const {DateFileAppender} = appenders;
const fecha = require('fecha');

describe('DateFileAppender', function() {

  const filename = path.resolve(__dirname, 'tempfile.log');
  const datefilename = path.resolve(__dirname, 'tempfile.' +
      fecha.format(new Date(), 'YYYY-MM-DD') + '.log');
  const datefilename2 = path.resolve(__dirname, 'tempfile.' +
      fecha.format(new Date(), 'YYYYMMDD') + '.log');

  function deleteTemp() {
    if (fs.existsSync(filename))
      fs.unlinkSync(filename);
    if (fs.existsSync(datefilename))
      fs.unlinkSync(datefilename);
    if (fs.existsSync(datefilename2))
      fs.unlinkSync(datefilename2);
  }

  beforeEach(deleteTemp);
  after(deleteTemp);

  it('should close()', function() {
    const appender = new DateFileAppender({filename});
    appender._attach();
    appender._detach();
    return appender.close().then(() => {
      assert.strictEqual(appender.closing, false);
      assert.strictEqual(appender.closed, true);
    });
  });

  it('should write text data to stream', function() {
    const appender = new DateFileAppender({filename});
    appender._attach();
    appender.append(null, 'text');
    appender._detach();
    return appender.close(() => {
      assert(fs.existsSync(filename));
      assert.strictEqual(fs.readFileSync(filename, 'utf8'), 'text\n');
    });
  });

  it('should write object data to stream', function() {
    const appender = new DateFileAppender({filename});
    appender._attach();
    appender.append(null, {});
    appender._detach();
    return appender.close(() => {
      assert(fs.existsSync(filename));
      assert.strictEqual(fs.readFileSync(filename, 'utf8'), '{}\n');
    });
  });

  it('should always can be included date pattern in filename', function() {
    const appender = new DateFileAppender({
      filename,
      alwaysIncludePattern: true
    });
    appender._attach();
    appender.append(null, 'text');
    appender._detach();
    return appender.close(() => {
      assert(fs.existsSync(datefilename));
      assert.strictEqual(fs.readFileSync(datefilename, 'utf8'), 'text\n');
    });
  });

  it('should set date pattern', function() {
    const appender = new DateFileAppender({
      filename,
      alwaysIncludePattern: true,
      pattern: 'yyyyMMdd'
    });
    appender._attach();
    appender.append(null, 'text');
    appender._detach();
    return appender.close(() => {
      assert(fs.existsSync(datefilename2));
      assert.strictEqual(fs.readFileSync(datefilename2, 'utf8'), 'text\n');
    });
  });

});
