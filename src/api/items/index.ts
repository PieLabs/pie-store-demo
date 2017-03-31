import * as express from 'express';

import { ItemService, MongoItemService } from '../../services/items';

export { ItemService, MongoItemService };

export default function <ID> (service: ItemService<ID>) : express.Application {
  const app = express();
  return app;
}