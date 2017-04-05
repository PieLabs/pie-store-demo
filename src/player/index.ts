import * as express from 'express';
import * as webpack from 'webpack';
import * as webpackMiddleware from 'webpack-dev-middleware';

import { ItemService, SessionService } from './../services';
import { createReadStream, stat } from 'fs-extra';
import { gzipStaticFiles, parseId } from './../middleware';
import { join, resolve } from 'path';

import { ControllerCache } from './controller/cache';
import { FileService } from './file-service';
import { buildControllerMap } from './vm';
import { buildLogger } from 'log-factory';
import { json } from 'body-parser';

const logger = buildLogger();

export default function mkApp<ID>(
  itemService: ItemService<ID>,
  sessionService: SessionService<ID>,
  fileService: FileService,
  controllerCache: ControllerCache,
  appEnv: 'dev' | 'prod',
  stringToId: (id: string) => ID
) {
  const app = express();

  app.use(json());

  app.set('view engine', 'pug');
  app.set('views', resolve(join(__dirname, 'views')));

  if (appEnv === 'dev') {
    const cfg = require('./webpack.config');
    logger.silly('set up middleware');
    cfg.output.publicPath = '/';
    const compiler = webpack(cfg);
    const middleware = webpackMiddleware(compiler, {
      noInfo: false,
      publicPath: '/'
    });
    app.use(middleware);

  } else {
    // TODO...
    const dir = join(__dirname, '../../lib/player/public');
    // try and find the .gz version of the file and update the headers accordingly 
    app.use(gzipStaticFiles(dir));
    app.use(express.static(dir));
  }


  const addSessionId = parseId.bind(null, stringToId, 'sessionId');
  const addItemId = parseId.bind(null, stringToId, 'itemId');

  app.get('/:sessionId',
    addSessionId,
    async (req: any, res, next) => {
      logger.silly('sessionId:', req.sessionId);

      logger.silly('query: ', req.query);

      const endpoints = {
        model: {
          method: 'POST',
          url: `${req.sessionId}/model`
        },
        submit: {
          method: 'PUT',
          url: `${req.sessionId}/submit`
        },
        update: {
          method: 'PUT',
          url: `${req.sessionId}/update`
        }
      };

      const session = await sessionService.findById(req.sessionId);
      const item = await itemService.findById(session.itemId);

      // trigger load of controller
      controllerCache.load(item.id, item, item.paths.controllers);

      logger.silly('session: ', JSON.stringify(session));

      const requestedMode = req.query.mode;

      const mode = session.isComplete ? (requestedMode === 'evaluate' ? 'evaluate' : 'view') : 'gather';

      res.render('player', {
        env: { mode },
        session,
        endpoints,
        js: [`/player/${session.itemId}/pie-view.js`],
        markup: item.markup
      });
    });

  app.get('/:itemId/pie-view.js',
    addItemId,
    async (req: any, res, next) => {
      const item = await itemService.findById(req.itemId);
      const { rs, size } = await fileService.streamAndSize(item.paths.view);
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Content-Length', size.toString());
      rs.pipe(res);
    });

  app.post('/:sessionId/model',
    addSessionId,
    async (req: any, res, next) => {
      const { session, env } = req.body;
      logger.silly('sessionId: ', req.sessionId);
      logger.silly('session: ', JSON.stringify(session));
      logger.silly('env: ', JSON.stringify(env));
      const dbSession = await sessionService.findById(req.sessionId);
      const item = await itemService.findById(dbSession.itemId);
      logger.silly('paths: ', item.paths);
      const controller = await controllerCache.load(item.id, item, item.paths.controllers);
      const result = await controller.model(session, env);
      res.json(result);
    });

  app.put('/:sessionId/update', addSessionId,
    (req: any, res, next) => {
      const { session } = req.body;
      sessionService.update(req.sessionId, session)
        .then(updated => {
          res.json(updated);
        })
        .catch(e => {
          logger.error(e);
          res.status(400).json({ error: e.message });
        });
    });

  app.put('/:sessionId/submit',
    addSessionId,
    (req: any, res, next) => {
      const { answers } = req.body;
      sessionService.submitAnswers(req.sessionId, answers)
        .then(session => {
          res.json({ env: { mode: 'view' }, session });
        })
        .catch(e => {
          res.status(400).json({ error: e.message });
        });
    });

  return app;
}
