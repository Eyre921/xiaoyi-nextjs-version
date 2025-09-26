import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // 获取用户统计
    const totalUsersResult = await db.query('SELECT COUNT(*) as count FROM users');
    const activeUsersResult = await db.query("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
    
    // 获取匹配统计
    const totalMatchesResult = await db.query('SELECT COUNT(*) as count FROM matches');
    const todayMatchesResult = await db.query(`
      SELECT COUNT(*) as count FROM matches 
      WHERE DATE(matched_at) = DATE(NOW())
    `);
    
    // 获取手环统计
    const totalBraceletsResult = await db.query('SELECT COUNT(*) as count FROM bracelets');
    const activeBraceletsResult = await db.query("SELECT COUNT(*) as count FROM bracelets WHERE status = 'active'");

    const stats = {
      totalUsers: totalUsersResult.rows[0]?.count || 0,
      activeUsers: activeUsersResult.rows[0]?.count || 0,
      totalMatches: totalMatchesResult.rows[0]?.count || 0,
      todayMatches: todayMatchesResult.rows[0]?.count || 0,
      totalBracelets: totalBraceletsResult.rows[0]?.count || 0,
      activeBracelets: activeBraceletsResult.rows[0]?.count || 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}