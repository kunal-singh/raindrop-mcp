import type { IRaindropClient } from './raindrop-client.interface';
import { TTLCache } from '../../lib/ttl-cache';
import { logger } from '../../lib/logger';

const TTL_MS = 5 * 60 * 1000; // 5 minutes

const CACHE_KEYS = {
  collections: 'collections',
  tags: (collectionId?: number) =>
    collectionId ? `tags:${collectionId}` : 'tags',
} as const;

export class CachedRaindropClient implements IRaindropClient {
  private client: IRaindropClient;
  private cache: TTLCache<unknown>;

  constructor(client: IRaindropClient) {
    this.client = client;
    this.cache = new TTLCache<unknown>(TTL_MS);
  }

  async getCollections(): Promise<unknown> {
    const key = CACHE_KEYS.collections;
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      logger.debug('Cache hit', { key });
      return cached;
    }
    logger.debug('Cache miss', { key });
    const result = await this.client.getCollections();
    this.cache.set(key, result);
    return result;
  }

  async getRaindrops(
    collectionId: number = 0,
    options: {
      search?: string;
      sort?: string;
      page?: number;
      perpage?: number;
    } = {},
  ): Promise<unknown> {
    return this.client.getRaindrops(collectionId, options);
  }

  async getTags(collectionId?: number): Promise<unknown> {
    const key = CACHE_KEYS.tags(collectionId);
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      logger.debug('Cache hit', { key });
      return cached;
    }
    logger.debug('Cache miss', { key });
    const result = await this.client.getTags(collectionId);
    this.cache.set(key, result);
    return result;
  }

  async getRaindrop(id: number): Promise<unknown> {
    return this.client.getRaindrop(id);
  }

  async createRaindrop(data: {
    link: string;
    title?: string;
    excerpt?: string;
    tags?: string[];
    collection?: { $id: number };
  }): Promise<unknown> {
    return this.client.createRaindrop(data);
  }

  async updateRaindrop(
    id: number,
    data: {
      title?: string;
      excerpt?: string;
      tags?: string[];
      collection?: { $id: number };
    },
  ): Promise<unknown> {
    return this.client.updateRaindrop(id, data);
  }

  async deleteRaindrop(id: number): Promise<unknown> {
    return this.client.deleteRaindrop(id);
  }

  async createCollection(data: {
    title: string;
    view?: string;
    public?: boolean;
  }): Promise<unknown> {
    return this.client.createCollection(data);
  }

  async deleteCollection(id: number): Promise<unknown> {
    return this.client.deleteCollection(id);
  }
}
