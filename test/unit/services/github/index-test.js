import { expect } from 'chai';
import { stub, match, assert, spy } from 'sinon';
import proxyquire from 'proxyquire';

function MockResponse(o) {
  this.ok = true;
  this.json = stub().returns(Promise.resolve(o));
  this._json = o;
}

describe('github', () => {
  let deps, mod, mockResponses, response, service;

  beforeEach(() => {
    mockResponses = {
      user: new MockResponse({ user: 'user', avatar_url: 'https://api.github.com/avatar/user' }),
      avatar: new Buffer(''),
      repo: new MockResponse({ repo: 'repo', stars: 1 }),
    }

    let fetch = stub();

    fetch
      .withArgs('https://api.github.com/users/user')
      .returns(Promise.resolve(mockResponses.user));
    fetch
      .withArgs('https://api.github.com/avatar/user')
      .returns(Promise.resolve(mockResponses.avatar));
    fetch
      .withArgs('https://api.github.com/repos/org/repo')
      .returns(Promise.resolve(mockResponses.repo));

    deps = {
      'node-fetch': {
        default: fetch
      }
    }
    mod = proxyquire('../../../../lib/services/github', deps);
    service = new mod.MainGithubService();
  });

  describe('user', () => {
    beforeEach(() => service.user('user').then(r => response = r));

    it('calls fetch', () => {
      assert.calledWith(deps['node-fetch'].default, 'https://api.github.com/users/user');
    });

    it('gets a response', () => {
      expect(response).to.eql(mockResponses.user._json);
    });
  });

  describe('avatar', () => {
    beforeEach(() => service.avatar('user').then(r => response = r));

    it('calls fetch for user', () => {
      assert.calledWith(deps['node-fetch'].default, 'https://api.github.com/users/user');
    });

    it('calls fetch for avatar', () => {
      assert.calledWith(deps['node-fetch'].default, 'https://api.github.com/avatar/user?s=40');
    });
  });

  describe('loadInfo', () => {
    beforeEach(() => service.loadInfo('org', 'repo').then(r => response = r));

    it('calls /repos/org/repo', () => {
      assert.calledWith(deps['node-fetch'].default, 'https://api.github.com/repos/org/repo');
    });

    it('gets the response', () => {
      expect(response).to.eql({ repo: 'repo', stars: 1 });
    });
  });
});