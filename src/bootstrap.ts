import { Db, MongoClient, ObjectID } from 'mongodb';
import { FileService, LocalFileService, S3Service } from './player/file-service';
import {
  ItemService,
  MongoItemService,
  MongoSessionService,
  MongoUserService,
  SessionService,
  UserService,
} from './services';

import { ControllerCache } from './player/controller/cache';
import { S3 } from 'aws-sdk';
import { buildLogger } from 'log-factory';
import { join } from 'path';

const logger = buildLogger();

export type Services<ID> = {
  items: ItemService<ID>,
  sessions: SessionService<ID>,
  file: FileService,
  controllerCache: ControllerCache,
  users: UserService<ID>
};

export type BootstrapOpts = {
  s3?: {
    bucket: string,
    prefix: string
  },
  mongoUri: string
};

export async function bootstrap(opts: BootstrapOpts): Promise<Services<ObjectID>> {
  const { s3, mongoUri } = opts;
  const db = await MongoClient.connect(mongoUri);
  const items: ItemService<ObjectID> = new MongoItemService(db.collection('items'));
  const sessions: SessionService<ObjectID> = new MongoSessionService(db.collection('sessions'));
  const client = new S3();

  const file = (s3.bucket && s3.prefix) ?
    new S3Service(s3.bucket, s3.prefix, client) :
    new LocalFileService(join(process.cwd(), 'seed/dev/items'));

  const controllerCache = new ControllerCache(file);
  const users = await MongoUserService.build(db.collection('users'));
  return { items, sessions, file, controllerCache, users };
}

export function buildOpts(args: any, env: any): BootstrapOpts {
  const s3 = {
    bucket: args.bucket || env.S3_BUCKET,
    prefix: args.prefix || env.S3_PREFIX
  };

  const mongoUri = args.mongoUri || env.MONGO_URI || 'mongodb://localhost:27017/pie-store-demo';

  return { s3, mongoUri };
}
