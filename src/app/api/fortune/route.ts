import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateNewFortune } from '@/lib/fortuneService';

interface User {
  id: number;
  name: string;
  gender: string;
  bio: string;
  birthdate: string;
  wechat_id: string;
  last_fortune_at: string | null;
  last_fortune_message: string | null;
}

export interface FortuneRequest {
  nfcuid: string;
}

export interface FortuneResponse {
  action?: 'register';
  message?: string | null;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<FortuneResponse>> {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const nfcuid = searchParams.get('nfcuid');
  
  console.log(`[${new Date().toISOString()}] 收到运势请求，nfcuid: ${nfcuid}`);
  
  try {
    if (!nfcuid) {
      console.log(`[${new Date().toISOString()}] 请求缺少nfcuid参数`);
      return NextResponse.json(
        { error: 'nfcuid is required' },
        { status: 400 }
      );
    }
    
    console.log(`[${new Date().toISOString()}] 开始验证NFC UID: ${nfcuid}`);
    const validateStartTime = Date.now();
    
    // Step 1: 验证 nfcUid 是否在 bracelets 表中存在
    const { rows: [bracelet] } = await db.query<{
      nfc_uid: string;
      status: string;
    }>("SELECT * FROM bracelets WHERE nfc_uid = $1", [nfcuid]);
    
    console.log(`[${new Date().toISOString()}] 验证NFC UID耗时: ${Date.now() - validateStartTime}ms`);
    
    if (!bracelet) {
      console.log(`[${new Date().toISOString()}] NFC UID不存在: ${nfcuid}`);
      return NextResponse.json(
        { error: '无效的 NFC UID。' },
        { status: 404 }
      );
    }

    console.log(`[${new Date().toISOString()}] 开始查询用户绑定信息`);
    const userStartTime = Date.now();
    
    // Step 2: 查询是否已有用户绑定了该 UID
    const { rows: [user] } = await db.query<User>(
      "SELECT * FROM users WHERE nfc_uid = $1 AND status = 'active'",
      [nfcuid]
    );
    
    console.log(`[${new Date().toISOString()}] 查询用户绑定信息耗时: ${Date.now() - userStartTime}ms`);

    if (!user) {
      // UID 有效但未注册，引导至注册页面
      console.log(`[${new Date().toISOString()}] UID有效但未注册: ${nfcuid}`);
      return NextResponse.json({
        action: 'register',
        message: 'User not found. Please register first.'
      });
    }

    console.log(`[${new Date().toISOString()}] 找到用户: ${user.id} (${user.name})`);

    // 已存在用户，处理运势生成
    const now = new Date();
    const lastFortuneDate = user.last_fortune_at ? new Date(user.last_fortune_at) : null;
    
    const today8AM = new Date();
    today8AM.setHours(8, 0, 0, 0);

    const needsUpdate = !lastFortuneDate || (now >= today8AM && lastFortuneDate < today8AM);

    console.log(`[${new Date().toISOString()}] 运势更新判断 - needsUpdate: ${needsUpdate}, lastFortuneDate: ${lastFortuneDate}, today8AM: ${today8AM}`);

    if (needsUpdate) {
      console.log(`[${new Date().toISOString()}] 需要生成新运势，开始调用generateNewFortune...`);
      const generateStartTime = Date.now();
      const newMessage = await generateNewFortune(user);
      console.log(`[${new Date().toISOString()}] 生成新运势总耗时: ${Date.now() - generateStartTime}ms`);
      console.log(`[${new Date().toISOString()}] 请求处理总耗时: ${Date.now() - startTime}ms`);
      return NextResponse.json({ message: newMessage });
    } else {
      console.log(`[${new Date().toISOString()}] 用户 ${user.id} 在刷新周期内访问，返回缓存消息。总耗时: ${Date.now() - startTime}ms`);
      return NextResponse.json({ message: user.last_fortune_message });
    }
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 处理运势请求时出错:`, error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}