const { MongoClient, Db } = require('mongodb');
const ElementService = require('../../../lib/services/element/mongo-service').default;
const { expect } = require('chai');
const _ = require('lodash');
const { stub } = require('sinon');

const mongoUri = process.env.IT_MONGO_URI || 'mongodb://localhost:27017/pie-catalog-it';

describe('element-service', () => {
  let db, coll, service;

  before(() => {
    console.log('before...');
    return MongoClient.connect(mongoUri)
      .then(d => {
        db = d;
        coll = db.collection('elements');
      });
  });

  after((done) => {
    db.close()
      .then(() => done())
      .catch(done);
  });

  beforeEach(() => {
    return coll.remove()
      .then(() => {
        service = new ElementService(coll, {
          configAndMarkup: stub().returns(Promise.resolve({ config: {}, markup: ''}))
        });
      });
  });

  let id = { org: 'org', repo: 'repo', tag: '1.0.0' };

  describe('org/repo index', () => {

    it('throws an error if you try to insert the same org/repo value twice', () => {
      return coll.insertMany([
        { org: 'org', repo: 'repo' },
        { org: 'org', repo: 'repo' }
      ])
        .then(() => {
          throw new Error('should have failed');
        })
        .catch(e => {
          expect(e.name).to.eql('MongoError');
        });
    });
  });

  describe('saveSchema', () => {
    it('saves', () => {
      return service.saveSchema(id, 'schemas/config.json', { title: 'hi' })
        .then(() => coll.findOne(id, { schemas: 1 }))
        .then(r => {
          expect(r.schemas.length).to.eql(1);
        });
    });
  });

  describe('saveReadme', () => {
    it('saves', () => {
      return service.saveReadme(id, '#hi')
        .then(() => coll.findOne(id, { readme: 1 }))
        .then((r) => expect(r.readme).to.eql('#hi'));
    });
  });

  describe('savePkg', () => {

    it('saves', () => {
      return service.savePkg(id, { description: 'hi' })
        .then(() => coll.findOne(id, { 'package': 1 }))
        .then(r => expect(r['package']).to.eql({ description: 'hi' }));
    });
  });

  describe('load', () => {

    beforeEach(() => {
      let data = _.times(4, (index) => {
        let m = index < 2 ? 0 : 1;
        let org = `org-${m}`;
        return { org: org, repo: `repo-${index}`, version: '1.0.0', package: { description: 'description' } }
      });

      return coll.insertMany(data);
    });

    it('loads one', () => {
      return service.load('org-0', 'repo-0')
        .then(r => {
          expect(r.org).to.eql('org-0');
          expect(r.repo).to.eql('repo-0');
        });
    });
  });

  describe('listByOrg', () => {
    let result;

    beforeEach(() => {

      let data = _.times(20, (index) => {
        let m = index < 10 ? 0 : 1;
        let org = `org-${m}`;
        return { org: org, repo: `repo-${index}`, version: '1.0.0', package: { description: 'description' } }
      });

      return coll.insertMany(data)
        .then(() => service.listByOrg('org-0', { limit: 1 }))
        .then(r => {
          result = r;
        });
    });

    it('returns org-0 count', () => {
      expect(result.count).to.eql(10);
    });

    it('returns the limited elements', () => {
      expect(result.elements.length).to.eql(1);
    });

    it('returns the description', () => {
      expect(result.elements[0].descrpition)
    });
  });

  describe('list', () => {

    beforeEach(() => {

      let data = _.times(20, (index) => {
        return { org: `org-${index}`, repo: 'repo', version: '1.0.0' }
      });
      return coll.insertMany(data);
    });

    it('returns 20 entries', () => {
      return service.list()
        .then(r => {
          console.log('r: ', r);
          expect(r.count).to.eql(20)
        });
    });

    it('returns the full count', () => {
      return service.list({ limit: 1 })
        .then(r => {
          expect(r.count).to.eql(20);
          expect(r.elements.length).to.eql(1);
        });
    });
  });
});