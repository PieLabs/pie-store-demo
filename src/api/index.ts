import * as express from 'express';

import { ItemService, SessionService } from '../services';

import mkSessions from './sessions';

export default function <ID>(
  itemService: ItemService<ID>,
  sessionService: SessionService<ID>,
  stringToId: (id: string) => ID): express.Application {
  const api = express();
  const sessions = mkSessions(sessionService, itemService, stringToId);
  api.use('/sessions', sessions);
  return api;
}