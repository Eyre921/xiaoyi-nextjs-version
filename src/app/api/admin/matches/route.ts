import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // 获取总数
    const countResult = await db.query(
      search 
        ? 'SELECT COUNT(*) as total FROM matches m LEFT JOIN users u1 ON m.user1_id = u1.id LEFT JOIN users u2 ON m.user2_id = u2.id WHERE u1.name ILIKE $1 OR u2.name ILIKE $1 OR u1.wechat_id ILIKE $1 OR u2.wechat_id ILIKE $1'
        : 'SELECT COUNT(*) as total FROM matches',
      search ? [`%${search}%`] : []
    );
    const total = parseInt(countResult.rows[0]?.total || countResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(total / limit);

    // 获取分页数据，使用matched_at字段（如果存在）或created_at字段
    const result = await db.query(`
      SELECT 
        m.id,
        m.user1_id,
        m.user2_id,
        m.matched_at as created_at,
        m.matched_at as updated_at,
        u1.name as user1_name,
        u1.wechat_id as user1_wechat_id,
        u2.name as user2_name,
        u2.wechat_id as user2_wechat_id
      FROM matches m
      LEFT JOIN users u1 ON m.user1_id = u1.id
      LEFT JOIN users u2 ON m.user2_id = u2.id
      ${search ? 'WHERE u1.name ILIKE $3 OR u2.name ILIKE $3 OR u1.wechat_id ILIKE $3 OR u2.wechat_id ILIKE $3' : ''}
      ORDER BY m.matched_at DESC
      LIMIT $1 OFFSET $2
    `, search ? [limit, offset, `%${search}%`] : [limit, offset]);

    return NextResponse.json({
      matches: result.rows,
      total,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
  } catch (error) {
    console.error('Failed to fetch matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}