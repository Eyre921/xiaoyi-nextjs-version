import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    const body = await request.json();
    
    const {
      name,
      gender,
      bio,
      birthdate,
      wechat_id,
      nfc_uid,
      status,
      is_matchable
    } = body;

    // 检查NFC UID是否已被其他用户使用
    if (nfc_uid) {
      const existingUser = await db.query(
        'SELECT id FROM users WHERE nfc_uid = $1 AND id != $2',
        [nfc_uid, userId]
      );
      
      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'NFC UID已被其他用户使用' },
          { status: 400 }
        );
      }
    }

    // 更新用户信息
    const result = await db.query(`
      UPDATE users 
      SET 
        name = COALESCE($1, name),
        gender = COALESCE($2, gender),
        bio = COALESCE($3, bio),
        birthdate = COALESCE($4, birthdate),
        wechat_id = COALESCE($5, wechat_id),
        nfc_uid = COALESCE($6, nfc_uid),
        status = COALESCE($7, status),
        is_matchable = COALESCE($8, is_matchable)
      WHERE id = $9
      RETURNING *
    `, [name, gender, bio, birthdate, wechat_id, nfc_uid, status, is_matchable, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 如果修改了NFC UID，需要更新手环表
    if (nfc_uid) {
      // 检查新的NFC UID是否存在于手环表中
      const braceletResult = await db.query(
        'SELECT * FROM bracelets WHERE nfc_uid = $1',
        [nfc_uid]
      );

      if (braceletResult.rows.length === 0) {
        // 如果手环不存在，创建新的手环记录
        await db.query(
          'INSERT INTO bracelets (nfc_uid, status) VALUES ($1, $2)',
          [nfc_uid, 'bound']
        );
      } else {
        // 如果手环存在，更新状态为已绑定
        await db.query(
          'UPDATE bracelets SET status = $1 WHERE nfc_uid = $2',
          ['bound', nfc_uid]
        );
      }
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: '更新用户失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);

    // 获取用户信息以便处理连带删除
    const userResult = await db.query(
      'SELECT nfc_uid FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // 删除相关的匹配记录
    await db.query(
      'DELETE FROM matches WHERE user1_id = $1 OR user2_id = $1',
      [userId]
    );

    // 如果用户有绑定的手环，将手环状态改为未绑定
    if (user && user.nfc_uid) {
      await db.query(
        'UPDATE bracelets SET status = $1 WHERE nfc_uid = $2',
        ['active', user.nfc_uid]
      );
    }

    // 删除用户
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: '删除用户失败' },
      { status: 500 }
    );
  }
}