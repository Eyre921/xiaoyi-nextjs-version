// 文件路径: src/lib/db.ts
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { appConfig } from './config';
import { mockDb } from './db-mock';

let pool: Pool | null = null;
let useMockDb = false;

// 尝试创建数据库连接池
try {
  if (appConfig.database.password && appConfig.database.host) {
    pool = new Pool(appConfig.database);
    
    // 监听连接池错误
    pool.on('error', (err: Error, client: PoolClient) => {
      console.error('[DB POOL ERROR] Idle client experienced an error', err.stack);
    });
    
    console.log('[DB] Using real PostgreSQL database');
  } else {
    console.log('[DB] Database configuration incomplete, using mock database');
    useMockDb = true;
  }
} catch (error) {
  console.error('[DB] Failed to create database pool, using mock database:', error);
  useMockDb = true;
}

// 如果配置了真实数据库，尝试连接测试
if (pool && !useMockDb) {
  pool.connect()
    .then(() => {
      console.log('[DB] Successfully connected to PostgreSQL');
    })
    .catch((error) => {
      console.error('[DB] Failed to connect to PostgreSQL, switching to mock:', error);
      useMockDb = true;
      pool = null;
    });
}

export interface DatabaseQueryResult<T extends QueryResultRow = QueryResultRow> extends QueryResult<T> {
  rows: T[];
}

export interface DatabaseService {
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<DatabaseQueryResult<T>>;
  pool: Pool;
}

export const db: DatabaseService = {
  query: async <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<DatabaseQueryResult<T>> => {
    if (useMockDb) {
      return mockDb.query<T>(text, params);
    }
    
    try {
      if (!pool) {
        throw new Error('Database pool not initialized');
      }
      const result = await pool.query<T>(text, params);
      return result as DatabaseQueryResult<T>;
    } catch (error) {
      console.error('[DB QUERY ERROR]', error);
      throw error;
    }
  },
  pool: pool || ({
    connect: async () => ({
      query: db.query,
      release: () => {},
    }),
  } as any),
};