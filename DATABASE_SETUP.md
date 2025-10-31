# 数据库设置说明

## 概述

本项目包含完整的数据库初始化脚本，用于创建音乐节NFC手环管理系统的数据库结构和初始数据。

## 文件说明

### 核心脚本
- `init-database.js` - **主要执行脚本**，一键完成数据库初始化
- `create-tables.sql` - 数据库表结构创建脚本
- `generate-uid-data.js` - NFC UID数据生成脚本

### 生成的SQL文件
- `insert-all-uids.sql` - 完整的UID插入脚本（1000个生产+100个测试）
- `insert-prod-uids.sql` - 仅生产环境UID插入脚本
- `insert-test-uids-new.sql` - 仅测试环境UID插入脚本

## 快速开始

### 1. 环境准备
确保 `.env` 文件包含正确的数据库连接信息：
```env
DB_USER=postgres
DB_HOST=47.238.240.231
DB_DATABASE=music
DB_PASSWORD=Jxy13675778380
DB_PORT=5432
```

### 2. 一键初始化
```bash
node init-database.js
```

这个命令会：
- 连接到数据库
- 创建所有必要的表结构
- 插入1000个生产环境NFC UID
- 插入100个测试环境NFC UID
- 验证数据完整性

## 数据库结构

### 表结构
1. **bracelets** - NFC手环表
   - `nfc_uid` (主键) - NFC唯一标识符
   - `status` - 状态（available/assigned等）
   - `created_at` - 创建时间

2. **users** - 用户表
   - `id` (主键) - 用户ID
   - `name` - 用户姓名
   - `nfc_uid` - 关联的NFC UID
   - `status` - 用户状态
   - 其他用户信息字段

3. **fortunes** - 运势表
   - `id` (主键) - 运势ID
   - `user_id` - 用户ID
   - `fortune_text` - 运势内容

4. **matches** - 匹配表
   - `id` (主键) - 匹配ID
   - `user1_id`, `user2_id` - 匹配的两个用户
   - `fortune_id` - 关联的运势

### NFC UID格式
- **生产环境**: `prod-XXXXXXXX` (8位随机字母数字)
- **测试环境**: `test-XXXXXXXX` (8位随机字母数字)

## 特性

### 幂等性
所有脚本都具有幂等性，可以安全地重复执行：
- 使用 `CREATE TABLE IF NOT EXISTS`
- 使用 `ON CONFLICT DO NOTHING`
- 不会产生重复数据

### 数据统计
初始化完成后会显示：
- 表创建状态
- 各环境UID数量统计
- 示例数据展示

## 手动操作

### 重新生成UID数据
```bash
node generate-uid-data.js
```

### 仅创建表结构（使用psql）
```bash
psql -h 47.238.240.231 -U postgres -d music -f create-tables.sql
```

### 仅插入UID数据（使用psql）
```bash
psql -h 47.238.240.231 -U postgres -d music -f insert-all-uids.sql
```

## 验证

初始化完成后，数据库应包含：
- ✅ 4个表：bracelets, users, fortunes, matches
- ✅ 1000个生产环境NFC UID (prod-*)
- ✅ 100个测试环境NFC UID (test-*)
- ✅ 所有UID状态为 "available"
- ✅ 0个用户记录（等待注册）

## 故障排除

### 连接失败
- 检查 `.env` 文件中的数据库配置
- 确认数据库服务器可访问
- 验证用户名和密码

### 权限错误
- 确保数据库用户有创建表的权限
- 检查数据库是否存在

### 重复执行
- 脚本具有幂等性，可以安全重复执行
- 如需清空重建，请手动删除表后重新执行