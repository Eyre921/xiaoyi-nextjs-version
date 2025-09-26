// Mock database service for testing without PostgreSQL
import { DatabaseQueryResult, DatabaseService } from './db';
import { QueryResultRow } from 'pg';

// Mock data for testing
const mockBracelets = [
  { 
    id: 1,
    nfc_uid: 'test123', 
    status: 'available',
    created_at: '2024-01-15T10:30:00Z'
  },
  { 
    id: 2,
    nfc_uid: 'test456', 
    status: 'active',
    created_at: '2024-01-16T14:20:00Z'
  },
  { 
    id: 3,
    nfc_uid: 'test789', 
    status: 'inactive',
    created_at: '2024-01-17T09:15:00Z'
  },
];

const mockUsers = [
  {
    id: 1,
    name: '张小明',
    gender: 'male',
    bio: '喜欢音乐和旅行的阳光男孩',
    birthdate: '1995-03-15',
    wechat_id: 'zhangxiaoming',
    last_fortune_at: '2024-01-20T08:00:00Z',
    last_fortune_message: '今日运势不错，适合结识新朋友',
    nfc_uid: 'test123',
    status: 'active',
    is_matchable: true,
    created_at: '2024-01-10T12:00:00Z'
  },
  {
    id: 2,
    name: '李小红',
    gender: 'female',
    bio: '热爱读书和咖啡的文艺女青年',
    birthdate: '1993-07-22',
    wechat_id: 'lixiaohong',
    last_fortune_at: '2024-01-19T09:30:00Z',
    last_fortune_message: '今天是个好日子，会有意外惊喜',
    nfc_uid: 'test456',
    status: 'active',
    is_matchable: true,
    created_at: '2024-01-12T15:30:00Z'
  },
  {
    id: 3,
    name: '王大伟',
    gender: 'male',
    bio: '程序员，喜欢技术和游戏',
    birthdate: '1992-11-08',
    wechat_id: 'wangdawei',
    last_fortune_at: null,
    last_fortune_message: null,
    nfc_uid: 'test789',
    status: 'active',
    is_matchable: false,
    created_at: '2024-01-14T11:20:00Z'
  },
];

const mockMatches = [
  {
    id: 1,
    user1_id: 1,
    user2_id: 2,
    fortune_id: 1,
    matched_at: '2024-01-18T16:45:00Z'
  },
  {
    id: 2,
    user1_id: 2,
    user2_id: 3,
    fortune_id: 2,
    matched_at: '2024-01-19T10:20:00Z'
  },
];

