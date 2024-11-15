export interface ReadingProgress {
  bookId: string;
  scrollPosition: number;
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  lastRead: Date;
}

export interface SavedWord {
  id: string;
  word: string;
  pinyin: string;
  translation?: string;
  dateAdded: Date;
  lastReviewed?: Date;
  bookContext?: {
    bookId: string;
    sentence: string;
  };
}

export interface CachedAudio {
  word: string;
  audioData: ArrayBuffer;
  dateAdded: Date;
}

export interface CachedDictionary {
  word: string;
  data: any;
  dateAdded: Date;
}

class IndexedDBManager {
  private dbName = 'readingProgressDB';
  private version = 3; // Increased version for pagination fields

  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Reading Progress Store
        if (!db.objectStoreNames.contains('readingProgress')) {
          const store = db.createObjectStore('readingProgress', { keyPath: 'bookId' });
          store.createIndex('lastRead', 'lastRead', { unique: false });
        } else {
          // Update existing store for version 3
          const transaction = (event.target as IDBOpenDBRequest).transaction;
          if (transaction) {
            const store = transaction.objectStore('readingProgress');
            if (!store.indexNames.contains('currentPage')) {
              store.createIndex('currentPage', 'currentPage', { unique: false });
            }
            if (!store.indexNames.contains('totalPages')) {
              store.createIndex('totalPages', 'totalPages', { unique: false });
            }
          }
        }

        // Saved Words Store
        if (!db.objectStoreNames.contains('savedWords')) {
          const store = db.createObjectStore('savedWords', { keyPath: 'id' });
          store.createIndex('word', 'word', { unique: false });
          store.createIndex('dateAdded', 'dateAdded', { unique: false });
        }

        // Audio Cache Store
        if (!db.objectStoreNames.contains('audioCache')) {
          const store = db.createObjectStore('audioCache', { keyPath: 'word' });
          store.createIndex('dateAdded', 'dateAdded', { unique: false });
        }

        // Dictionary Cache Store
        if (!db.objectStoreNames.contains('dictionaryCache')) {
          const store = db.createObjectStore('dictionaryCache', { keyPath: 'word' });
          store.createIndex('dateAdded', 'dateAdded', { unique: false });
        }
      };
    });
  }

  // Reading Progress Methods
  async saveReadingProgress(progress: ReadingProgress): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['readingProgress'], 'readwrite');
      const store = transaction.objectStore('readingProgress');
      
      // Ensure the data is fresh and includes pagination fields
      const updatedProgress = {
        ...progress,
        currentPage: progress.currentPage || 1,
        totalPages: progress.totalPages || 1,
        lastRead: new Date()
      };
      
      const request = store.put(updatedProgress);

      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getReadingProgress(bookId: string): Promise<ReadingProgress | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['readingProgress'], 'readonly');
      const store = transaction.objectStore('readingProgress');
      const request = store.get(bookId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Ensure dates are properly converted and pagination fields exist
          result.lastRead = new Date(result.lastRead);
          result.currentPage = result.currentPage || 1;
          result.totalPages = result.totalPages || 1;
        }
        resolve(result || null);
      };
    });
  }

  // Saved Words Methods
  async saveWord(word: SavedWord): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['savedWords'], 'readwrite');
      const store = transaction.objectStore('savedWords');
      const request = store.put(word);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSavedWord(id: string): Promise<SavedWord | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['savedWords'], 'readonly');
      const store = transaction.objectStore('savedWords');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  // Audio Cache Methods
  async cacheAudio(audio: CachedAudio): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['audioCache'], 'readwrite');
      const store = transaction.objectStore('audioCache');
      const request = store.put(audio);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCachedAudio(word: string): Promise<CachedAudio | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['audioCache'], 'readonly');
      const store = transaction.objectStore('audioCache');
      const request = store.get(word);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  // Dictionary Cache Methods
  async cacheDictionaryEntry(entry: CachedDictionary): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['dictionaryCache'], 'readwrite');
      const store = transaction.objectStore('dictionaryCache');
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCachedDictionaryEntry(word: string): Promise<CachedDictionary | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['dictionaryCache'], 'readonly');
      const store = transaction.objectStore('dictionaryCache');
      const request = store.get(word);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  // Cleanup old cache entries
  async cleanupCache(storeName: string, maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const db = await this.initDB();
    const cutoffDate = new Date(Date.now() - maxAge);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index('dateAdded');
      const range = IDBKeyRange.upperBound(cutoffDate);

      const request = index.openCursor(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  // Add a method to verify database connection
  async verifyConnection(): Promise<boolean> {
    try {
      const db = await this.initDB();
      return !!db;
    } catch (error) {
      console.error('Database connection verification failed:', error);
      return false;
    }
  }
}

export const dbManager = new IndexedDBManager();
