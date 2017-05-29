import { Script, createContext } from 'vm';

export function buildControllerMap(rawJs: string): any {
  const sandbox = {
    console: {
      log: (() => { /* do nothing */ })
    }
  };
  const script = new Script(rawJs);
  const context = createContext(sandbox);
  script.runInContext(context);
  return context['pie-controllers'];
}
