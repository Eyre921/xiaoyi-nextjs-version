import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 获取总数
    const countResult = await db.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(total / limit);

    // 获取分页数据
    const result = await db.query(`
      SELECT 
        id,
        name,
        gender,
        bio,
        birthdate,
        wechat_id,
        last_fortune_at,
        last_fortune_message,
        nfc_uid,
        status,
        is_matchable,
        created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return NextResponse.json({
      users: result.rows,
      total,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}