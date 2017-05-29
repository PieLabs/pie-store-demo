import * as express from 'express';
import * as http from 'http';
import * as minimist from 'minimist';

import { bootstrap, buildOpts } from './bootstrap';
import { getLogger, init } from 'log-factory';

import { ObjectID } from 'mongodb';
import api from './api';
import { join } from 'path';
import player from './player';
import rootClient from './root';
import { stringToObjectID } from "./services/utils";

const argv = require('minimist')(process.argv.slice(2));

const raw = process.argv.slice(2);
const args: any = minimist(raw);
const logConfig = process.env.LOG_CONFIG || args.logConfig || 'info';
const env = process.env.NODE_ENV || args.env || 'prod';

init({
  console: true,
  log: logConfig
});

const logger = getLogger('APP');

logger.info('env: ', env);

process.on('unhandledRejection', (reason, p: Promise<any>) => {
  logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

const opts = buildOpts(args, process.env);

bootstrap(opts)
  .then((services) => {
    const app = express();

    const { NODE_ENV } = process.env;

    const authMiddleware = (req, res, next) => {
      //TODO: hookup auth..
      next();
    }

    app.use('/', rootClient(
      services.items,
      services.sessions,
      authMiddleware,
      env,
      stringToObjectID));
    app.use('/player', player(
      services.items,
      services.sessions,
      services.file,
      services.controllerCache,
      env,
      stringToObjectID));
    app.use('/api', api(services.items, services.sessions, stringToObjectID));

    const server = http.createServer(app);

    const port = args.port || process.env.PORT || 4001;

    server.on('close', (e) => {
      console.error('error', e);
    });

    server.on('error', (e) => {
      console.error(e);
    });

    server.on('listening', () => {
      console.log(`server listening on port: ${port}`);
    });

    server.listen(port);
  })
  .catch(e => {
    logger.error(e)
  });

