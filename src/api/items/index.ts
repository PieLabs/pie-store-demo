import * as express from 'express';

import { ItemService } from '../../services';

export default function <ID>(
  service: ItemService<ID>,
  stringToId: (string) => ID): express.Application {
  const app = express();

  return app;
}