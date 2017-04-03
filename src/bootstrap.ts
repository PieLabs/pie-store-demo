import { Db, MongoClient, ObjectID } from 'mongodb';
import { ItemService, MongoItemService, MongoSessionService, SessionService } from './services';

import { buildLogger } from 'log-factory';
import { join } from 'path';

const logger = buildLogger();

export type Services<ID> = {
  items: ItemService<ID>,
  sessions: SessionService<ID>
}

export type BootstrapOpts = {
  s3?: {
    bucket: string,
    prefix: string
  },
  mongoUri: string
}

export async function bootstrap(opts: BootstrapOpts): Promise<Services<ObjectID>> {
  const db = await MongoClient.connect(opts.mongoUri);
  const items: ItemService<ObjectID> = new MongoItemService(db.collection('items'));
  const sessions: SessionService<ObjectID> = new MongoSessionService(db.collection('sessions'));
  return { items, sessions };
}

export function buildOpts(args: any, env: any): BootstrapOpts {
  let s3 = {
    bucket: args.bucket || env['S3_BUCKET'],
    prefix: args.prefix || env['S3_PREFIX']
  }

  let mongoUri = args.mongoUri || env['MONGO_URI'] || 'mongodb://localhost:27017/pie-store-demo'
  return {
    s3,
    mongoUri
  }
}
