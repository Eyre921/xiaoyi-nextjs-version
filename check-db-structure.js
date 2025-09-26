const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

// 从环境变量读取数据库配置
const pool = new Pool({
  user: process.env.DB_USER || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_DATABASE || '',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function getTableStructures() {
  try {
    console.log('Connecting to PostgreSQL database...');
    
    // 获取所有表名
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log(`Found ${tablesResult.rows.length} tables`);
    
    let output = 'PostgreSQL Database Table Structures\n';
    output += '=====================================\n\n';
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`Processing table: ${tableName}`);
      
      output += `Table: ${tableName}\n`;
      output += '-'.repeat(50) + '\n';
      
      // 获取表结构
      const columnsResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);
      
      for (const column of columnsResult.rows) {
        output += `  ${column.column_name}: ${column.data_type}`;
        if (column.character_maximum_length) {
          output += `(${column.character_maximum_length})`;
        }
        if (column.is_nullable === 'NO') {
          output += ' NOT NULL';
        }
        if (column.column_default) {
          output += ` DEFAULT ${column.column_default}`;
        }
        output += '\n';
      }
      output += '\n';
    }
    
    // 保存到文件
    fs.writeFileSync('database_structure.txt', output);
    console.log('Database structure saved to database_structure.txt');
    console.log('\n' + output);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

getTableStructures();