import { Script, createContext } from 'vm';

export function buildControllerMap(rawJs: string): any {
  const sandbox = {};
  const script = new Script(rawJs);
  const context = createContext(sandbox);
  script.runInContext(context);
  return context['pie-controllers'];
}
