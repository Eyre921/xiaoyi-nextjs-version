import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log('Search matches request:', { query, page, limit, offset });

    let matchesQuery: string;
    let countQuery: string;
    let queryParams: any[];
    let countParams: any[];

    if (query.trim()) {
      // 有搜索条件
      matchesQuery = `
        SELECT 
          m.id, m.user1_id, m.user2_id, m.fortune_id, m.matched_at,
          u1.name as user1_name, u1.wechat_id as user1_wechat_id,
          u2.name as user2_name, u2.wechat_id as user2_wechat_id,
          f.fortune_text
        FROM matches m
        LEFT JOIN users u1 ON m.user1_id = u1.id
        LEFT JOIN users u2 ON m.user2_id = u2.id
        LEFT JOIN fortunes f ON m.fortune_id = f.id
        WHERE 
          u1.name ILIKE $1 OR 
          u2.name ILIKE $1 OR 
          u1.wechat_id ILIKE $1 OR 
          u2.wechat_id ILIKE $1 OR
          CAST(m.fortune_id AS TEXT) ILIKE $1
        ORDER BY m.matched_at DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [`%${query}%`, limit, offset];

      countQuery = `
        SELECT COUNT(*) as total 
        FROM matches m
        LEFT JOIN users u1 ON m.user1_id = u1.id
        LEFT JOIN users u2 ON m.user2_id = u2.id
        WHERE 
          u1.name ILIKE $1 OR 
          u2.name ILIKE $1 OR 
          u1.wechat_id ILIKE $1 OR 
          u2.wechat_id ILIKE $1 OR
          CAST(m.fortune_id AS TEXT) ILIKE $1
      `;
      countParams = [`%${query}%`];
    } else {
      // 无搜索条件
      matchesQuery = `
        SELECT 
          m.id, m.user1_id, m.user2_id, m.fortune_id, m.matched_at,
          u1.name as user1_name, u1.wechat_id as user1_wechat_id,
          u2.name as user2_name, u2.wechat_id as user2_wechat_id,
          f.fortune_text
        FROM matches m
        LEFT JOIN users u1 ON m.user1_id = u1.id
        LEFT JOIN users u2 ON m.user2_id = u2.id
        LEFT JOIN fortunes f ON m.fortune_id = f.id
        ORDER BY m.matched_at DESC
        LIMIT $1 OFFSET $2
      `;
      queryParams = [limit, offset];

      countQuery = `SELECT COUNT(*) as total FROM matches`;
      countParams = [];
    }

    console.log('Executing matches query:', matchesQuery);
    console.log('Query params:', queryParams);

    // 获取搜索结果
    const matchesResult = await db.query(matchesQuery, queryParams);

    console.log('Executing count query:', countQuery);
    console.log('Count params:', countParams);

    // 获取总数
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    const totalPages = Math.ceil(total / limit);

    console.log('Search results:', {
      matchesCount: matchesResult.rows.length,
      total,
      totalPages,
      currentPage: page
    });

    return NextResponse.json({
      matches: matchesResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Search matches error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}