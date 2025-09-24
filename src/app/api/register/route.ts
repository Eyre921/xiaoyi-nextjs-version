import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateNewFortune } from '@/lib/fortuneService';

export interface RegisterRequest {
  nfcuid: string;
  name: string;
  gender: string;
  birthdate: string;
  wechat_id: string;
  bio?: string;
  is_matchable: boolean;
}

export interface RegisterResponse {
  message: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<RegisterResponse>> {
  try {
    const body: RegisterRequest = await request.json();
    const { nfcuid, name, gender, birthdate, wechat_id, bio, is_matchable } = body;

    if (!nfcuid || !name || !gender || !wechat_id) {
      return NextResponse.json(
        { error: '请填写必填项！', message: '' },
        { status: 400 }
      );
    }

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // Step 1: Verify the nfcUid exists and is available
      const { rows: [bracelet] } = await client.query<{
        nfc_uid: string;
        status: string;
      }>("SELECT * FROM bracelets WHERE nfc_uid = $1 FOR UPDATE", [nfcuid]);
      
      if (!bracelet) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: '无效的 NFC UID。', message: '' },
          { status: 404 }
        );
      }
      
      if (bracelet.status !== 'available') {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: '该 NFC UID 已被绑定。', message: '' },
          { status: 409 }
        );
      }

      // Step 2: Create the new user
      const insertUserQuery = `
        INSERT INTO users (name, gender, birthdate, wechat_id, bio, is_matchable, nfc_uid, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        RETURNING *;
      `;
      
      const { rows: [newUser] } = await client.query(insertUserQuery, [
        name, gender, birthdate, wechat_id, bio || '', is_matchable, nfcuid
      ]);

      // Step 3: Update the bracelet status
      await client.query("UPDATE bracelets SET status = 'active' WHERE nfc_uid = $1", [nfcuid]);

      await client.query('COMMIT');
      console.log(`用户 ${newUser.name} (NFC: ${nfcuid}) 已成功注册并绑定。`);

      // Step 4: Asynchronously generate the user's first fortune and match
      setTimeout(() => {
        generateNewFortune(newUser).catch((err: Error) => {
          console.error(`为用户 ${newUser.id} 生成初始运势时出错:`, err);
          console.error(`错误详情 - 用户ID: ${newUser.id}, 名称: ${newUser.name}, 错误类型: ${err.name || 'Unknown'}, 错误消息: ${err.message || 'No message'}`);
        });
      }, 100);

      // Step 5: Return an immediate successful response
      return NextResponse.json({
        message: "注册成功！正在为您生成初始运势..."
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('注册失败:', error);
      
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        return NextResponse.json(
          { error: '该微信号或 NFC UID 已被注册过！', message: '' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: '服务器内部错误', message: '' },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('注册请求处理失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误', message: '' },
      { status: 500 }
    );
  }
}