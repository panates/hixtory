/* eslint-disable */

const assert = require('assert');
const {appenders} = require('../');
const {StreamAppender} = appenders;
const {Writable} = require('stream');

describe('StreamAppender', function() {

  let lastWriten;

  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      lastWriten = chunk.toString('utf8');
      callback();
    }
  });

  it('should write data to stream', function() {
    const appender = new StreamAppender({stream});
    appender._attach();
    appender.append(null, 'text');
    assert.strictEqual(lastWriten, 'text');
    appender._detach();
  });

  it('should close()', function() {
    const appender = new StreamAppender({stream});
    return appender.close().then(() => {
      assert.strictEqual(stream._writableState.destroyed, true);
    });
  });

});
