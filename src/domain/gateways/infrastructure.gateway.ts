export interface ICacheGateway {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  increment(key: string, value?: number): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
  flush(): Promise<void>;
  keys(pattern: string): Promise<string[]>;
}

export interface IQueueGateway {
  publish(queue: string, message: any, options?: IQueueOptions): Promise<void>;
  subscribe(queue: string, handler: (message: any) => Promise<void>): Promise<void>;
  createQueue(queue: string, options?: IQueueCreateOptions): Promise<void>;
  deleteQueue(queue: string): Promise<void>;
  purgeQueue(queue: string): Promise<void>;
  getQueueInfo(queue: string): Promise<IQueueInfo>;
}

export interface IQueueOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
  backoff?: number;
  ttl?: number;
}

export interface IQueueCreateOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  arguments?: { [key: string]: any };
}

export interface IQueueInfo {
  name: string;
  messageCount: number;
  consumerCount: number;
  durable: boolean;
}

export interface IFileStorageGateway {
  upload(filePath: string, content: Buffer, options?: IUploadOptions): Promise<string>;
  download(filePath: string): Promise<Buffer>;
  delete(filePath: string): Promise<void>;
  exists(filePath: string): Promise<boolean>;
  generatePresignedUrl(filePath: string, expirationTime?: number): Promise<string>;
  list(prefix?: string): Promise<IFileInfo[]>;
}

export interface IUploadOptions {
  contentType?: string;
  metadata?: { [key: string]: string };
  public?: boolean;
}

export interface IFileInfo {
  path: string;
  size: number;
  lastModified: Date;
  contentType?: string;
}
