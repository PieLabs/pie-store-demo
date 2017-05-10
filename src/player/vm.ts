import { Script, createContext } from 'vm';

import { buildLogger } from 'log-factory';

const logger = buildLogger();

export function buildControllerMap(rawJs: string): any {
  const sandbox = {
    console: {
      log: (...args) => logger.info(args.join(' '))
    }
  };
  const script = new Script(rawJs);
  const context = createContext(sandbox);
  script.runInContext(context);
  return context['pie-controllers'];
}
