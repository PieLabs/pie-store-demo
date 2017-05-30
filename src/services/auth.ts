import * as passport from 'passport';

import { Strategy as LocalStrategy } from 'passport-local';
import { UserService } from './users';

export function middleware(users: UserService) {
  const fn = (username, password, done) => {
    users.find(username, password)
      .then(user => {
        done(null, user);
      })
      .catch(e => done(e));
  }
  passport.use(new LocalStrategy(fn));

  return (req, res, next) => {
    next();
  }
} 