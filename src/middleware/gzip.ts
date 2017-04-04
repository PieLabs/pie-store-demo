import * as express from 'express';

import { createReadStream, stat } from 'fs-extra';

import { buildLogger } from 'log-factory';
import { extname } from 'path';
import { join } from 'path';
import { lookup } from 'mime-types';

const logger = buildLogger();

export function staticFiles(dir: string): express.Handler {
  return (req, res, next) => {
    logger.debug('req: ', req.path);

    const accepts: string = req.headers['accept-encoding'];

    if (accepts && accepts.includes('gzip')) {
      let p = req.path;
      let fullpath = join(dir, p);
      fullpath = fullpath.endsWith('.gz') ? fullpath : `${fullpath}.gz`;

      logger.debug('fullpath: ', fullpath);

      stat(fullpath, (err, stat) => {
        if (err) {
          logger.silly('err for path: ', req.path);
          next();
        } else {
          if (stat.isFile()) {
            logger.info('set headers for found file: ', fullpath);
            res.setHeader('Content-Type', lookup(extname(req.url)));
            req.url = `${req.url}.gz`;
            res.setHeader('Content-Encoding', 'gzip');
            next();
          }
        }
      });
    } else {
      logger.silly('skip - does not accept gzip');
      next();
    }
  }
}
