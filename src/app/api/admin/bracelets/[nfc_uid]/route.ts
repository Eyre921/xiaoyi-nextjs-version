import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ nfc_uid: string }> }
) {
  try {
    const resolvedParams = await params;
    const nfcUid = resolvedParams.nfc_uid;
    const body = await request.json();
    
    const { status } = body;

    // 更新手环状态
    const result = await db.query(`
      UPDATE bracelets 
      SET status = $1
      WHERE nfc_uid = $2
      RETURNING *
    `, [status, nfcUid]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '手环不存在' },
        { status: 404 }
      );
    }

    // 如果手环状态改为非活跃，需要检查是否有用户绑定了这个手环
    if (status === 'inactive') {
      const userResult = await db.query(
        'SELECT id, name FROM users WHERE nfc_uid = $1',
        [nfcUid]
      );

      if (userResult.rows.length > 0) {
        // 将用户的NFC UID设为null，解除绑定
        await db.query(
          'UPDATE users SET nfc_uid = NULL WHERE nfc_uid = $1',
          [nfcUid]
        );
      }
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update bracelet:', error);
    return NextResponse.json(
      { error: '更新手环失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ nfc_uid: string }> }
) {
  try {
    const resolvedParams = await params;
    const nfcUid = resolvedParams.nfc_uid;

    // 检查是否有用户绑定了这个手环
    const userResult = await db.query(
      'SELECT id, name FROM users WHERE nfc_uid = $1',
      [nfcUid]
    );

    if (userResult.rows.length > 0) {
      return NextResponse.json(
        { error: '无法删除已绑定用户的手环，请先解除绑定' },
        { status: 400 }
      );
    }

    // 删除手环
    const result = await db.query(
      'DELETE FROM bracelets WHERE nfc_uid = $1 RETURNING *',
      [nfcUid]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '手环不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete bracelet:', error);
    return NextResponse.json(
      { error: '删除手环失败' },
      { status: 500 }
    );
  }
}