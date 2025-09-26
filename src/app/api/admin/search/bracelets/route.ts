import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log('Search bracelets request:', { query, status, page, limit, offset });

    let braceletsQuery: string;
    let countQuery: string;
    let queryParams: any[];
    let countParams: any[];

    // 构建WHERE条件
    const whereConditions: string[] = [];
    const searchConditions: string[] = [];
    let paramIndex = 1;

    // 添加搜索条件
    if (query.trim()) {
      searchConditions.push(`u.name ILIKE $${paramIndex}`);
      searchConditions.push(`u.wechat_id ILIKE $${paramIndex}`);
      searchConditions.push(`b.nfc_uid ILIKE $${paramIndex}`);
      whereConditions.push(`(${searchConditions.join(' OR ')})`);
      paramIndex++;
    }

    // 添加状态过滤条件
    if (status === 'active') {
      // 已绑定：有用户关联的手环
      whereConditions.push(`u.id IS NOT NULL`);
    } else if (status === 'inactive') {
      // 未绑定：没有用户关联的手环
      whereConditions.push(`u.id IS NULL`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    braceletsQuery = `
      SELECT 
        b.nfc_uid, b.status, b.created_at,
        u.id as user_id, u.name as user_name, u.wechat_id as user_wechat_id
      FROM bracelets b
      LEFT JOIN users u ON b.nfc_uid = u.nfc_uid
      ${whereClause}
      ORDER BY b.created_at DESC, b.nfc_uid ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    countQuery = `
      SELECT COUNT(*) as total 
      FROM bracelets b
      LEFT JOIN users u ON b.nfc_uid = u.nfc_uid
      ${whereClause}
    `;

    // 构建参数数组
    queryParams = [];
    countParams = [];

    if (query.trim()) {
      queryParams.push(`%${query}%`);
      countParams.push(`%${query}%`);
    }

    queryParams.push(limit, offset);
    // countParams 不需要 limit 和 offset

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
      total,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1,
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