import * as express from 'express';
import * as gzip from './middleware/gzip';
import * as webpack from 'webpack';
import * as webpackMiddleware from 'webpack-dev-middleware';

import { join, resolve } from 'path';

import { ItemService } from '../services/items';

export default function <ID> (itemService: ItemService<ID>, env: 'dev' | 'prod') : express.Application {

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
    res.render('index', {
      items: [] 
    });
  });
  return app;
}
