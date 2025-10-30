// 测试已注册用户的运势生成API调用
// 模拟实际的已注册用户场景

require('dotenv').config();

async function testRegisteredUserFortune() {
  console.log('=== 已注册用户运势生成测试 ===');
  
  const baseUrl = 'http://localhost:4002';
  
  // 首先查询一个真实的已注册用户
  console.log('\n1. 查询已注册用户...');
  
  try {
    // 模拟一个已注册用户的API调用
    const testUrl = `${baseUrl}/api/fortune?nfcuid=test-uid-001&registered=true`;
    console.log('请求URL:', testUrl);
    
    const startTime = Date.now();
    console.log('\n2. 发送运势生成请求...');
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 30秒超时，与应用代码一致
      signal: AbortSignal.timeout(30000)
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`请求耗时: ${duration}ms`);
    console.log('响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 请求失败:');
      console.error('状态码:', response.status);
      console.error('错误详情:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('\n✅ 运势生成成功!');
    console.log('响应数据:', JSON.stringify(data, null, 2));
    
    if (data.message) {
      console.log('\n--- 生成的运势内容 ---');
      console.log(data.message);
      console.log('--- 运势内容结束 ---');
      console.log('内容长度:', data.message.length, '字符');
    }
    
  } catch (error) {
    console.error('\n❌ 运势生成失败:');
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    
    if (error.name === 'TimeoutError') {
      console.error('\n🕐 超时错误分析:');
      console.error('- 当前超时设置: 30秒');
      console.error('- 这与应用代码中的设置一致');
      console.error('- 可能的原因:');
      console.error('  1. AI API响应时间过长');
      console.error('  2. 网络连接问题');
      console.error('  3. 数据库查询耗时');
      console.error('  4. 服务器负载过高');
    }
  }
  
  console.log('\n=== 测试结束 ===');
}

// 运行测试
testRegisteredUserFortune().catch(console.error);