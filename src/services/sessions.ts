import { Collection, ObjectID } from 'mongodb';

import { buildLogger } from 'log-factory';

const logger = buildLogger();

export interface SessionService<ID> {
  listForItem(itemId: ID): Promise<{}[]>;
  createForItem(itemId: ID): Promise<{}>;
  update(id: ID, session: any): Promise<{}>;
  delete(id: ID): Promise<boolean>;
  findById(id: ID): Promise<{}>;
}

export class MongoSessionService implements SessionService<ObjectID> {

  constructor(private collection: Collection) { }

  listForItem(itemId: ObjectID): Promise<{}[]> {
    return this.collection.find({ itemId }).toArray();
  }

  findById(_id: ObjectID): Promise<{}> {
    return this.collection.findOne({ _id });
  }

  createForItem(itemId: ObjectID): Promise<{}> {
    const session = {
      _id: new ObjectID(),
      itemId
    }

    return this.collection.insertOne(session)
      .then(result => {
        return session._id;
      });
  }

  update(id: ObjectID, session: any): Promise<{}> {
    throw new Error('Method not implemented.');
  }

  delete(_id: ObjectID): Promise<boolean> {
    logger.silly('delete: _id: ', _id);
    return this.collection.remove({ _id }, { single: true })
      .then(r => r.result.ok === true);
  }
}