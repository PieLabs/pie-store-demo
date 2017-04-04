import * as express from 'express';
import * as webpack from 'webpack';
import * as webpackMiddleware from 'webpack-dev-middleware';

import { ItemService, SessionService } from './../services';
import { createReadStream, stat } from 'fs-extra';
import { gzipStaticFiles, parseId } from './../middleware';
import { join, resolve } from 'path';

import Controller from './controller';
import { buildLogger } from 'log-factory';
import { json } from 'body-parser';

const logger = buildLogger();

export default function mkApp<ID>(
  itemService: ItemService<ID>,
  sessionService: SessionService<ID>,
  env: 'dev' | 'prod',
  stringToId: (id: string) => ID
) {
  const app = express();

  app.use(json());

  app.set('view engine', 'pug');
  app.set('views', resolve(join(__dirname, 'views')));

  if (env === 'dev') {
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
    (req: any, res, next) => {
      logger.silly('sessionId:', req.sessionId);


      const endpoints = {
        model: {
          method: 'POST',
          url: `${req.sessionId}/model`
        },
        submit: {
          method: 'PUT',
          url: `${req.sessionId}/submit`
        }
      };

      sessionService.findById(req.sessionId)
        .then((session: any) => {
          itemService.findById(session.itemId)
            .then((item: any) => {
              logger.silly('session: ', JSON.stringify(session));
              res.render('player', {
                session,
                endpoints,
                js: [`/player/${session.itemId}/pie-view.js`],
                markup: item.markup
              });
            });
        })
        .catch(next);
    });

  app.get('/:itemId/pie-view.js',
    addItemId,
    (req: any, res, next) => {
      itemService.findById(req.itemId)
        .then((item: any) => {
          stat(item.paths.view, (e, s) => {
            const rs = createReadStream(item.paths.view);
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Content-Length', s.size.toString());
            rs.pipe(res);
          });
        })
        .catch(next);
    });

  app.post('/:sessionId/model',
    addSessionId,
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

  app.put('/:sessionId/submit', addSessionId, (req, res, next) => {
    res.json({ mode: 'view' });
  });

  return app;
}
