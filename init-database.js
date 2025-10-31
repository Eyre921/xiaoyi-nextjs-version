const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 数据库连接配置
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

console.log('🔗 数据库连接配置:');
console.log(`- 主机: ${dbConfig.host}:${dbConfig.port}`);
console.log(`- 数据库: ${dbConfig.database}`);
console.log(`- 用户: ${dbConfig.user}`);

async function initDatabase() {
    const client = new Client(dbConfig);
    
    try {
        console.log('\n🔌 正在连接数据库...');
        await client.connect();
        console.log('✅ 数据库连接成功！');

        // 第一步：创建表结构
        console.log('\n📋 第一步：创建表结构...');
        const createTablesSQL = fs.readFileSync(path.join(__dirname, 'create-tables.sql'), 'utf8');
        await client.query(createTablesSQL);
        console.log('✅ 表结构创建完成！');

        // 第二步：插入NFC UID数据
        console.log('\n💾 第二步：插入NFC UID数据...');
        const insertUIDsSQL = fs.readFileSync(path.join(__dirname, 'insert-all-uids.sql'), 'utf8');
        await client.query(insertUIDsSQL);
        console.log('✅ NFC UID数据插入完成！');

        // 第三步：验证数据
        console.log('\n🔍 第三步：验证数据...');
        
        // 验证表创建
        const tablesResult = await client.query(`
            SELECT 
                table_name,
                table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
                AND table_name IN ('bracelets', 'users', 'fortunes', 'matches')
            ORDER BY table_name;
        `);
        
        console.log('\n📊 已创建的表:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name} (${row.table_type})`);
        });

        // 统计bracelets表数据
        const braceletsStats = await client.query(`
            SELECT 
                CASE 
                    WHEN nfc_uid LIKE 'prod-%' THEN '生产环境'
                    WHEN nfc_uid LIKE 'test-%' THEN '测试环境'
                    ELSE '其他'
                END as environment,
                status,
                COUNT(*) as count
            FROM bracelets 
            GROUP BY 
                CASE 
                    WHEN nfc_uid LIKE 'prod-%' THEN '生产环境'
                    WHEN nfc_uid LIKE 'test-%' THEN '测试环境'
                    ELSE '其他'
                END,
                status
            ORDER BY environment, status;
        `);

        console.log('\n📈 Bracelets表统计:');
        braceletsStats.rows.forEach(row => {
            console.log(`  - ${row.environment} (${row.status}): ${row.count}个`);
        });

        // 显示总体统计
        const totalStats = await client.query(`
            SELECT 
                'bracelets' as table_name,
                COUNT(*) as total_records
            FROM bracelets
            UNION ALL
            SELECT 
                'users' as table_name,
                COUNT(*) as total_records
            FROM users
            UNION ALL
            SELECT 
                'fortunes' as table_name,
                COUNT(*) as total_records
            FROM fortunes
            UNION ALL
            SELECT 
                'matches' as table_name,
                COUNT(*) as total_records
            FROM matches
            ORDER BY table_name;
        `);

        console.log('\n📊 总体统计:');
        totalStats.rows.forEach(row => {
            console.log(`  - ${row.table_name}: ${row.total_records}条记录`);
        });

        // 显示一些示例数据
        const sampleData = await client.query(`
            SELECT nfc_uid, status, created_at 
            FROM bracelets 
            WHERE nfc_uid LIKE 'prod-%' 
            ORDER BY nfc_uid 
            LIMIT 5;
        `);

        console.log('\n🔍 生产环境UID示例:');
        sampleData.rows.forEach(row => {
            console.log(`  - ${row.nfc_uid} (${row.status}) - ${row.created_at.toISOString()}`);
        });

        const testSampleData = await client.query(`
            SELECT nfc_uid, status, created_at 
            FROM bracelets 
            WHERE nfc_uid LIKE 'test-%' 
            ORDER BY nfc_uid 
            LIMIT 5;
        `);

        console.log('\n🧪 测试环境UID示例:');
        testSampleData.rows.forEach(row => {
            console.log(`  - ${row.nfc_uid} (${row.status}) - ${row.created_at.toISOString()}`);
        });

        console.log('\n🎉 数据库初始化完成！');
        console.log('\n📝 总结:');
        console.log('  - 已创建4个表: bracelets, users, fortunes, matches');
        console.log('  - 已插入1000个生产环境NFC UID');
        console.log('  - 已插入100个测试环境NFC UID');
        console.log('  - 所有UID状态为"available"，等待用户注册');
        console.log('  - 脚本具有幂等性，可以安全地重复执行');

    } catch (error) {
        console.error('❌ 数据库操作失败:', error);
        console.error('错误详情:', error.message);
        if (error.code) {
            console.error('错误代码:', error.code);
        }
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 数据库连接已关闭');
    }
}

// 执行初始化
console.log('🚀 开始数据库初始化...');
initDatabase().catch(console.error);