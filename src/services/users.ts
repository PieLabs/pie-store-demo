import { Collection, ObjectID } from 'mongodb';

import { buildLogger } from 'log-factory';

const logger = buildLogger();

export interface UserService<ID> {
  find(username: string, password: string): Promise<any>;
  findById(id: ID): Promise<any>;
}

export class MongoUserService implements UserService<ObjectID> {

  public static build(collection: Collection): Promise<UserService<ObjectID>> {
    return collection.createIndex('username', {
      unique: true
    }).then(() => new MongoUserService(collection));
  }

  constructor(private collection: Collection) { }

  public findById(id: ObjectID): Promise<any> {
    return this.collection.findOne({ _id: id });
  }

  public find(username: string, password: string) {
    logger.debug('[find] ', username);
    return this.collection.findOne({ username, password })
      .then(u => {
        if (u) {
          return u;
        } else {
          throw new Error(`no user by name: ${username} found`);
        }
      });
  }
}
