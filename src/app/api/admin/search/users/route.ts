import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log('Search users request:', { query, page, limit, offset });

    let usersQuery: string;
    let countQuery: string;
    let queryParams: any[];
    let countParams: any[];

    if (query.trim()) {
      // 有搜索条件
      usersQuery = `
        SELECT 
          id, name, gender, wechat_id, nfc_uid, birthdate, 
          status, bio, is_matchable, created_at, last_fortune_at, last_fortune_message
        FROM users 
        WHERE 
          name ILIKE $1 OR 
          wechat_id ILIKE $1 OR 
          nfc_uid ILIKE $1 OR 
          status ILIKE $1
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
      queryParams = [`%${query}%`, limit, offset];

      countQuery = `
        SELECT COUNT(*) as total 
        FROM users 
        WHERE 
          name ILIKE $1 OR 
          wechat_id ILIKE $1 OR 
          nfc_uid ILIKE $1 OR 
          status ILIKE $1
      `;
      countParams = [`%${query}%`];
    } else {
      // 无搜索条件
      usersQuery = `
        SELECT 
          id, name, gender, wechat_id, nfc_uid, birthdate, 
          status, bio, is_matchable, created_at, last_fortune_at, last_fortune_message
        FROM users 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      queryParams = [limit, offset];

      countQuery = `SELECT COUNT(*) as total FROM users`;
      countParams = [];
    }

    console.log('Executing users query:', usersQuery);
    console.log('Query params:', queryParams);

    // 获取搜索结果
    const usersResult = await db.query(usersQuery, queryParams);

    console.log('Executing count query:', countQuery);
    console.log('Count params:', countParams);

    // 获取总数
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    const totalPages = Math.ceil(total / limit);

    console.log('Search results:', {
      usersCount: usersResult.rows.length,
      total,
      totalPages,
      currentPage: page
    });

    return NextResponse.json({
      users: usersResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}