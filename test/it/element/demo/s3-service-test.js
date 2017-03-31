const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
AWS.config.logger = {
  log: function (msg) {
    //console.log(msg);
  }
}
const _ = require('lodash');
const fs = require('fs-extra');
const s3 = new AWS.S3();

const mod = require('../../../../lib/services/element/demo/s3-service');
const Service = mod.default;
const SERVICE_PREFIX = mod.SERVICE_PREFIX;

const chai = require('chai');
const path = require('path');

require('log-factory').init({
  console: true,
  log: 'silly'
});

describe('s3-service', () => {
  let service;
  let prefix = 'integration-test';

  before(() => {
    return Service.build('pie-catalog', prefix)
      .then(s => {
        service = s;
      });
  });

  describe('build', () => {

    it('should throw an error if the bucket doesnt exist', () => {
      return Service.build('a-bucket-that-doesnt-exist')
        .then(() => {
          throw new Error('should have failed')
        })
        .catch(e => { });
    });
  });

  describe('upload', () => {

    let testImage = 'img.jpg';
    let key = `${prefix}/${SERVICE_PREFIX}/org/repo/1.0.0/${testImage}`;
    let headResult, headErr;

    after((done) => {
      s3.deleteObject({ Bucket: 'pie-catalog', Key: key }, err => {
        console.log('deleted: ', key);
        done(err);
      });
    });

    before(function () {
      this.timeout(2000);
      let file = path.join(__dirname, testImage);
      let filesize = fs.statSync(file).size;
      let id = { org: 'org', repo: 'repo', tag: '1.0.0' };
      let rs = fs.createReadStream(file);
      return service.upload(id, testImage, rs)
        .then(() => s3.headObject({ Bucket: 'pie-catalog', Key: key }).promise())
        .then(o => headResult = o)
        .catch(e => headErr = e);
    });

    it('headErr on uploaded asset is null', () => {
      chai.expect(headErr).to.be.undefined;
    });

    it('returns a content type of image/jpeg', () => {
      chai.expect(headResult.ContentType).to.eql('image/jpeg');
    });

  });

  describe('delete', () => {

    let listResult, listErr;
    before(function (done) {
      this.timeout(3000);

      let uploadParams = {
        Bucket: 'pie-catalog',
        Key: `${prefix}/${SERVICE_PREFIX}/org/repo/1.0.0/test.txt`,
        Body: 'hi'
      }

      s3.putObject(uploadParams, (e) => {
        service.delete({ org: 'org', repo: 'repo', tag: '1.0.0' }, 'test.txt')
          .then(r => {
            let p = {
              Bucket: 'pie-catalog',
              Prefix: `${prefix}/${SERVICE_PREFIX}/org/repo/1.0.0`
            }

            s3.listObjectsV2(p, (err, r) => {
              console.log('got err: ', err);
              listResult = r;
              listErr = err;
              done();
            });
          });

      });
    });

    it('should not return an error', () => {
      chai.expect(listErr).to.be.null;
    });

    it('should return an empty list', () => {
      chai.expect(listResult.Contents.length).to.eql(0);
    });
  });
});