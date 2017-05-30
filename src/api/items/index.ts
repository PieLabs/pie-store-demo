import * as express from 'express';

import { ControllerCache } from './../../player/controller/cache';
import { ItemService } from '../../services';
import { buildLogger } from 'log-factory';
import { json } from 'body-parser';
import { parseId } from './../../middleware';

const logger = buildLogger();

export default function <ID>(
  itemService: ItemService<ID>,
  controllerCache: ControllerCache,
  stringToId: (id: string) => ID): express.Application {
  const app = express();

  app.use(json());
  const addItemId = parseId.bind(null, stringToId, 'itemId');

  app.post('/:itemId/model',
    addItemId,
    async (req: any, res, next) => {
      const { session, env } = req.body;
      logger.silly('itemId: ', req.itemId);
      logger.silly('session: ', JSON.stringify(session, null, '  '));
      const item = await itemService.findById(req.itemId);
      logger.silly('paths: ', item.paths);
      const controller = await controllerCache.load(item.id, item, item.paths.controllers);
      const result = await controller.model(session, env);
      res.json(result);
    });

  return app;
}
