import * as express from 'express';
import * as webpack from 'webpack';
import * as webpackMiddleware from 'webpack-dev-middleware';

import { ItemService, SessionService } from '../services';
import { createReadStream, stat } from 'fs-extra';
import { gzipStaticFiles, parseId } from '../middleware';
import { join, resolve } from 'path';

import { ObjectID } from 'mongodb';
import { buildLogger } from 'log-factory';

const logger = buildLogger();

export default function <ID>(
  itemService: ItemService<ID>,
  sessionService: SessionService<ID>,
  env: 'dev' | 'prod',
  stringToId: (id: string) => ID): express.Application {

  const app = express();

  app.set('view engine', 'pug');
  app.set('views', resolve(join(__dirname, 'views')));

  if (env === 'dev') {

    const cfg = require('./webpack.config');

    cfg.output.publicPath = '/';
    const compiler = webpack(cfg);
    const middleware = webpackMiddleware(compiler, {
      noInfo: true,
      publicPath: '/'
    });
    app.use(middleware);
  } else {
    const dir = join(__dirname, '../../lib/root/public');
    // try and find the .gz version of the file and update the headers accordingly 
    app.use(gzipStaticFiles(dir));
    app.use(express.static(dir));
  }


  const parse = parseId.bind(null, stringToId);

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
          session: {
            create: {
              method: 'POST',
              url: `/api/sessions/item/:itemId`,
            },
            delete: {
              method: 'DELETE',
              url: `/api/sessions/:sessionId`
            },
            list: {
              method: 'GET',
              url: `/api/sessions/item/:itemId`
            }
          },
          views: {
            editSession: '/session/:sessionId',
            loadPlayer: '/player/:sessionId'
          }
        };

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

