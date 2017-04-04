import { Readable } from 'stream';

export interface FileService {
  streamAndSize(key: string): Promise<{
    size: number,
    rs: Readable
  }>;

  string(key: string): Promise<string>;
}
