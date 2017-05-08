import * as express from 'express';
import * as marked from 'marked';
import * as webpack from 'webpack';
import * as webpackMiddleware from 'webpack-dev-middleware';

import { ItemService, SessionService } from './../services';
import { createReadStream, readFile, stat } from 'fs-extra';
import { gzipStaticFiles, parseId } from './../middleware';
import { join, resolve } from 'path';

import { ControllerCache } from './controller/cache';
import { FileService } from './file-service';
import { buildControllerMap } from './vm';
import { buildLogger } from 'log-factory';
import { json } from 'body-parser';

const logger = buildLogger();


const markdown = (p: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    readFile(p, 'utf8', (err, md) => {
      if (err) {
        reject(err);
      } else {
        marked(md, (e, html) => {
          if (e) {
            reject(e);
          } else {
            resolve(html);
          }
        });
      }
    });
  });
};

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
        outcome: {
          method: 'POST',
          url: `${req.sessionId}/outcome`
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
      const playerNotes = await markdown(join(__dirname, 'player-notes.md'));

      res.render('player', {
        playerNotes,
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
      logger.silly('answers: ', JSON.stringify(session));
      logger.silly('env: ', JSON.stringify(env));
      const dbSession = await sessionService.findById(req.sessionId);

      if ((env.mode === 'evaluate' || env.mode === 'view') && !dbSession.isComplete) {
        res.status(400).json({ error: `Can't return model for ${env.mode} mode if the session is not complete.` });
      } else if (env.mode === 'gather' && dbSession.isComplete) {
        res.status(400).json({ error: `Can't return model for gather mode if the session is complete.` });
      } else {
        const item = await itemService.findById(dbSession.itemId);
        logger.silly('paths: ', item.paths);
        const controller = await controllerCache.load(item.id, item, item.paths.controllers);
        const result = await controller.model(session, env);
        res.json(result);
      }
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

  app.post('/:sessionId/outcome', addSessionId,
    async (req: any, res, next) => {
      const dbSession = await sessionService.findById(req.sessionId);

      if (!dbSession.isComplete) {
        res.status(400).json({ error: `can't return outcome if the session is not complete` });
      } else {
        const { session, env } = req.body;
        const item = await itemService.findById(dbSession.itemId);
        logger.silly('paths: ', item.paths);
        const controller = await controllerCache.load(item.id, item, item.paths.controllers);
        const result = await controller.outcome(session, env);
        res.json(result);
      }

    });

  return app;
}
