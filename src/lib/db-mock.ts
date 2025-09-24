// Mock database service for testing without PostgreSQL
import { DatabaseQueryResult, DatabaseService } from './db';
import { QueryResultRow } from 'pg';

// Mock data for testing
const mockBracelets = [
  { nfc_uid: 'test123', status: 'available' },
  { nfc_uid: 'test456', status: 'active' },
];

const mockUsers = [
  {
    id: 1,
    name: '测试用户',
    gender: 'male',
    bio: '这是一个测试用户',
    birthdate: '1990-01-01',
    wechat_id: 'testuser',
    last_fortune_at: null,
    last_fortune_message: null,
    nfc_uid: 'test123',
    status: 'active',
    is_matchable: true,
  },
];

export const mockDb: DatabaseService = {
  query: async <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<DatabaseQueryResult<T>> => {
    console.log(`[MOCK DB] Query: ${text}`, params);
    
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Handle different query types
    const lowerText = text.toLowerCase().trim();
    
    // SELECT bracelets
    if (lowerText.includes('select * from bracelets') && params) {
      const nfcUid = params[0] as string;
      const bracelet = mockBracelets.find(b => b.nfc_uid === nfcUid);
      return {
        rows: bracelet ? [bracelet as unknown as T] : [],
        rowCount: bracelet ? 1 : 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as DatabaseQueryResult<T>;
    }
    
    // SELECT users
    if (lowerText.includes('select * from users') && params && lowerText.includes('nfc_uid')) {
      const nfcUid = params[0] as string;
      const user = mockUsers.find(u => u.nfc_uid === nfcUid && u.status === 'active');
      return {
        rows: user ? [user as unknown as T] : [],
        rowCount: user ? 1 : 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as DatabaseQueryResult<T>;
    }
    
    // INSERT users
    if (lowerText.includes('insert into users') && params) {
      const newUser = {
        id: mockUsers.length + 1,
        name: params[0] as string,
        gender: params[1] as string,
        birthdate: params[2] as string,
        wechat_id: params[3] as string,
        bio: params[4] as string,
        is_matchable: params[5] as boolean,
        nfc_uid: params[6] as string,
        status: 'active',
        last_fortune_at: null,
        last_fortune_message: null,
      };
      mockUsers.push(newUser);
      return {
        rows: [newUser as unknown as T],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: [],
      } as DatabaseQueryResult<T>;
    }
    
    // UPDATE bracelets
    if (lowerText.includes('update bracelets set status') && params) {
      const nfcUid = params[1] as string;
      const bracelet = mockBracelets.find(b => b.nfc_uid === nfcUid);
      if (bracelet) {
        bracelet.status = params[0] as string;
      }
      return {
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: [],
      } as DatabaseQueryResult<T>;
    }
    
    // Default empty result
    return {
      rows: [],
      rowCount: 0,
      command: 'SELECT',
      oid: 0,
      fields: [],
    } as DatabaseQueryResult<T>;
  },
  pool: {
    connect: async () => ({
      query: mockDb.query,
      release: () => {},
    }),
  } as any,
};