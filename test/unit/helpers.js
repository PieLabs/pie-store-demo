import { expect } from 'chai';
import { stub, match, assert, spy } from 'sinon';
import proxyquire from 'proxyquire';

export function MockRouter() {

  this.handlers = {
    get: {},
    delete: {},
    post: {},
    put: {}
  }

  let mocked = (method) => {
    return spy(function (path, handler) {
      this.handlers[method][path] = handler;
    })
  }

  this.get = spy(mocked('get'));
  this.delete = spy(mocked('delete'));
  this.post = spy(mocked('post'));
  this.put = spy(mocked('put'));
}

export function MockResponse() {

  let lastCall = (d) => {
    if (this.done) {
      this.done();
    } else {
      console.warn('done is not set - that right?');
    }
    return this;
  }

  this.status = stub().returns(this);

  this.send = spy(lastCall);
  this.json = spy(lastCall);
}
