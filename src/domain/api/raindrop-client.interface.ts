export interface IRaindropClient {
  getCollections(): Promise<unknown>;
  getRaindrops(
    collectionId?: number,
    options?: {
      search?: string;
      sort?: string;
      page?: number;
      perpage?: number;
    },
  ): Promise<unknown>;
  getRaindrop(id: number): Promise<unknown>;
  createRaindrop(data: {
    link: string;
    title?: string;
    excerpt?: string;
    tags?: string[];
    collection?: { $id: number };
  }): Promise<unknown>;
  updateRaindrop(
    id: number,
    data: {
      title?: string;
      excerpt?: string;
      tags?: string[];
      collection?: { $id: number };
    },
  ): Promise<unknown>;
  deleteRaindrop(id: number): Promise<unknown>;
  getTags(collectionId?: number): Promise<unknown>;
  createCollection(data: {
    title: string;
    view?: string;
    public?: boolean;
  }): Promise<unknown>;
  deleteCollection(id: number): Promise<unknown>;
}
