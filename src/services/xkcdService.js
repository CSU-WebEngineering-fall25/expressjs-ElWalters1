const fetch = require('node-fetch');

class XKCDService {
  constructor() {
    this.baseUrl = 'https://xkcd.com';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getLatest() {
    const cacheKey = 'latest';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/info.0.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const comic = await response.json();
      const processedComic = this.processComic(comic);
      
      this.cache.set(cacheKey, {
        data: processedComic,
        timestamp: Date.now()
      });
      
      return processedComic;
    } catch (error) {
      throw new Error(`Failed to fetch latest comic: ${error.message}`);
    }
  }

  // TODO: Implement getById method
  async getById(id) {
    if (typeof id !== 'number' || id <= 0) {
      throw new Error(' Invalid comic ID' );
    }
    const cacheKey = `comic_${id}`; 
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    try {
      const response = await fetch(`https://xkcd.com/${id}/info.0.json`);
      if (response.status === 404) {
        throw new Error('Comic not found');
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const comic = await response.json();
      const processedComic = this.processComic(comic);
      this.cache.set(cacheKey, {
        data: processedComic,
        timestamp: Date.now()
      });
      return processedComic;
    }
    catch (error) {
      throw Error('getById method not implemented');
    } 
  }

  // TODO: Implement getRandom method
  async getRandom() {
    try {
      const latestComic = await getLatestComic();
      const maxId = latestComic.id;
      const randomId = Math.floor(Math.random() * maxId) + 1;
      const randomComic = await this.getById(randomId);
      return randomComic;
    } catch (error) {
      throw Error('getRandom method not implemented');
    }
  }

  // TODO: Implement search method
  async search(query, page = 1, limit = 10) {
    try {
      const latestComic = await this.getLatestComic();
      const maxId = latestComic.id;
      const offset = (page - 1) * limit;
      const searchRangeStart = Math.max(1, maxId - 100);
      const searchRangeEnd = maxId;
      const results = [];
      for (let id = searchRangeStart; id <= searchRangeEnd; id++) {
        const comic = await this.getById(id);
        if (comic && (comic.title.includes(query) || comic.transcript.includes(query))) {
          results.push(comic);
        } 
      }
      const total = results.length;
      const paginatedResults = results.slice(offset, offset + limit);
      return {
        query: query,
        results: paginatedResults,
        total: total,
        pagination: {
          page: page,
          limit: limit,
        }
      };
    } catch (error) {
      throw Error('search method not implemented');
    }
  }
  

  processComic(comic) {
    return {
      id: comic.num,
      title: comic.title,
      img: comic.img,
      alt: comic.alt,
      transcript: comic.transcript || '',
      year: comic.year,
      month: comic.month,
      day: comic.day,
      safe_title: comic.safe_title
    };
  }
}

module.exports = new XKCDService();