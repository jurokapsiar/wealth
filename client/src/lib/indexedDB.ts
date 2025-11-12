const DB_NAME = 'financial-data-cache';
const ETF_STORE_NAME = 'etf-timeseries';
const INFLATION_STORE_NAME = 'inflation-data';
const COUNTRIES_STORE_NAME = 'countries';
const DB_VERSION = 2;

interface CachedETFData {
  symbol: string;
  startDate: string;
  endDate: string;
  data: any;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(ETF_STORE_NAME)) {
        const store = db.createObjectStore(ETF_STORE_NAME, { keyPath: 'key' });
        store.createIndex('symbol', 'symbol', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(INFLATION_STORE_NAME)) {
        const store = db.createObjectStore(INFLATION_STORE_NAME, { keyPath: 'key' });
        store.createIndex('country', 'country', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(COUNTRIES_STORE_NAME)) {
        db.createObjectStore(COUNTRIES_STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}

function generateCacheKey(symbol: string, startDate: string, endDate: string): string {
  return `${symbol}:${startDate}:${endDate}`;
}

export async function getCachedETFData(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<any | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(ETF_STORE_NAME, 'readonly');
    const store = transaction.objectStore(ETF_STORE_NAME);
    const key = generateCacheKey(symbol, startDate, endDate);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result as CachedETFData | undefined;
        if (result) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error reading from IndexedDB:', error);
    return null;
  }
}

export async function setCachedETFData(
  symbol: string,
  startDate: string,
  endDate: string,
  data: any
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(ETF_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(ETF_STORE_NAME);
    const key = generateCacheKey(symbol, startDate, endDate);

    const cacheEntry: CachedETFData & { key: string } = {
      key,
      symbol,
      startDate,
      endDate,
      data,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error writing to IndexedDB:', error);
  }
}

export async function clearOldCache(maxAgeInDays: number = 7): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(ETF_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(ETF_STORE_NAME);
    const index = store.index('timestamp');
    const maxAge = Date.now() - (maxAgeInDays * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const entry = cursor.value as CachedETFData;
          if (entry.timestamp < maxAge) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
}

interface CachedInflationData {
  country: string;
  startDate: string;
  endDate: string;
  data: any;
  timestamp: number;
}

function generateInflationCacheKey(country: string, startDate: string, endDate: string): string {
  return `${country}:${startDate}:${endDate}`;
}

export async function getCachedInflationData(
  country: string,
  startDate: string,
  endDate: string
): Promise<any | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(INFLATION_STORE_NAME, 'readonly');
    const store = transaction.objectStore(INFLATION_STORE_NAME);
    const key = generateInflationCacheKey(country, startDate, endDate);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result as CachedInflationData | undefined;
        if (result) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error reading inflation data from IndexedDB:', error);
    return null;
  }
}

export async function setCachedInflationData(
  country: string,
  startDate: string,
  endDate: string,
  data: any
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(INFLATION_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(INFLATION_STORE_NAME);
    const key = generateInflationCacheKey(country, startDate, endDate);

    const cacheEntry: CachedInflationData & { key: string } = {
      key,
      country,
      startDate,
      endDate,
      data,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error writing inflation data to IndexedDB:', error);
  }
}

export async function getCachedCountries(): Promise<any | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(COUNTRIES_STORE_NAME, 'readonly');
    const store = transaction.objectStore(COUNTRIES_STORE_NAME);
    const key = 'countries-list';

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error reading countries from IndexedDB:', error);
    return null;
  }
}

export async function setCachedCountries(data: any): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(COUNTRIES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(COUNTRIES_STORE_NAME);
    const key = 'countries-list';

    const cacheEntry = {
      key,
      data,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error writing countries to IndexedDB:', error);
  }
}
