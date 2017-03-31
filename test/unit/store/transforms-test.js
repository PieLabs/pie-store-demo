import { expect } from 'chai';
import { stub, match, assert, spy } from 'sinon';
import proxyquire from 'proxyquire';
import { Readable, Writable } from 'stream';

describe('StringTranform', () => {

  let mod;

  before(() => {
    mod = require('../../../lib/store/transforms');
  });

  it('creates a whole string from a stream', (done) => {


    let s = new Readable();
    s._read = () => { };
    console.log('mod: ', mod);
    let transform = new mod.StringTransform();

    let receivedChunks = [];
    let w = new Writable({
      write: function (chunk, enc, done) {
        receivedChunks.push(chunk);
        done();
      }
    });
    s.push('hi');
    s.push(' ');
    s.push('there');
    s.push(null);

    s
      .pipe(transform)
      .pipe(w)
      .on('finish', () => {
        expect(receivedChunks[0].toString('utf8')).to.eql('hi there');
        done();
      })
      .on('error', done);

  });
});