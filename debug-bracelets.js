const { Pool } = require('pg');
require('dotenv').config();

// 数据库连接配置
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'xiaoyi_db',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

console.log('数据库配置:', {
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  port: dbConfig.port,
  hasPassword: !!dbConfig.password
});

let pool = null;
let useMockData = false;

// 检查是否有数据库配置
if (!dbConfig.password || !dbConfig.host) {
  console.log('数据库配置不完整，使用模拟数据进行分析...\n');
  useMockData = true;
} else {
  pool = new Pool(dbConfig);
}

async function debugBracelets() {
  try {
    console.log('=== 调试手环数据 ===\n');

    if (useMockData) {
      // 使用模拟数据进行分析
      console.log('使用模拟数据分析分页问题...\n');
      
      // 模拟1000条手环数据，其中最后一条重复出现
      const mockBracelets = [];
      const problematicUID = 'bc4dee4e-43b0-4f0a-9ea8-edc85ea32650';
      
      for (let i = 1; i <= 1000; i++) {
        mockBracelets.push({
          id: i,
          nfc_uid: i === 1000 ? problematicUID : `uid-${i.toString().padStart(4, '0')}`,
          status: 'new',
          created_at: new Date(Date.now() - (1000 - i) * 60000).toISOString()
        });
      }
      
      console.log(`总手环数量: ${mockBracelets.length}`);
      
      // 检查重复的UID
      const uidCounts = {};
      mockBracelets.forEach(bracelet => {
        uidCounts[bracelet.nfc_uid] = (uidCounts[bracelet.nfc_uid] || 0) + 1;
      });
      
      const duplicates = Object.entries(uidCounts).filter(([uid, count]) => count > 1);
      console.log(`重复的UID数量: ${duplicates.length}`);
      duplicates.forEach(([uid, count]) => {
        console.log(`  - ${uid}: ${count} 次`);
      });
      
      // 检查问题UID
      const problematicCount = uidCounts[problematicUID] || 0;
      console.log(`\n问题UID "${problematicUID}" 出现次数: ${problematicCount}`);
      
      // 模拟分页查询 - 检查每页最后一条记录
      const limit = 10;
      console.log('\n=== 分页查询分析 ===');
      
      for (let page = 1; page <= 3; page++) {
        const offset = (page - 1) * limit;
        const pageData = mockBracelets
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(offset, offset + limit);
        
        const lastRecord = pageData[pageData.length - 1];
        console.log(`第${page}页最后一条记录:`);
        console.log(`  ID: ${lastRecord.id}, UID: ${lastRecord.nfc_uid}, 创建时间: ${lastRecord.created_at}`);
      }
      
      // 分析可能的问题
      console.log('\n=== 问题分析 ===');
      console.log('基于模拟数据的分析结果:');
      console.log('1. 如果数据库中确实存在重复的UID，这可能是数据插入时的问题');
      console.log('2. 如果分页查询的ORDER BY逻辑有问题，可能导致相同记录出现在不同页面');
      console.log('3. 需要检查实际的SQL查询和排序逻辑');
      
    } else {
      // 使用真实数据库
      console.log('1. 检查手环总数...');
      const totalResult = await pool.query('SELECT COUNT(*) as total FROM bracelets');
      console.log(`总手环数量: ${totalResult.rows[0].total}`);

      console.log('\n2. 检查重复的nfc_uid...');
      const duplicateQuery = `
        SELECT nfc_uid, COUNT(*) as count 
        FROM bracelets 
        GROUP BY nfc_uid 
        HAVING COUNT(*) > 1
        ORDER BY count DESC
      `;
      const duplicateResult = await pool.query(duplicateQuery);
      console.log(`重复的UID数量: ${duplicateResult.rows.length}`);
      duplicateResult.rows.forEach(row => {
        console.log(`  - ${row.nfc_uid}: ${row.count} 次`);
      });

      console.log('\n3. 检查问题UID的出现情况...');
       const problematicUID = 'bc4dee4e-43b0-4f0a-9ea8-edc85ea32650';
       const problematicQuery = `
         SELECT nfc_uid, status, created_at 
         FROM bracelets 
         WHERE nfc_uid = $1
         ORDER BY created_at DESC
       `;
       const problematicResult = await pool.query(problematicQuery, [problematicUID]);
       console.log(`问题UID "${problematicUID}" 出现次数: ${problematicResult.rows.length}`);
       problematicResult.rows.forEach((row, index) => {
         console.log(`  ${index + 1}. UID: ${row.nfc_uid}, 状态: ${row.status}, 创建时间: ${row.created_at}`);
       });

       console.log('\n4. 检查最近创建的手环...');
       const recentQuery = `
         SELECT nfc_uid, status, created_at 
         FROM bracelets 
         ORDER BY created_at DESC 
         LIMIT 20
       `;
       const recentResult = await pool.query(recentQuery);
       console.log('最近20条手环记录:');
       recentResult.rows.forEach((row, index) => {
         console.log(`  ${index + 1}. UID: ${row.nfc_uid}, 状态: ${row.status}, 创建时间: ${row.created_at}`);
       });

       console.log('\n5. 模拟分页查询 - 检查每页最后一条记录...');
       const limit = 10;
       for (let page = 1; page <= 3; page++) {
         const offset = (page - 1) * limit;
         const pageQuery = `
           SELECT b.nfc_uid, b.status, b.created_at, u.name as username
           FROM bracelets b
           LEFT JOIN users u ON b.nfc_uid = u.nfc_uid
           ORDER BY b.created_at DESC
           LIMIT $1 OFFSET $2
         `;
         const pageResult = await pool.query(pageQuery, [limit, offset]);
         
         if (pageResult.rows.length > 0) {
           const lastRecord = pageResult.rows[pageResult.rows.length - 1];
           console.log(`第${page}页最后一条记录:`);
           console.log(`  UID: ${lastRecord.nfc_uid}, 用户: ${lastRecord.username || '未绑定'}, 创建时间: ${lastRecord.created_at}`);
         }
       }

      console.log('\n6. 检查相同创建时间的记录...');
      const sameTimeQuery = `
        SELECT created_at, COUNT(*) as count
        FROM bracelets
        GROUP BY created_at
        HAVING COUNT(*) > 1
        ORDER BY count DESC
        LIMIT 10
      `;
      const sameTimeResult = await pool.query(sameTimeQuery);
      console.log(`相同创建时间的记录组数: ${sameTimeResult.rows.length}`);
      sameTimeResult.rows.forEach(row => {
        console.log(`  - ${row.created_at}: ${row.count} 条记录`);
      });
    }

  } catch (error) {
    console.error('调试过程中发生错误:', error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

debugBracelets();