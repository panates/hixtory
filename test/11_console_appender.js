/* eslint-disable */

const assert = require('assert');
const {appenders} = require('../');
const {ConsoleAppender} = appenders;

describe('ConsoleAppender', function() {

  const oldWrite = process.stdout.write;

  function hookStdout(callback) {
    process.stdout.write = (chunk, encoding, fd) => {
      callback(chunk, encoding, fd);
    };
  }

  after(() => {
    process.stdout.write = oldWrite;
  });

  it('should write text data to console', function() {
    let s = null;
    hookStdout((chunk) => {s = chunk;});
    const mock = new ConsoleAppender();
    mock.append(null, 'text');
    assert.strictEqual(s, 'text\n');
  });

  it('should write object data to console', function() {
    let s = null;
    hookStdout((chunk) => {s = chunk;});
    const mock = new ConsoleAppender();
    mock.append(null, {id: 1});
    assert.strictEqual(s, '{"id":1}\n');
  });

});
