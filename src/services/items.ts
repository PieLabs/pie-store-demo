import { Collection, ObjectID } from 'mongodb';

export interface ItemService<ID> {
  list(query: any, skip?: number, limit?: number): Promise<{}[]>;

  listForUsername(username: string, skip?: number, limit?: number): Promise<{}[]>;
  create(item: any): Promise<{}>;
  update(id: ID, item: any): Promise<{}>;
  delete(id: ID): Promise<boolean>;
  findById(id: ID): Promise<any>;
}

export class MongoItemService implements ItemService<ObjectID> {

  constructor(private collection: Collection) { }

  public list(query: any, skip: number = 0, limit: number = 50): Promise<{}[]> {
    return this.collection.find({}).skip(skip).limit(limit).toArray();
  }

  public listForUsername(username: string, skip: number = 0, limit: number = 0) {
    return this.list({ username }, skip, limit);
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
}
