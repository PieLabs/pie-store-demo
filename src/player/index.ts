import * as _ from 'lodash';
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
    // try and find the .gz version of the file
    // and update the headers accordingly
    app.use(gzipStaticFiles(dir));
    app.use(express.static(dir));
  }

  const addSessionId = parseId.bind(null, stringToId, 'sessionId');
  const addItemId = parseId.bind(null, stringToId, 'itemId');

  app.post('/:itemId/register',
    addItemId,
    (req: any, res, next) => {
      logger.silly('req.body: ', req.body);
      sessionService.createForItem(req.itemId, req.body.name)
        .then((session: any) => {
          logger.silly(`session: `, JSON.stringify(session));
          res.json({ url: `/player/${session._id}` });
        })
        .catch(e => {
          res.json({ error: 'an error occured' });
        });
    });

  app.get('/:itemId/partake', (req, res, next) => {
    res.render('partake', {
      endpoints: {
        registerStudent: {
          method: 'POST',
          url: 'register'
        }
      }
    });
  });

  app.get('/:sessionId/super-user',
    addSessionId,
    async (req: any, res, next) => {
      logger.silly('sessionId:', req.sessionId);

      logger.silly('query: ', req.query);

      const endpoints = {
        model: {
          method: 'POST',
          url: `../${req.sessionId}/model`
        },
        outcome: {
          method: 'POST',
          url: `../${req.sessionId}/outcome`
        },
        submit: {
          method: 'PUT',
          url: `../${req.sessionId}/submit`
        },
        update: {
          method: 'PUT',
          url: `../${req.sessionId}/update`
        },
        updateWithConstraints: {
          method: 'PUT',
          url: `../${req.sessionId}/update-with-constraints`
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

      res.render('super-player', {
        endpoints,
        env: { mode },
        js: [`/player/${session.itemId}/pie-view.js`],
        markup: item.markup,
        playerNotes,
        session,
      });
    });

  app.put('/:sessionId/session-started', addSessionId,
    (req: any, res, next) => {
      sessionService.sessionStarted(req.sessionId)
        .then(() => {
          res.json({ success: true });
        })
        .catch(e => {
          res.status(400).json({ success: false, message: e.message });
        });
    });

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
        sessionStarted: {
          method: 'PUT',
          url: `${req.sessionId}/session-started`
        },
        submit: {
          method: 'PUT',
          url: `${req.sessionId}/submit`
        },
        update: {
          method: 'PUT',
          url: `${req.sessionId}/update`
        },
        updateWithConstraints: {
          method: 'PUT',
          url: `${req.sessionId}/update-with-constraints`
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
        endpoints,
        env: { mode },
        js: [`/player/${session.itemId}/pie-view.js`],
        markup: item.markup,
        playerNotes,
        session,
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

  const addSavedSession = async (req, res, next) => {
    const { session, env } = req.body;
    logger.silly('sessionId: ', req.sessionId);
    req.savedSession = await sessionService.findById(req.sessionId);
    next();
  };

  app.post('/:sessionId/model',
    addSessionId,
    addSavedSession,
    async (req: any, res, next) => {
      const { session, env } = req.body;
      const { sessionId, savedSession } = req;
      logger.silly('sessionId: ', req.sessionId);
      logger.silly('answers: ', JSON.stringify(session));
      logger.silly('env: ', JSON.stringify(env));

      if ((env.mode === 'evaluate' || env.mode === 'view') && !savedSession.isComplete) {
        res.status(400).json({ error: `Can't return model for ${env.mode} mode if the session is not complete.` });
      } else if (env.mode === 'gather' && savedSession.isComplete) {
        res.status(400).json({ error: `Can't return model for gather mode if the session is complete.` });
      } else {
        const item = await itemService.findById(savedSession.itemId);
        logger.silly('paths: ', item.paths);
        const controller = await controllerCache.load(item.id, item, item.paths.controllers);
        const result = await controller.model(session, env);
        res.json(result);
      }
    });

  app.put('/:sessionId/update',
    addSessionId,
    addSavedSession,
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

  app.put('/:sessionId/update-with-constraints',
    addSessionId,
    addSavedSession,
    (req: any, res, next) => {
      const { session } = req.body;
      if (req.savedSession.isComplete) {
        res.status(400).json({ error: `Can't update if the session is complete` });
      } else {
        sessionService.update(req.sessionId, session)
          .then(updated => {
            res.json(updated);
          })
          .catch(e => {
            logger.error(e);
            res.status(400).json({ error: e.message });
          });
      }
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

  const sessionsMatch = (a, b) => _.isEqual(a, b);

  app.post('/:sessionId/outcome', addSessionId,
    async (req: any, res, next) => {
      const dbSession = await sessionService.findById(req.sessionId);
      const { session, env } = req.body;

      if (!dbSession.isComplete) {
        res.status(400).json({ error: `can't return outcome if the session is not complete` });
      } else if (!sessionsMatch(dbSession.answers, session)) {
        res.status(400).json({ error: `The session from the client doesn't match the saved session` });
      } else {
        const item = await itemService.findById(dbSession.itemId);
        logger.silly('paths: ', item.paths);
        const controller = await controllerCache.load(item.id, item, item.paths.controllers);
        const result = await controller.outcome(session, env);
        res.json(result);
      }
    });

  return app;
}
