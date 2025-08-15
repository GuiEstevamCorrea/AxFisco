export interface MessageBroker {
  publish(queue: string, message: any): Promise<void>;
  subscribe(queue: string, callback: (message: any) => void): Promise<void>;
  close(): Promise<void>;
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
