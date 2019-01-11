/* eslint-disable */

const assert = require('assert');
const {rejects, doesNotReject} = require('rejected-or-not');
const MockAppender = require('./support/MockAppender');

assert.rejects = assert.rejects || rejects;
assert.doesNotReject = assert.doesNotReject || doesNotReject;

describe('Appender', function() {

  it('should set highWaterMark on create', function() {
    const mock = new MockAppender({
      highWaterMark: 20
    });
    assert.strictEqual(mock._writableState.objectMode, true);
    assert.strictEqual(mock._writableState.highWaterMark, 20);
  });

  it('should write', function() {
    const mock = new MockAppender();
    mock.append(null, {test: 'data'});
    assert.deepStrictEqual(mock.lastChunk, {test: 'data'});
  });

  it('should call formatters before write', function() {
    const mock = new MockAppender();
    let i = 0;
    mock.append(null, {test: 'data'}, [() => {i++;}]);
    mock.append(null, {test: 'data'}, () => {i++;});
    assert.strictEqual(i, 2);
  });

  it('should append string data', function() {
    const mock = new MockAppender();
    mock.append(null, 'test data');
    assert.strictEqual(mock.lastChunk, 'test data');
  });

  it('should append array data', function() {
    const mock = new MockAppender();
    mock.append(null, ['test data']);
    assert.deepStrictEqual(mock.lastChunk, ['test data']);
  });

  it('should close() return promise', function() {
    const mock = new MockAppender();
    return mock.close();
  });

  it('should reject close() on error', function() {
    const mock = new MockAppender({emitErrorOnClose: true});
    return assert.rejects(() => mock.close());
  });

  it('should reject close() on _close throw error', function() {
    const mock = new MockAppender({errorOnClose: true});
    return assert.rejects(() => mock.close());
  });

  it('should not close if attached to a logger', function() {
    const mock = new MockAppender();
    mock._attach();
    return mock.close().then(() => {
      assert(!mock._writableState.destroyed);
      mock._detach();
      return mock.close(() => {
        assert(mock._writableState.destroyed);
      });
    });
  });

  it('should close after detach', function(done) {
    const mock = new MockAppender();
    mock.on('close', done);
    mock._attach();
    mock._detach();
  });

});