export const mockDb: DatabaseService = {
  query: async <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<DatabaseQueryResult<T>> => {
    console.log(`[MOCK DB] Query: ${text}`, params);
    
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Handle different query types
    const lowerText = text.toLowerCase().trim();
    
    // SELECT bracelets with id field
    if (lowerText.includes('select') && lowerText.includes('from bracelets')) {
      if (params && lowerText.includes('nfc_uid')) {
        const nfcUid = params[0] as string;
        const bracelet = mockBracelets.find(b => b.nfc_uid === nfcUid);
        return {
          rows: bracelet ? [bracelet as unknown as T] : [],
          rowCount: bracelet ? 1 : 0,
          command: 'SELECT',
          oid: 0,
          fields: [],
        } as DatabaseQueryResult<T>;
      } else {
        // Return paginated bracelets with user info
        const limit = params?.[0] as number || 10;
        const offset = params?.[1] as number || 0;
        const paginatedBracelets = mockBracelets.slice(offset, offset + limit).map(bracelet => ({
          ...bracelet,
          user: mockUsers.find(u => u.nfc_uid === bracelet.nfc_uid) || null
        }));
        return {
          rows: paginatedBracelets as unknown as T[],
          rowCount: paginatedBracelets.length,
          command: 'SELECT',
          oid: 0,
          fields: [],
        } as DatabaseQueryResult<T>;
      }
    }
    
    // COUNT bracelets
    if (lowerText.includes('count') && lowerText.includes('bracelets')) {
      return {
        rows: [{ count: mockBracelets.length.toString() } as unknown as T],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as DatabaseQueryResult<T>;
    }
    
    // SELECT matches with user info
    if (lowerText.includes('select') && lowerText.includes('from matches')) {
      const limit = params?.[0] as number || 10;
      const offset = params?.[1] as number || 0;
      const searchQuery = params?.[2] as string;
      
      let filteredMatches = mockMatches;
      
      if (searchQuery) {
        filteredMatches = mockMatches.filter(match => {
          const user1 = mockUsers.find(u => u.id === match.user1_id);
          const user2 = mockUsers.find(u => u.id === match.user2_id);
          return user1?.name.includes(searchQuery) || 
                 user2?.name.includes(searchQuery) ||
                 user1?.wechat_id.includes(searchQuery) ||
                 user2?.wechat_id.includes(searchQuery);
        });
      }
      
      const paginatedMatches = filteredMatches.slice(offset, offset + limit).map(match => ({
        ...match,
        user1_name: mockUsers.find(u => u.id === match.user1_id)?.name || 'Unknown',
        user1_wechat_id: mockUsers.find(u => u.id === match.user1_id)?.wechat_id || 'Unknown',
        user2_name: mockUsers.find(u => u.id === match.user2_id)?.name || 'Unknown',
        user2_wechat_id: mockUsers.find(u => u.id === match.user2_id)?.wechat_id || 'Unknown'
      }));
      
      return {
        rows: paginatedMatches as unknown as T[],
        rowCount: paginatedMatches.length,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as DatabaseQueryResult<T>;
    }
    
    // COUNT matches
    if (lowerText.includes('count') && lowerText.includes('matches')) {
      const searchQuery = params?.[0] as string;
      let count = mockMatches.length;
      
      if (searchQuery) {
        count = mockMatches.filter(match => {
          const user1 = mockUsers.find(u => u.id === match.user1_id);
          const user2 = mockUsers.find(u => u.id === match.user2_id);
          return user1?.name.includes(searchQuery) || 
                 user2?.name.includes(searchQuery) ||
                 user1?.wechat_id.includes(searchQuery) ||
                 user2?.wechat_id.includes(searchQuery);
        }).length;
      }
      
      return {
        rows: [{ total: count.toString() } as unknown as T],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as DatabaseQueryResult<T>;
    }
    
    // SELECT users with search functionality
    if (lowerText.includes('select') && lowerText.includes('from users')) {
      // Handle specific user lookup by NFC UID
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
      
      // Handle paginated user search
      const limit = params?.[0] as number || 10;
      const offset = params?.[1] as number || 0;
      const searchQuery = params?.[2] as string;
      
      let filteredUsers = mockUsers;
      
      if (searchQuery) {
        const query = searchQuery.replace(/%/g, '').toLowerCase();
        filteredUsers = mockUsers.filter(user => 
          user.name.toLowerCase().includes(query) ||
          user.wechat_id.toLowerCase().includes(query) ||
          (user.nfc_uid && user.nfc_uid.toLowerCase().includes(query)) ||
          user.status.toLowerCase().includes(query)
        );
      }
      
      const paginatedUsers = filteredUsers.slice(offset, offset + limit);
      
      return {
        rows: paginatedUsers as unknown as T[],
        rowCount: paginatedUsers.length,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as DatabaseQueryResult<T>;
    }
    
    // COUNT users
    if (lowerText.includes('count') && lowerText.includes('from users')) {
      const searchQuery = params?.[0] as string;
      let count = mockUsers.length;
      
      if (searchQuery) {
        const query = searchQuery.replace(/%/g, '').toLowerCase();
        count = mockUsers.filter(user => 
          user.name.toLowerCase().includes(query) ||
          user.wechat_id.toLowerCase().includes(query) ||
          (user.nfc_uid && user.nfc_uid.toLowerCase().includes(query)) ||
          user.status.toLowerCase().includes(query)
        ).length;
      }
      
      return {
        rows: [{ total: count.toString() } as unknown as T],
        rowCount: 1,
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
        created_at: new Date().toISOString()
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