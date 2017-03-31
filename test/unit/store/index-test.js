import { stub, assert, spy, match } from 'sinon';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import { Writable, Readable } from 'stream';
import * as _ from 'lodash';
import { MockRouter } from '../helpers';

describe('store', () => {

  let mod, express, router, tarStream, extract, extractHandlers, gunzipMaybe, elementService, mkRouter, ingestHandler;

  beforeEach(() => {

    router = new MockRouter();

    express = {
      Router: stub().returns(router)
    }

    tarStream = {
      extract: stub()
    }

    gunzipMaybe = stub();

    elementService = {
      demo: {
        upload: stub().returns(Promise.resolve(null))
      },
      reset: stub().returns(Promise.resolve(null)),
      savePkg: stub().returns(Promise.resolve()),
      saveReadme: stub().returns(Promise.resolve()),
      saveSchema: stub().returns(Promise.resolve())
    }

    mod = proxyquire('../../../lib/store', {
      'express': express,
      'tar-stream': tarStream,
      'gunzip-maybe': gunzipMaybe
    });
    mkRouter = mod.default;
  });

  let mockReadable = () => {
    return {
      pipe: stub().returns({})
    }
  }

  function MockExtract() {

    this.handlers = {};
    this.on = (keyword, handler) => {
      this.handlers[keyword] = handler;
    };

    this.entry = (header, stream, next) => {
      this.handlers.entry(header, stream, next);
    }
  }

  function MockWritable() {
    this.handlers = {};
    this.on = function (key, handler) {
      this.handlers[key] = handler;
    }
  }

  describe('POST /ingest/:org/:repo/:tag', () => {
    let res, responseJson, mockExtract, writables;

    beforeEach((done) => {
      writables = [];
      mockExtract = new MockExtract();
      tarStream.extract.returns(mockExtract);

      mod.writeStream = spy(function () {
        let w = new MockWritable();
        writables.push(w);
        return w;
      });

      mkRouter(elementService);

      let req = {
        params: {
          org: 'org', repo: 'repo', tag: '1.0.0'
        },
      };

      req.pipe = stub().returns(req);

      res = {}
      res.status = stub().returns(res);
      res.json = spy(function (json) {
        responseJson = json;
        done();
      });

      ingestHandler = router.handlers.post['/ingest/:org/:repo/:tag'];

      ingestHandler(req, res)
        .then(() => {
          mockExtract.handlers.entry({ name: 'name.txt' }, { on: stub() }, stub());
          mockExtract.handlers.entry({ name: 'test.txt' }, { on: stub() }, stub());
          mockExtract.handlers.finish();
          writables.forEach(w => {
            w.handlers.finish();
          });
        })
        .catch(done);
    });

    it('returns json', () => {
      assert.calledWith(res.json, { success: true, files: ['name.txt', 'test.txt'] });
    });

    it('returns ok', () => {
      assert.calledWith(res.status, 200);
    });
  });

  describe('writeStream', () => {

    let handles = (parts, name, assertFn) => {

      let header = _.isObject(name) ? name : { name: name, type: 'file' };
      return (done) => {
        let id = { org: 'org', repo: 'repo', tag: 'tag' }
        let stream = new Readable();
        stream._read = () => { }
        parts.forEach(p => stream.push(p));
        stream.push(null);

        let ws = mod.writeStream(id, elementService, stream, header.name, header);

        if (ws) {
          ws.on('finish', () => {
            try {
              assertFn(id);
              done();
            } catch (e) {
              done(e);
            }
          });
          ws.on('error', done);

        } else {
          assertFn(id);
          done();
        }
      }
    }

    it('handles pie-pkg/package.json', handles(['{', '"hello"', ':', '"there"', '}'], 'pie-pkg/package.json', (id) => {
      assert.calledWith(elementService.savePkg, id, { hello: 'there' });
    }));

    it('handles pie-pkg/README.md', handles(['#', 'README'], 'pie-pkg/README.md', (id) => {
      assert.calledWith(elementService.saveReadme, id, '#README');
    }));

    it('handles schemas/config.json', handles(['{', '}'], 'schemas/config.json', (id) => {
      assert.calledWith(elementService.saveSchema, id, 'schemas/config.json', {});
    }));

    it('skips directories', handles([], { name: 'some-dir', type: 'directory' }, (id) => {
      assert.notCalled(elementService.savePkg);
      assert.notCalled(elementService.saveReadme);
      assert.notCalled(elementService.saveSchema);
    }));

    it('handles any other files as a demo file', handles([], 'some-file.txt', (id) => {
      assert.calledWith(elementService.demo.upload, id, 'some-file.txt', match.object);
    }));

  });
});
