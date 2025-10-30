import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export interface ValidateUserResponse {
  exists: boolean;
  action?: 'register' | 'fortune';
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<ValidateUserResponse>> {
  const { searchParams } = new URL(request.url);
  const nfcuid = searchParams.get('nfcuid');
  
  console.log(`[${new Date().toISOString()}] 收到用户验证请求，nfcuid: ${nfcuid}`);
  
  try {
    if (!nfcuid) {
      console.log(`[${new Date().toISOString()}] 验证请求缺少nfcuid参数`);
      return NextResponse.json(
        { exists: false, error: 'nfcuid is required' },
        { status: 400 }
      );
    }
    
    // Step 1: 快速验证 nfcUid 是否在 bracelets 表中存在
    const { rows: [bracelet] } = await db.query<{
      nfc_uid: string;
      status: string;
    }>("SELECT nfc_uid FROM bracelets WHERE nfc_uid = $1 LIMIT 1", [nfcuid]);
    
    if (!bracelet) {
      console.log(`[${new Date().toISOString()}] NFC UID不存在: ${nfcuid}`);
      return NextResponse.json({
        exists: false,
        error: '无效的 NFC UID'
      }, { status: 404 });
    }

    // Step 2: 快速检查是否已有用户绑定了该 UID
    const { rows: [user] } = await db.query<{ id: number }>(
      "SELECT id FROM users WHERE nfc_uid = $1 AND status = 'active' LIMIT 1",
      [nfcuid]
    );

    if (!user) {
      // UID 有效但未注册
      console.log(`[${new Date().toISOString()}] UID有效但未注册: ${nfcuid}`);
      return NextResponse.json({
        exists: false,
        action: 'register'
      });
    }

    // 用户已存在
    console.log(`[${new Date().toISOString()}] 用户已存在: ${nfcuid}`);
    return NextResponse.json({
      exists: true,
      action: 'fortune'
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 验证用户时出错:`, error);
    return NextResponse.json(
      { exists: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}