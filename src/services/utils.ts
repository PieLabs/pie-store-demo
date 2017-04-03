import { ObjectID } from 'mongodb';

export function stringToObjectID(s: string): ObjectID {
  return ObjectID.isValid(s) ? ObjectID.createFromHexString(s) : null;
}