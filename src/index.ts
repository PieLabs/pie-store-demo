import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as http from 'http';
import * as minimist from 'minimist';
import * as passport from 'passport';
import * as session from 'express-session';

import { bootstrap, buildOpts } from './bootstrap';
import { getLogger, init } from 'log-factory';
import { init as initAuth, middleware } from './services/auth';

import { ObjectID } from 'mongodb';
import { Strategy } from 'passport-local';
import api from './api';
import { join } from 'path';
import player from './player';
import rootClient from './root';
import { stringToObjectID } from './services/utils';

const argv = minimist(process.argv.slice(2));

const raw = process.argv.slice(2);
const args: any = minimist(raw);
const logConfig = process.env.LOG_CONFIG || args.logConfig || 'info';
const env = process.env.NODE_ENV || args.env || 'prod';

// tslint:disable-next-line:no-var-requires
const flash = require('connect-flash');

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

    initAuth(services.users);

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({ resave: false, saveUninitialized: false, secret: process.env.SESSION_SECRET || 'keyboard cat' }));
    app.use(flash());

    // init passport
    app.use(passport.initialize());
    app.use(passport.session());

    const { NODE_ENV } = process.env;

    const mw = middleware();

    app.use('/', rootClient(
      services.items,
      services.sessions,
      services.file,
      mw,
      env,
      stringToObjectID));

    app.use('/player', player(
      services.items,
      services.sessions,
      services.file,
      services.controllerCache,
      env,
      stringToObjectID));
    app.use('/api', api(services.items, services.controllerCache, services.sessions, stringToObjectID));

    const server = http.createServer(app);

    const port = args.port || process.env.PORT || 4001;

    server.on('close', (e) => {
      // tslint:disable-next-line:no-console
      console.error('error', e);
    });

    server.on('error', (e) => {
      // tslint:disable-next-line:no-console
      console.error(e);
    });

    server.on('listening', () => {
      // tslint:disable-next-line:no-console
      console.log(`server listening on port: ${port}`);
    });

    server.listen(port);
  })
  .catch(e => {
    logger.error(e);
  });
