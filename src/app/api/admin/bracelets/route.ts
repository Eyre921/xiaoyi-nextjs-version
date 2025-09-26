import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    console.log('Bracelets API request:', { page, limit, search, status, offset });

    // 构建WHERE条件
    const whereConditions: string[] = [];
    let paramIndex = 1;

    // 添加搜索条件
    if (search.trim()) {
      whereConditions.push(`(b.nfc_uid ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex} OR u.wechat_id ILIKE $${paramIndex})`);
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

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM bracelets b
      LEFT JOIN users u ON b.nfc_uid = u.nfc_uid
      ${whereClause}
    `;
    
    const countParams = search.trim() ? [`%${search}%`] : [];
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || countResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(total / limit);

    // 获取分页数据，包含用户信息
    const dataQuery = `
      SELECT 
        b.nfc_uid,
        b.status,
        b.created_at,
        u.name as user_name,
        u.wechat_id as user_wechat_id,
        u.status as user_status
      FROM bracelets b
      LEFT JOIN users u ON b.nfc_uid = u.nfc_uid
      ${whereClause}
      ORDER BY b.created_at DESC, b.nfc_uid ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [];
    if (search.trim()) {
      dataParams.push(`%${search}%`);
    }
    dataParams.push(limit, offset);

    console.log('Executing query:', dataQuery);
    console.log('Query params:', dataParams);

    const result = await db.query(dataQuery, dataParams);

    console.log('Query results:', {
      braceletsCount: result.rows.length,
      total,
      totalPages,
      currentPage: page
    });

    return NextResponse.json({
      bracelets: result.rows,
      total,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
  } catch (error) {
    console.error('Failed to fetch bracelets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bracelets' },
      { status: 500 }
    );
  }
}