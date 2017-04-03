import { Collection, ObjectID } from 'mongodb';

export interface SessionService<ID> {
  listForItem(itemId: ID): Promise<{}[]>;
  create(itemId: ID): Promise<{}>;
  update(id: ID, item: any): Promise<{}>;
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

  create(itemId: ObjectID): Promise<{}> {
    const session = {
      _id: new ObjectID(),
      itemId
    }

    return this.collection.insertOne(session)
      .then(result => {
        return session._id;
      });
  }

  update(id: ObjectID, item: any): Promise<{}> {
    throw new Error('Method not implemented.');
  }

  delete(_id: ObjectID): Promise<boolean> {
    return this.collection.remove({ _id }, { single: true })
      .then(r => r.result.ok === true);
  }
}