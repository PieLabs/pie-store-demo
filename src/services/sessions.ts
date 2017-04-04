import { Collection, ObjectID } from 'mongodb';

import { buildLogger } from 'log-factory';

const logger = buildLogger();

export interface SessionService<ID> {
  listForItem(itemId: ID): Promise<any[]>;
  createForItem(itemId: ID): Promise<{}>;
  update(id: ID, session: any): Promise<{}>;
  delete(id: ID): Promise<boolean>;
  findById(id: ID): Promise<any>;
}

export class MongoSessionService implements SessionService<ObjectID> {

  constructor(private collection: Collection) { }

  public listForItem(itemId: ObjectID): Promise<{}[]> {
    return this.collection.find({ itemId }).toArray();
  }

  public findById(_id: ObjectID): Promise<any> {
    return this.collection.findOne({ _id });
  }

  public createForItem(itemId: ObjectID): Promise<{}> {
    const session = {
      _id: new ObjectID(),
      itemId
    };

    return this.collection.insertOne(session)
      .then(result => {
        return session._id;
      });
  }

  public update(id: ObjectID, session: any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public delete(_id: ObjectID): Promise<boolean> {
    logger.silly('delete: _id: ', _id);
    return this.collection.remove({ _id }, { single: true })
      .then(r => r.result.ok === true);
  }
}