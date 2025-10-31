const fs = require('fs');
const crypto = require('crypto');

// 生成8位随机字母数字字符串
function generateRandomUID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 生成唯一的UID集合
function generateUniqueUIDs(count, prefix) {
    const uids = new Set();
    while (uids.size < count) {
        const uid = `${prefix}-${generateRandomUID()}`;
        uids.add(uid);
    }
    return Array.from(uids);
}

// 生成SQL插入语句
function generateInsertSQL(uids, status = 'available') {
    const values = uids.map(uid => 
        `('${uid}', '${status}', NOW())`
    ).join(',\n');
    
    return `-- 插入${uids.length}个NFC UID到bracelets表
-- 使用ON CONFLICT DO NOTHING确保幂等性
INSERT INTO bracelets (nfc_uid, status, created_at) VALUES 
${values}
ON CONFLICT (nfc_uid) DO NOTHING;

-- 验证插入结果
SELECT COUNT(*) as total_uids FROM bracelets WHERE nfc_uid LIKE '${uids[0].split('-')[0]}-%';

-- 查看插入的UID（前10个）
SELECT nfc_uid, status, created_at FROM bracelets 
WHERE nfc_uid LIKE '${uids[0].split('-')[0]}-%' 
ORDER BY nfc_uid 
LIMIT 10;
`;
}

console.log('开始生成NFC UID数据...');

// 生成1000个生产环境UID
console.log('生成1000个生产环境UID...');
const prodUIDs = generateUniqueUIDs(1000, 'prod');

// 生成100个测试环境UID
console.log('生成100个测试环境UID...');
const testUIDs = generateUniqueUIDs(100, 'test');

// 生成生产环境SQL文件
const prodSQL = generateInsertSQL(prodUIDs, 'available');
fs.writeFileSync('./insert-prod-uids.sql', prodSQL);
console.log('✅ 生产环境UID SQL文件已生成: insert-prod-uids.sql');

// 生成测试环境SQL文件
const testSQL = generateInsertSQL(testUIDs, 'available');
fs.writeFileSync('./insert-test-uids-new.sql', testSQL);
console.log('✅ 测试环境UID SQL文件已生成: insert-test-uids-new.sql');

// 生成合并的SQL文件
const combinedSQL = `-- 完整的NFC UID数据插入脚本
-- 包含1000个生产环境UID和100个测试环境UID
-- 使用ON CONFLICT DO NOTHING确保幂等性

${prodSQL}

${testSQL}

-- 总体统计
SELECT 
    CASE 
        WHEN nfc_uid LIKE 'prod-%' THEN '生产环境'
        WHEN nfc_uid LIKE 'test-%' THEN '测试环境'
        ELSE '其他'
    END as environment,
    COUNT(*) as count
FROM bracelets 
WHERE nfc_uid LIKE 'prod-%' OR nfc_uid LIKE 'test-%'
GROUP BY 
    CASE 
        WHEN nfc_uid LIKE 'prod-%' THEN '生产环境'
        WHEN nfc_uid LIKE 'test-%' THEN '测试环境'
        ELSE '其他'
    END
ORDER BY environment;
`;

fs.writeFileSync('./insert-all-uids.sql', combinedSQL);
console.log('✅ 合并的UID SQL文件已生成: insert-all-uids.sql');

console.log('\n📊 生成统计:');
console.log(`- 生产环境UID: ${prodUIDs.length}个`);
console.log(`- 测试环境UID: ${testUIDs.length}个`);
console.log(`- 总计: ${prodUIDs.length + testUIDs.length}个`);

console.log('\n🔍 示例UID:');
console.log('生产环境:', prodUIDs.slice(0, 5));
console.log('测试环境:', testUIDs.slice(0, 5));

console.log('\n✨ 所有文件已生成完成！');