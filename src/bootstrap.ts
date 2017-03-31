import { Db, MongoClient, ObjectID } from 'mongodb';
import { ItemService, MongoItemService } from './services/items';

import { buildLogger } from 'log-factory';
import { join } from 'path';

const logger = buildLogger();

export type Services<ID> = {
  items: ItemService<ID>
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
  const collection = db.collection('items');
  const items : ItemService<ObjectID> = new MongoItemService(collection);
  return { items }; 
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
