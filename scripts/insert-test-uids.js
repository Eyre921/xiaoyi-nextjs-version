// 插入50个测试用的NFC UID到数据库
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function insertTestUIDs() {
  const client = await pool.connect();
  
  try {
    console.log('开始插入50个测试UID...');
    
    // 生成50个测试UID
    const testUIDs = [];
    for (let i = 1; i <= 50; i++) {
      const uid = `test-uid-${i.toString().padStart(3, '0')}`;
      testUIDs.push(uid);
    }
    
    // 检查是否已存在这些UID
    const existingUIDs = await client.query(
      'SELECT nfc_uid FROM bracelets WHERE nfc_uid = ANY($1)',
      [testUIDs]
    );
    
    if (existingUIDs.rows.length > 0) {
      console.log('发现已存在的测试UID:', existingUIDs.rows.map(row => row.nfc_uid));
      console.log('跳过已存在的UID，只插入新的UID...');
    }
    
    const existingUIDSet = new Set(existingUIDs.rows.map(row => row.nfc_uid));
    const newUIDs = testUIDs.filter(uid => !existingUIDSet.has(uid));
    
    if (newUIDs.length === 0) {
      console.log('所有测试UID都已存在，无需插入。');
      return;
    }
    
    // 批量插入新的UID
    const insertQuery = `
      INSERT INTO bracelets (nfc_uid, status, created_at) 
      VALUES ${newUIDs.map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`).join(', ')}
    `;
    
    const insertValues = [];
    newUIDs.forEach(uid => {
      insertValues.push(uid, 'available', new Date());
    });
    
    const result = await client.query(insertQuery, insertValues);
    console.log(`成功插入 ${result.rowCount} 个测试UID`);
    
    // 验证插入结果
    const verifyResult = await client.query(
      'SELECT COUNT(*) as total FROM bracelets WHERE nfc_uid LIKE $1',
      ['test-uid-%']
    );
    
    console.log(`数据库中现在共有 ${verifyResult.rows[0].total} 个测试UID`);
    
    // 显示前10个测试UID作为示例
    const sampleResult = await client.query(
      'SELECT nfc_uid, status, created_at FROM bracelets WHERE nfc_uid LIKE $1 ORDER BY nfc_uid LIMIT 10',
      ['test-uid-%']
    );
    
    console.log('前10个测试UID示例:');
    sampleResult.rows.forEach(row => {
      console.log(`- ${row.nfc_uid} (${row.status}) - ${row.created_at}`);
    });
    
  } catch (error) {
    console.error('插入测试UID时发生错误:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 运行脚本
insertTestUIDs().catch(console.error);