import { S3, config } from 'aws-sdk';

import { FileService } from './api';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { Readable } from 'stream';
import { buildLogger } from 'log-factory';

const logger = buildLogger();

// Init the region 
config.update({ region: 'us-east-1' });

export class S3Service implements FileService {
  constructor(private bucket: string, private prefix: string, private client: S3) {
  }

  public async streamAndSize(key: string): Promise<{ size: number, rs: Readable }> {

    logger.debug('[streamAndSize] key:', key);

    const params = {
      Bucket: this.bucket,
      Key: `${this.prefix}/built-pies/${key}`
    };

    const h = await this.client.headObject(params).promise();
    const rs = this.client.getObject(params).createReadStream();

    return {
      rs,
      size: h.ContentLength
    };
  }

  public string(key: string): Promise<string> {
    logger.debug('[string] key:', key);
    const r: Promise<GetObjectOutput> = this.client.getObject({
      Bucket: this.bucket,
      Key: `${this.prefix}/built-pies/${key}`
    }).promise();
    return r.then(o => o.Body);
  }
}
