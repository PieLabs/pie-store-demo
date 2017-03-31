import { expect } from 'chai';
import { stub, match, assert, spy } from 'sinon';
import proxyquire from 'proxyquire';
import * as _ from 'lodash';
import { MockResponse, MockRouter } from '../helpers';

describe('api', () => {

  let mod, deps, router, elementService, handler, req, res, listResult, getDemoLink;

  beforeEach(() => {
    router = new MockRouter();
    res = new MockResponse();

    req = {
      params: {
        org: 'org',
        repo: 'repo',
        tag: '1.0.0'
      }
    };

    listResult = [{ org: 'org', repo: 'repo' }];

    elementService = {
      list: stub().returns(Promise.resolve({
        count: listResult.length, elements: listResult
      })),
      listByOrg: stub().returns(Promise.resolve({
        count: listResult.length, elements: listResult
      })),
      delete: stub().returns(Promise.resolve({ ok: true })),
      load: stub().returns(Promise.resolve(req.params))
    }

    deps = {
      'express': {
        Router: stub().returns(router)
      }
    }

    mod = proxyquire('../../../lib/api', deps);
    getDemoLink = stub().returns('demoLink');
    mod.default(elementService, getDemoLink);
  });

  describe('GET /', () => {
    beforeEach(() => {
      handler = router.handlers.get['/']
    });

    it('calls send', () => {
      handler(req, res);
      assert.calledWith(res.send, 'api here...');
    });
  });

  describe('GET /element', () => {
    beforeEach((done) => {
      handler = router.handlers.get['/element'];
      res.done = done;
      handler(req, res);
    });

    it('calls service.list', () => {
      assert.calledWith(elementService.list, { skip: 0, limit: 0 });
    });

    it('calls res.json', () => {
      assert.calledWith(res.json, {
        count: 1, elements: [
          _.merge(listResult[0], { repoLink: '/element/org/repo' })
        ]
      });
    });
  });

  describe('GET /org/:org', () => {

    beforeEach((done) => {
      handler = router.handlers.get['/org/:org'];
      res.done = done;
      handler(req, res);
    });

    it('calls service.listByOrg', () => {
      assert.calledWith(elementService.listByOrg, 'org', { skip: 0, limit: 0 });
    });

    it('calls res.json', () => {
      assert.calledWith(res.json, {
        count: 1, org: 'org', elements: [
          _.merge(listResult[0], { repoLink: '/element/org/repo' })
        ]
      })
    });
  });

  describe('DELETE /element/:org/:repo', () => {

    beforeEach((done) => {
      handler = router.handlers.delete['/element/:org/:repo'];
      res.done = done;
      handler(req, res);
    });

    it('calls service.delete', () => {
      assert.calledWith(elementService.delete, 'org', 'repo');
    });

    it('calls res.json', () => {
      assert.calledWith(res.json, { success: true });
    });

  });

  describe('GET /element/:org/:repo', () => {

    beforeEach((done) => {
      handler = router.handlers.get['/element/:org/:repo'];
      res.done = done;
      handler(req, res);
    });

    it('calls service.load', () => {
      assert.calledWith(elementService.load, 'org', 'repo');
    });

    it('calls getDemoLink', () => {
      assert.calledWith(getDemoLink, { org: 'org', repo: 'repo', tag: '1.0.0' });
    });

    it('calls res.json', () => {
      assert.calledWith(res.json, _.extend({}, req.params, { demoLink: 'demoLink', schemas: [] }));
    });
  });
});