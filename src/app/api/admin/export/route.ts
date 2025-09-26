import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function convertToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // 处理包含逗号、引号或换行符的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  return [csvHeaders, ...csvRows].join('\n');
}

// 添加UTF-8 BOM以确保中文字符正确显示
function addUTF8BOM(content: string): Uint8Array {
  const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const contentBytes = new TextEncoder().encode(content);
  const result = new Uint8Array(BOM.length + contentBytes.length);
  result.set(BOM);
  result.set(contentBytes, BOM.length);
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const format = searchParams.get('format') || 'json';

    let data: any = {};
    let filename = `dd-export-${new Date().toISOString().split('T')[0]}`;

    if (type === 'users' || type === 'all') {
      const result = await db.query(`
        SELECT 
          id, name, gender, bio, birthdate, wechat_id, 
          last_fortune_at, last_fortune_message, nfc_uid, 
          status, is_matchable, created_at
        FROM users 
        ORDER BY created_at DESC
      `);
      data.users = result.rows;
    }

    if (type === 'matches' || type === 'all') {
      const result = await db.query(`
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
      `);
      data.matches = result.rows;
    }

    if (type === 'bracelets' || type === 'all') {
      const result = await db.query(`
        SELECT nfc_uid, status, created_at
        FROM bracelets 
        ORDER BY created_at DESC
      `);
      data.bracelets = result.rows;
    }

    if (format === 'csv') {
      let csvContent = '';
      
      if (type === 'users') {
        const headers = ['id', 'name', 'gender', 'bio', 'birthdate', 'wechat_id', 'last_fortune_at', 'last_fortune_message', 'nfc_uid', 'status', 'is_matchable', 'created_at'];
        csvContent = convertToCSV(data.users, headers);
        filename += '-users.csv';
      } else if (type === 'matches') {
        const headers = ['id', 'user1_id', 'user2_id', 'fortune_id', 'matched_at', 'user1_name', 'user1_wechat_id', 'user2_name', 'user2_wechat_id', 'fortune_text'];
        csvContent = convertToCSV(data.matches, headers);
        filename += '-matches.csv';
      } else if (type === 'bracelets') {
        const headers = ['nfc_uid', 'status', 'created_at'];
        csvContent = convertToCSV(data.bracelets, headers);
        filename += '-bracelets.csv';
      } else {
        // 全部数据的CSV格式，分别导出每个表
        let allCsv = '';
        if (data.users) {
          allCsv += '=== USERS ===\n';
          const userHeaders = ['id', 'name', 'gender', 'bio', 'birthdate', 'wechat_id', 'last_fortune_at', 'last_fortune_message', 'nfc_uid', 'status', 'is_matchable', 'created_at'];
          allCsv += convertToCSV(data.users, userHeaders) + '\n\n';
        }
        if (data.matches) {
          allCsv += '=== MATCHES ===\n';
          const matchHeaders = ['id', 'user1_id', 'user2_id', 'fortune_id', 'matched_at', 'user1_name', 'user1_wechat_id', 'user2_name', 'user2_wechat_id', 'fortune_text'];
          allCsv += convertToCSV(data.matches, matchHeaders) + '\n\n';
        }
        if (data.bracelets) {
          allCsv += '=== BRACELETS ===\n';
          const braceletHeaders = ['nfc_uid', 'status', 'created_at'];
          allCsv += convertToCSV(data.bracelets, braceletHeaders);
        }
        csvContent = allCsv;
        filename += '-all.csv';
      }

      return new NextResponse(addUTF8BOM(csvContent), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        },
      });
    } else {
      // JSON format
      filename += type === 'all' ? '-all.json' : `-${type}.json`;
      const jsonContent = JSON.stringify(data, null, 2);
      
      return new NextResponse(jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error('Failed to export data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}