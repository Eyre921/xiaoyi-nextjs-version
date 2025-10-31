-- 创建数据库表结构
-- 确保幂等性：如果表已存在则不会重复创建

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

-- 验证表创建
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('bracelets', 'users', 'fortunes', 'matches')
ORDER BY table_name;