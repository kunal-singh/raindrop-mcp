import { HttpClientBase } from './http-client.base';

/**
 * Raindrop.io API client
 * Extends HttpClientBase with Raindrop-specific methods
 */
export class RaindropClient extends HttpClientBase {
  constructor(token: string) {
    super('https://api.raindrop.io/rest/v1', token);
  }

  /**
   * Get all collections
   */
  async getCollections() {
    return this.request('/collections');
  }

  /**
   * Get raindrops from a collection
   * @param collectionId - Collection ID (0 for all bookmarks)
   * @param options - Search options
   */
  async getRaindrops(
    collectionId: number = 0,
    options: {
      search?: string;
      sort?: string;
      page?: number;
      perpage?: number;
    } = {},
  ) {
    return this.request(`/raindrops/${collectionId}`, {
      params: {
        search: options.search,
        sort: options.sort,
        page: options.page,
        perpage: options.perpage,
      },
    });
  }

  /**
   * Get a single raindrop
   * @param id - Raindrop ID
   */
  async getRaindrop(id: number) {
    return this.request(`/raindrop/${id}`);
  }

  /**
   * Create a new raindrop
   */
  async createRaindrop(data: {
    link: string;
    title?: string;
    excerpt?: string;
    tags?: string[];
    collection?: { $id: number };
  }) {
    return this.request('/raindrop', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a raindrop
   */
  async updateRaindrop(
    id: number,
    data: {
      title?: string;
      excerpt?: string;
      tags?: string[];
      collection?: { $id: number };
    },
  ) {
    return this.request(`/raindrop/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a raindrop
   */
  async deleteRaindrop(id: number) {
    return this.request(`/raindrop/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all tags
   * @param collectionId - Optional collection ID to filter tags
   */
  async getTags(collectionId?: number) {
    const endpoint = collectionId ? `/tags/${collectionId}` : '/tags';
    return this.request(endpoint);
  }

  /**
   * Create a collection
   */
  async createCollection(data: {
    title: string;
    view?: string;
    public?: boolean;
  }) {
    return this.request('/collection', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a collection
   */
  async deleteCollection(id: number) {
    return this.request(`/collection/${id}`, {
      method: 'DELETE',
    });
  }
}
