import Controller from './controller';
import { FileService } from '../file-service';
import { buildControllerMap } from '../vm';

export class ControllerCache {

  private mapCache: { [key: string]: any }

  constructor(private fileService: FileService) {
    this.mapCache = {};
  }

  public async load(itemId: string, item: any, path: string): Promise<any> {
    const controllerMap = await this.getControllerMap(itemId, path);
    return new Controller(item, controllerMap);
  }

  private async getControllerMap(itemId: string, path: string): Promise<any> {

    if (this.mapCache[itemId]) {
      return this.mapCache[itemId];
    } else {
      const rawJs = await this.fileService.string(path);
      const m = buildControllerMap(rawJs);
      this.mapCache[itemId] = m;
      return m;
    }
  }
}
