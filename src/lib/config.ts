// 文件路径: src/lib/config.ts
import { config } from 'dotenv';

config();

export interface DatabaseConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  keepAlive: boolean;
  keepAliveInitialDelayMillis: number;
  statement_timeout: number;
  query_timeout: number;
}

export interface AIProviderConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

export interface AIConfig {
  provider: 'gemini' | 'openai' | 'custom';
  gemini: AIProviderConfig;
  openai: AIProviderConfig;
  custom: AIProviderConfig;
}

export interface ServerConfig {
  port: number;
}

export interface AppConfig {
  database: DatabaseConfig;
  server: ServerConfig;
  ai: AIConfig;
}

export const appConfig: AppConfig = {
  database: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'xiaoyi',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432'),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    statement_timeout: 30000,
    query_timeout: 30000,
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
  },
  ai: {
    provider: (process.env.AI_PROVIDER as 'gemini' | 'openai' | 'custom') || 'gemini',
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      apiUrl: process.env.GEMINI_API_URL || '',
      model: process.env.GEMINI_MODEL || '',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      apiUrl: process.env.OPENAI_API_URL || '',
      model: process.env.OPENAI_MODEL || '',
    },
    custom: {
      apiKey: process.env.CUSTOM_API_KEY || '',
      apiUrl: process.env.CUSTOM_API_URL || '',
      model: process.env.CUSTOM_MODEL || '',
    },
  },
};