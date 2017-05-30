import { Collection, ObjectID } from 'mongodb';

export interface UserService {
  find(username: string, password: string): Promise<any>;
}

export class MongoUserService implements UserService {

  public static build(collection: Collection): Promise<UserService> {
    return collection.createIndex('username', {
      unique: true
    }).then(() => new MongoUserService(collection));
  }

  constructor(private collection: Collection) { }

  find(username: string, password: string) {
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


