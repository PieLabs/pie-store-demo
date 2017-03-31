import * as express from 'express';

import { ItemService } from '../services/items';

export default function <ID> (items: ItemService<ID>) : express.Application {
  const api = express();
  return api;
}