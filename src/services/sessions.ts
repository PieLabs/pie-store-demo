// tslint:disable:variable-name
import * as _ from 'lodash';

import { Collection, ObjectID } from 'mongodb';

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
}

export class MongoSessionService implements SessionService<ObjectID> {

  public static build(collection: Collection): Promise<SessionService<ObjectID>> {
    return (collection as any).ensureIndex({
      itemId: 1,
      studentId: 1
    },
      { unique: true }).then(() => {
        return new MongoSessionService(collection);
      });
  }
  private constructor(private collection: Collection) {
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

    return this.collection.findOneAndUpdate(
      query,
      { $set: { answers, isComplete: true } },
      { upsert: false, returnOriginal: false })
      .then(async r => {
        logger.debug('[submitAnswers] db result: ', JSON.stringify(r));
        if (r.ok && r.value !== null) {

          const itemId = r.value.itemId;
          // fire off a save outcome in the background
          const outcome = this.itemService.outcome(itemId, r.value.answers);
          this.collection.update(query, { $set: { outcome } });
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
}
