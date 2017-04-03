import * as express from 'express';
import * as gzip from './middleware/gzip';
import * as webpack from 'webpack';
import * as webpackMiddleware from 'webpack-dev-middleware';

import { ItemService, SessionService } from '../services';
import { join, resolve } from 'path';

import { ObjectID } from 'mongodb';
import { buildLogger } from 'log-factory';

const logger = buildLogger();

export default function <ID>(
  itemService: ItemService<ID>,
  sessionService: SessionService<ID>,
  env: 'dev' | 'prod',
  stringToId: (string) => ID): express.Application {

  const app = express();

  app.set('view engine', 'pug');
  app.set('views', resolve(join(__dirname, 'views')));

  if (env === 'dev') {

    const cfg = require('./webpack.config');

    cfg.output.publicPath = '/';
    let compiler = webpack(cfg);
    let middleware = webpackMiddleware(compiler, {
      publicPath: '/',
      noInfo: true
    });
    app.use(middleware)
  } else {
    let dir = join(__dirname, '../../lib/client/public');
    //try and find the .gz version of the file and update the headers accordingly 
    app.use(gzip.staticFiles(dir));
    app.use(express.static(dir));
  }

  app.get('/', (req, res, next) => {
    itemService.list({})
      .then(items => {
        const cleaned = items.map((i: any) => ({
          _id: i._id.toHexString()
        }))
        logger.silly('cleaned: ', cleaned);
        res.render('index', {
          items: cleaned
        });
      })
      .catch(next);
  });

  app.get('/items/:itemId', (req, res, next) => {
    const { itemId } = req.params;
    const oid = stringToId(itemId);

    sessionService.listForItem(oid)
      .then(sessions => {

        const endpoints = {
          views: {
            editSession: '/session/:sessionId',
            loadPlayer: '/player/:sessionId'
          },
          session: {
            create: {
              url: `/api/sessions/:itemId`,
              method: 'POST'
            },
            delete: {
              method: 'DELETE',
              url: `/api/sessions/:sessionId`
            },
            list: {
              url: `/api/sessions/:itemId`,
              method: 'GET'
            }
          }
        }

        if (oid) {
          itemService.findById(oid)
            .then((item: any) => {
              item.sessions = sessions || [];
              res.render('item', { item, endpoints });
            })
            .catch(e => next);
        } else {
          next(new Error('Invalid Item id: ' + req.params.itemId));
        }
      })
      .catch(next);
  });

  return app;
}

