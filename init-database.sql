-- 完整的数据库初始化脚本
-- 包含建表和数据插入，确保幂等性
-- 可以安全地重复执行

-- ========================================
-- 第一部分：创建表结构
-- ========================================

-- 创建序列（如果不存在）
CREATE SEQUENCE IF NOT EXISTS fortunes_id_seq;
CREATE SEQUENCE IF NOT EXISTS matches_id_seq;
CREATE SEQUENCE IF NOT EXISTS users_id_seq;

-- 创建 bracelets 表
CREATE TABLE IF NOT EXISTS bracelets (
    nfc_uid character varying(255) NOT NULL PRIMARY KEY,
    status character varying(50) NOT NULL DEFAULT 'new',
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass) PRIMARY KEY,
    name character varying(255) NOT NULL,
    gender character varying(10),
    birthdate date,
    wechat_id character varying(255),
    bio text,
    nfc_uid character varying(255),
    status character varying(50) NOT NULL DEFAULT 'pending_registration',
    is_matchable boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_fortune_at timestamp with time zone,
    last_fortune_message text,
    last_matched_as_target_at timestamp with time zone,
    FOREIGN KEY (nfc_uid) REFERENCES bracelets(nfc_uid)
);

-- 创建 fortunes 表
CREATE TABLE IF NOT EXISTS fortunes (
    id integer NOT NULL DEFAULT nextval('fortunes_id_seq'::regclass) PRIMARY KEY,
    user_id integer NOT NULL,
    fortune_text text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建 matches 表
CREATE TABLE IF NOT EXISTS matches (
    id integer NOT NULL DEFAULT nextval('matches_id_seq'::regclass) PRIMARY KEY,
    user1_id integer NOT NULL,
    user2_id integer NOT NULL,
    fortune_id integer,
    matched_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id),
    FOREIGN KEY (fortune_id) REFERENCES fortunes(id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_bracelets_status ON bracelets(status);
CREATE INDEX IF NOT EXISTS idx_users_nfc_uid ON users(nfc_uid);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_is_matchable ON users(is_matchable);
CREATE INDEX IF NOT EXISTS idx_fortunes_user_id ON fortunes(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_fortune_id ON matches(fortune_id);

-- ========================================
-- 第二部分：插入NFC UID数据
-- ========================================

-- 注意：这里将包含生成的UID数据
-- 使用 \i 命令包含生成的SQL文件

\echo '开始插入NFC UID数据...'

-- 包含生成的UID数据
\i insert-all-uids.sql

-- ========================================
-- 第三部分：验证和统计
-- ========================================

\echo '数据库初始化完成，开始验证...'

-- 验证表创建
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('bracelets', 'users', 'fortunes', 'matches')
ORDER BY table_name;

-- 统计bracelets表数据
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

-- 显示总体统计
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

\echo '数据库初始化和验证完成！'