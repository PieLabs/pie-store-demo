import { buildLogger } from 'log-factory';
const logger = buildLogger();

export const parseId = <ID>(stringToId: (id: string) => ID,
  key: string, req, res, next) => {

  logger.debug('key: ', key);
  logger.silly('req.params: ', req.params);
  const id = req.params[key];
  if (!id) {
    next(new Error('no itemId'));
  } else {
    req[key] = stringToId(id);
    logger.silly('req[key]', req[key]);

    if (!req[key]) {
      next(new Error('invalid id: ' + id));
    } else {
      next();
    }
  }
}
