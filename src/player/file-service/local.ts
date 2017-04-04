import { Stats, createReadStream, readFile, stat } from 'fs-extra';

import { FileService } from './api';
import { Readable } from 'stream';
import { join } from 'path';

const statPromise = (p: string) => new Promise<Stats>((resolve, reject) => {
  stat(p, (err, stat) => {
    if (err) {
      reject(err);
    } else {
      resolve(stat);
    }
  });
});

export class Local implements FileService {
  constructor(private dir: string) { }

  public async streamAndSize(key: string): Promise<{ size: number, rs: Readable }> {

    const path = await join(this.dir, key);
    const s = await statPromise(path);
    const rs = createReadStream(path);
    return {
      size: s.size,
      rs
    };
  }

  public string(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const path = join(this.dir, key);
      readFile(path, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
