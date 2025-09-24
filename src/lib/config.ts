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
    user: process.env.DB_USER || '',
    host: process.env.DB_HOST || '',
    database: process.env.DB_DATABASE || '',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
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