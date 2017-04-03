import * as express from 'express';
import * as http from 'http';
import * as minimist from 'minimist';

import { bootstrap, buildOpts } from './bootstrap';
import { getLogger, init } from 'log-factory';

import { ObjectID } from 'mongodb';
import api from './api';
import client from './client';
import { join } from 'path';
import { stringToObjectID } from "./services/utils";

var argv = require('minimist')(process.argv.slice(2));

let raw = process.argv.slice(2);
let args: any = minimist(raw);
let logConfig = process.env['LOG_CONFIG'] || args.logConfig || 'info';
console.log('logconfig: ', logConfig);
init({
  console: true,
  log: logConfig
});

const logger = getLogger('APP');

process.on('unhandledRejection', (reason, p: Promise<any>) => {
  logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

let opts = buildOpts(args, process.env);

bootstrap(opts)
  .then((services) => {
    const app = express();

    const { NODE_ENV } = process.env;
    const env = NODE_ENV === 'production' || NODE_ENV === 'prod' ? 'prod' : 'dev';

    app.use('/', client(services.items, services.sessions, env, stringToObjectID));
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
