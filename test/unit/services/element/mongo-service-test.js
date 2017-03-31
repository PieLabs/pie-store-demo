import { expect } from 'chai';
import { stub, match, assert, spy } from 'sinon';
import proxyquire from 'proxyquire';

function MockCursor(arr) {
  arr = arr || [];
  this.count = stub().returns(Promise.resolve(arr.length));
  this.toArray = stub().returns(Promise.resolve(arr))
}

describe('mongo-service', () => {

  let mod, demo, collection, cursor, github, service, id;

  beforeEach(() => {

    id = {
      org: 'org',
      repo: 'repo',
      tag: '1.0.0'
    }

    demo = {
      delete: stub().returns(Promise.resolve(true))
    }

    cursor = new MockCursor();

    collection = {
      createIndex: stub().returns(Promise.resolve()),
      findOneAndDelete: stub().returns(Promise.resolve({ ok: true, value: id })),
      update: stub().returns(Promise.resolve({ result: id })),
      find: stub().returns(cursor)
    }

    github = {
      loadInfo: stub().returns(Promise.resolve({}))
    }

    mod = require('../../../../lib/services/element/mongo-service');
    service = new mod.default(collection, demo, github);
  });


  describe('delete', () => {

    describe('when successful', () => {
      beforeEach(() => service.delete('org', 'repo'));

      it('calls collection.findOneAndDelete', () => {
        assert.calledWith(collection.findOneAndDelete, { org: 'org', repo: 'repo' });
      });

      it('calls demo.delete', () => {
        assert.calledWith(demo.delete, id);
      });
    });

    describe('when collection fails', () => {
      let result;

      beforeEach(() => {
        collection.findOneAndDelete.returns(Promise.resolve({ ok: false }));
        return service.delete('org', 'repo').then(r => result = r);
      });

      it('returns ok: false', () => {
        expect(result).to.eql({ ok: false, error: 'failed to delete the repo', statusCode: 500 });
      });
    });

    describe('when demo.delete fails', () => {
      let result;

      beforeEach(() => {
        demo.delete.returns(Promise.resolve(false));
        return service.delete('org', 'repo').then(r => result = r);
      });

      it('returns ok: false', () => {
        expect(result).to.eql({ ok: false, error: 'failed to delete the demo dir', statusCode: 500 });
      });
    });
  });

  describe('saveSchema', () => {

    let schema = {};
    beforeEach(() => service.saveSchema(id, 'schemas/config.json', schema));

    it('calls collection.update', () => {
      assert.calledWith(collection.update, { org: 'org', repo: 'repo' }, {
        $set: {
          tag: id.tag
        },
        $addToSet: {
          schemas: {
            name: 'schemas/config.json',
            schema: schema
          }
        }
      }, { upsert: true })
    });
  });

  describe('savePkg', () => {
    let pkg = {}
    beforeEach(() => service.savePkg(id, pkg));

    it('calls collection.update', () => {
      assert.calledWith(collection.update, { org: 'org', repo: 'repo' }, {
        $set: {
          tag: id.tag,
          package: pkg,
          github: {}
        }
      }, { upsert: true })
    });

    it('calls github.loadInfo', () => {
      assert.calledWith(github.loadInfo, 'org', 'repo');
    });
  });


  describe('saveReadme', () => {
    let readme = '#readme';
    beforeEach(() => service.saveReadme(id, readme));

    it('calls collection.update', () => {
      assert.calledWith(collection.update, { org: 'org', repo: 'repo' }, {
        $set: {
          tag: id.tag,
          readme: readme
        }
      }, { upsert: true })
    });

  });

  describe('list', () => {

    beforeEach(() => service.list({ skip: 0, limit: 0 }));

    it('calls collection.find', () => {
      assert.calledWith(collection.find, {}, { 'package.description': 1, org: 1, repo: 1, tag: 1 }, 0, 0);
    });
  });

  describe('listByOrg', () => {

    beforeEach(() => service.listByOrg('org', { skip: 0, limit: 0 }));

    it('calls collection.find', () => {
      assert.calledWith(collection.find, { org: 'org' }, { 'package.description': 1, org: 1, repo: 1, tag: 1 }, 0, 0);
    });
  });
});