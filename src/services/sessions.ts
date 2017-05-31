// tslint:disable:variable-name
import * as _ from 'lodash';

import { Collection, ObjectID } from 'mongodb';

import { ItemService } from './items';
import { SessionService } from './sessions';
import { buildLogger } from 'log-factory';

const logger = buildLogger();

export interface SessionService<ID> {
  listForItem(itemId: ID): Promise<any[]>;
  createForItem(itemId: ID, studentId: string): Promise<{}>;
  update(id: ID, session: any): Promise<{}>;
  delete(id: ID): Promise<boolean>;
  findById(id: ID): Promise<any>;
  submitAnswers(id: ID, answers: any[]): Promise<any>;
  sessionStarted(id: ID): Promise<Date>;
}

export class MongoSessionService implements SessionService<ObjectID> {

  public static build(collection: Collection, itemService: ItemService<ObjectID>): Promise<SessionService<ObjectID>> {
    return (collection as any).ensureIndex({
      itemId: 1,
      studentId: 1
    },
      { unique: true }).then(() => {
        return new MongoSessionService(collection, itemService);
      });
  }
  private constructor(private collection: Collection, private itemService: ItemService<ObjectID>) {
  }

  public listForItem(itemId: ObjectID): Promise<{}[]> {
    return this.collection.find({ itemId }).toArray();
  }

  public findById(_id: ObjectID): Promise<any> {
    return this.collection.findOne({ _id });
  }

  public createForItem(itemId: ObjectID, studentId: string): Promise<{}> {

    return this.collection.findOne({
      itemId,
      studentId
    }).then(dbSession => {
      if (dbSession === null) {
        const session = {
          _id: new ObjectID(),
          isComplete: false,
          itemId,
          studentId
        };

        return this.collection.insertOne(session)
          .then(result => {
            return session;
          });

      } else {
        return dbSession;
      }
    });
  }

  public update(_id: ObjectID, session: any): Promise<any> {
    delete session._id;
    delete session.itemId;

    logger.debug('[update] _id: ', _id, ' session: ', session);

    return this.collection.findOneAndUpdate({ _id }, {
      $set: session
    },
      { returnOriginal: false })
      .then(r => {

        logger.debug('[update] _id: ', _id, 'result: ', r);

        if (r.ok && r.value !== null) {
          return r.value;
        } else {
          throw new Error('update failed');
        }
      });
  }

  public delete(_id: ObjectID): Promise<boolean> {
    logger.silly('delete: _id: ', _id);
    return this.collection.remove({ _id }, { single: true })
      .then(r => r.result.ok === true);
  }

  public async submitAnswers(_id: ObjectID, answers: any[]): Promise<any> {
    logger.info('[submitAnswer] _id: ', _id, ' answers: ', answers);

    // const session = await this.collection.findOne({ _id, isComplete: false }, { fields: { itemId: 1 } });
    // this.itemService.outcome(session.itemId
    const query = { _id, isComplete: false };
    const completed = new Date();
    return this.collection.findOneAndUpdate(
      query,
      { $set: { answers, isComplete: true, completed } },
      { upsert: false, returnOriginal: false })
      .then(async r => {
        logger.debug('[submitAnswers] db result: ', JSON.stringify(r));
        if (r.ok && r.value !== null) {

          const itemId = r.value.itemId;

          // save outcome in the background
          this.itemService.outcome(itemId, r.value.answers)
            .then(outcome => {
              logger.silly(`_id: ${_id}, got an outcome - saving to the session`);
              logger.silly(`_id: ${_id}, outcome: ${outcome}`);
              return this.collection.update({ _id, isComplete: true }, { $set: { outcome } }, { upsert: false });
            })
            .catch(e => logger.error(e));

          return r.value;
        } else {
          if (r.lastErrorObject && r.lastErrorObject.n === 0) {
            const completedCount = await this.collection.count({ _id, isComplete: true });
            if (completedCount === 1) {
              throw new Error(`Session: ${_id} is already complete - can't submit.`);
            } else {
              throw new Error('submitAnswer failed');
            }
          }
        }
      });

  }
  public sessionStarted(_id: ObjectID): Promise<Date> {
    const started = new Date();
    return this.collection.update(
      { _id, isComplete: false, started: { $exists: false } },
      { $set: { started } },
      { upsert: false })
      .then(r => {
        logger.silly(`[sessionStarted]: dbResult: ${r}`);
        return started;
      });
  }
}
