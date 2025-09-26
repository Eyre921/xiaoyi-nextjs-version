import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // 获取最近的用户注册
    const recentUsersQuery = `
      SELECT 
        'user_registration' as type,
        name as user_name,
        wechat_id,
        created_at as activity_time,
        '新用户注册' as activity_description
      FROM users 
      ORDER BY created_at DESC 
      LIMIT $1
    `;

    // 获取最近的匹配记录
    const recentMatchesQuery = `
      SELECT 
        'match_success' as type,
        u1.name as user1_name,
        u1.wechat_id as user1_wechat_id,
        u2.name as user2_name,
        u2.wechat_id as user2_wechat_id,
        m.matched_at as activity_time,
        '成功匹配' as activity_description
      FROM matches m
      LEFT JOIN users u1 ON m.user1_id = u1.id
      LEFT JOIN users u2 ON m.user2_id = u2.id
      ORDER BY m.matched_at DESC 
      LIMIT $1
    `;

    // 获取最近的手环绑定（通过用户的nfc_uid更新来判断）
    const recentBindingsQuery = `
      SELECT 
        'bracelet_binding' as type,
        name as user_name,
        wechat_id,
        nfc_uid,
        created_at as activity_time,
        '手环绑定' as activity_description
      FROM users 
      WHERE nfc_uid IS NOT NULL
      ORDER BY created_at DESC 
      LIMIT $1
    `;

    // 执行查询
    const [usersResult, matchesResult, bindingsResult] = await Promise.all([
      db.query(recentUsersQuery, [limit]),
      db.query(recentMatchesQuery, [limit]),
      db.query(recentBindingsQuery, [limit])
    ]);

    // 合并所有活动并按时间排序
    const allActivities = [
      ...usersResult.rows,
      ...matchesResult.rows,
      ...bindingsResult.rows
    ].sort((a, b) => new Date(b.activity_time).getTime() - new Date(a.activity_time).getTime())
     .slice(0, limit);

    // 格式化活动数据
    const formattedActivities = allActivities.map(activity => {
      let description = '';
      let details = '';
      
      switch (activity.type) {
        case 'user_registration':
          description = '新用户注册';
          details = `${activity.user_name} (${activity.wechat_id})`;
          break;
        case 'match_success':
          description = '成功匹配';
          details = `${activity.user1_name} 与 ${activity.user2_name}`;
          break;
        case 'bracelet_binding':
          description = '手环绑定';
          details = `${activity.user_name} 绑定手环 ${activity.nfc_uid}`;
          break;
        default:
          description = activity.activity_description;
          details = activity.user_name || '';
      }

      return {
        type: activity.type,
        description,
        details,
        time: activity.activity_time,
        timeAgo: getTimeAgo(activity.activity_time)
      };
    });

    return NextResponse.json({
      activities: formattedActivities,
      total: formattedActivities.length
    });
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// 计算时间差的辅助函数
function getTimeAgo(dateString: string): string {
  const now = new Date();
  const activityTime = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return '刚刚';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  } else if (diffInMinutes < 1440) { // 24小时
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}小时前`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}天前`;
  }
}