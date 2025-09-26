import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log('Search bracelets request:', { query, page, limit, offset });

    let braceletsQuery: string;
    let countQuery: string;
    let queryParams: any[];
    let countParams: any[];

    if (query.trim()) {
      // 有搜索条件
      braceletsQuery = `
        SELECT 
          b.nfc_uid, b.status, b.created_at,
          u.id as user_id, u.name as user_name, u.wechat_id as user_wechat_id
        FROM bracelets b
        LEFT JOIN users u ON b.nfc_uid = u.nfc_uid
        WHERE 
          u.name ILIKE $1 OR 
          u.wechat_id ILIKE $1 OR 
          b.status ILIKE $1 OR
          b.nfc_uid ILIKE $1
        ORDER BY b.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [`%${query}%`, limit, offset];

      countQuery = `
        SELECT COUNT(*) as total 
        FROM bracelets b
        LEFT JOIN users u ON b.nfc_uid = u.nfc_uid
        WHERE 
          u.name ILIKE $1 OR 
          u.wechat_id ILIKE $1 OR 
          b.status ILIKE $1 OR
          b.nfc_uid ILIKE $1
      `;
      countParams = [`%${query}%`];
    } else {
      // 无搜索条件
      braceletsQuery = `
        SELECT 
          b.nfc_uid, b.status, b.created_at,
          u.id as user_id, u.name as user_name, u.wechat_id as user_wechat_id
        FROM bracelets b
        LEFT JOIN users u ON b.nfc_uid = u.nfc_uid
        ORDER BY b.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      queryParams = [limit, offset];

      countQuery = `SELECT COUNT(*) as total FROM bracelets`;
      countParams = [];
    }

    console.log('Executing bracelets query:', braceletsQuery);
    console.log('Query params:', queryParams);

    // 获取搜索结果
    const braceletsResult = await db.query(braceletsQuery, queryParams);

    console.log('Executing count query:', countQuery);
    console.log('Count params:', countParams);

    // 获取总数
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    const totalPages = Math.ceil(total / limit);

    console.log('Search results:', {
      braceletsCount: braceletsResult.rows.length,
      total,
      totalPages,
      currentPage: page
    });

    return NextResponse.json({
      bracelets: braceletsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Search bracelets error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}