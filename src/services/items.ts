import { Collection, ObjectID } from 'mongodb';

import { ControllerCache } from './../player/controller/cache';
import PieController from '../player/controller/controller';
import { SessionService } from './sessions';
import { buildLogger } from 'log-factory';

// tslint:disable:variable-name

export interface ItemService<ID> {
  list(query: any, skip?: number, limit?: number): Promise<{}[]>;

  outcome(id: ID, answers: any[]): Promise<any>;
  listForUsername(username: string, skip?: number, limit?: number): Promise<{}[]>;
  create(item: any): Promise<{}>;
  update(id: ID, item: any): Promise<{}>;
  delete(id: ID): Promise<boolean>;
  findById(id: ID): Promise<any>;
}

const logger = buildLogger();

export class MongoItemService implements ItemService<ObjectID> {

  public static build(
    collection: Collection,
    controllerCache: ControllerCache,
    sessionService: () => SessionService<ObjectID>) {
    return new MongoItemService(collection, controllerCache, sessionService);
  }

  constructor(
    private collection: Collection,
    private controllerCache: ControllerCache,
    private sessionService: () => SessionService<ObjectID>
  ) { }

  public list(query: any = {}, fields: any = null, skip: number = 0, limit: number = 50): Promise<{}[]> {
    return this.collection.find(query).skip(skip).limit(limit).toArray();
  }

  public async listForUsername(username: string, skip: number = 0, limit: number = 0) {
    const list = await this.list({ username }, { _id: 1, name: 1 }, skip, limit);
    const counts = this.sessionService().counts(list.map((l: any) => l._id));
    const out = list.map((l: any) => {
      const countResult = counts.find(c => c._id === l._id);
      return { _id: l._id, name: l.name, sessionCount: countResult.count }
    });
    return out;
  }

  public findById(_id: ObjectID): Promise<{}> {
    return this.collection.findOne({ _id });
  }

  public create(item: any): Promise<{}> {
    throw new Error('Method not implemented.');
  }

  public update(id: ObjectID, item: any): Promise<{}> {
    throw new Error('Method not implemented.');
  }

  public delete(id: ObjectID): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  // TODO: All outcome calls should come through here.
  public async outcome(_id: ObjectID, answers: any[]): Promise<any> {
    const item = await this.collection.findOne({ _id });
    logger.silly('[outcome] _id: ', _id.toHexString(), 'item: ', item);

    const controller = await this.controllerCache.load(_id.toHexString(), item, item.paths.controllers);
    return controller.outcome(answers, { mode: 'evaluate' });
  }

}
