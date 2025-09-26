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
        ? 'SELECT COUNT(*) as total FROM bracelets b LEFT JOIN users u ON b.nfc_uid = u.nfc_uid WHERE b.nfc_uid ILIKE $1 OR u.name ILIKE $1 OR u.wechat_id ILIKE $1'
        : 'SELECT COUNT(*) as total FROM bracelets',
      search ? [`%${search}%`] : []
    );
    const total = parseInt(countResult.rows[0]?.total || countResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(total / limit);

    // 获取分页数据，包含用户信息
    const result = await db.query(`
      SELECT 
        b.nfc_uid,
        b.status,
        b.created_at,
        u.name as user_name,
        u.wechat_id as user_wechat_id,
        u.status as user_status
      FROM bracelets b
      LEFT JOIN users u ON b.nfc_uid = u.nfc_uid
      ${search ? 'WHERE b.nfc_uid ILIKE $3 OR u.name ILIKE $3 OR u.wechat_id ILIKE $3' : ''}
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `, search ? [limit, offset, `%${search}%`] : [limit, offset]);

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