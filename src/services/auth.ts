import * as passport from 'passport';

import { Strategy as LocalStrategy } from 'passport-local';
import { ObjectID } from 'mongodb';
import { UserService } from './users';
import { buildLogger } from 'log-factory';

const logger = buildLogger();

let inited: boolean = false;
export function init(users: UserService<ObjectID>) {
  logger.info('[init]...');
  if (!inited) {
    logger.info('[init] set up local auth..');
    const fn = (req, username, password, done) => {
      logger.info('[verify] username?', username);
      users.find(username, password)
        .then(user => {
          logger.info('[local] user?', user);
          if (user) {
            done(null, user);
          } else {
            logger.debug('set flash');

            done(null, false, { message: 'aaa' });
          }
        })
        .catch(e => {
          logger.error(e);
          logger.debug('set flash');
          const msg = { message: e.message };
          req.flash('loginError', e.message);
          done(null, false, msg);
        });
    };

    passport.use(new LocalStrategy({ passReqToCallback: true }, fn));

    // Configure Passport authenticated session persistence.
    //
    // In order to restore authentication state across HTTP requests, Passport needs
    // to serialize users into and deserialize users out of the session.  The
    // typical implementation of this is as simple as supplying the user ID when
    // serializing, and querying the user record by ID from the database when
    // deserializing.
    passport.serializeUser((user: any, cb) => {
      logger.info('user: ', user);
      cb(null, user._id.toString());
    });

    passport.deserializeUser((id: string, cb) => {
      if (ObjectID.isValid(id)) {
        const oid = ObjectID.createFromHexString(id);
        users.findById(oid)
          .then(user => {
            cb(null, user);
          })
          .catch(cb);
      } else {
        cb(new Error('not a valid id'));
      }
    });

    inited = true;
  }
}

export function middleware() {
  return passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
    successRedirect: '/'
  });
}
