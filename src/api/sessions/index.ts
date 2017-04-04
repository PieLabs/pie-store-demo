import * as express from 'express';

import { ItemService, SessionService } from '../../services';

import Controller from './controller';
import { buildLogger } from 'log-factory';
import { json } from 'body-parser';
import { parseId } from '../../middleware';

const logger = buildLogger();

export default function <ID>(
  sessionService: SessionService<ID>,
  itemService: ItemService<ID>,
  stringToId: (string) => ID): express.Application {

  const app = express();
  app.use(json());

  const parse = parseId.bind(null, stringToId);

  app.get('/item/:itemId', parse.bind(null, 'itemId'), (req: any, res, next) => {
    sessionService.listForItem(req.itemId)
      .then((r) => {
        res.json(r);
      })
      .catch(next);
  });

  app.post('/item/:itemId', parse.bind(null, 'itemId'), (req: any, res, next) => {
    sessionService.createForItem(req.itemId)
      .then((id) => {
        res.status(201).json({ _id: id, itemId: req.itemId });
      })
      .catch(next);
  });

  app.delete('/:sessionId', parse.bind(null, 'sessionId'), (req: any, res, next) => {
    logger.silly(':sessionId: ', req.sessionId);
    sessionService.delete(req.sessionId)
      .then((r) => {
        res.json(r);
      })
      .catch(next);
  });

  app.post('/:sessionId/player/model', parse.bind(null, 'sessionId'),
    (req: any, res, next) => {

      const { session, env } = req.body;

      logger.silly('sessionId: ', req.sessionId);
      logger.silly('session: ', JSON.stringify(session));
      logger.silly('env: ', JSON.stringify(env));

      sessionService.findById(req.sessionId)
        .then((s: any) => {
          return itemService.findById(s.itemId);
        })
        .then((i: any) => {
          logger.silly('paths: ', i.paths);
          const controllerMap = require(i.paths.controllers);
          const controller = new Controller(i, controllerMap);
          return controller.model(session, env);
        })
        .then(result => {
          res.json(result);
        })
        .catch(next);
    });

  return app;
}