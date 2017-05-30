import * as express from 'express';

import { ItemService, SessionService } from '../services';

import { ControllerCache } from './../player/controller/cache';
import mkItems from './items';
import mkSessions from './sessions';

export default function <ID>(
  itemService: ItemService<ID>,
  controllerCache: ControllerCache,
  sessionService: SessionService<ID>,
  stringToId: (id: string) => ID): express.Application {
  const api = express();
  const sessions = mkSessions(sessionService, itemService, stringToId);
  const items = mkItems(itemService, controllerCache, stringToId);
  api.use('/sessions', sessions);
  api.use('/items', items);
  return api;
}
