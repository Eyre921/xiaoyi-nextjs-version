// AI API 测试文件
// 用于测试豆包API调用是否正常工作

require('dotenv').config();

async function testAIAPI() {
  console.log('=== AI API 测试开始 ===');
  
  // 1. 检查环境变量
  console.log('\n1. 检查环境变量:');
  console.log('AI_PROVIDER:', process.env.AI_PROVIDER);
  console.log('CUSTOM_API_KEY:', process.env.CUSTOM_API_KEY ? '已设置' : '未设置');
  console.log('CUSTOM_API_URL:', process.env.CUSTOM_API_URL);
  console.log('CUSTOM_MODEL:', process.env.CUSTOM_MODEL);
  
  // 2. 准备API调用参数
  const apiKey = process.env.CUSTOM_API_KEY;
  const apiUrl = process.env.CUSTOM_API_URL;
  const model = process.env.CUSTOM_MODEL;
  
  if (!apiKey || !apiUrl || !model) {
    console.error('\n❌ 缺少必要的环境变量配置');
    return;
  }
  
  // 3. 构建请求
  const url = `${apiUrl}/chat/completions`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  
  const testPrompt = "请简单回复：你好，这是一个API连接测试。";
  
  const body = {
    "model": model,
    "messages": [{ "role": "user", "content": testPrompt }],
    "max_tokens": 100,
    "temperature": 0.7
  };
  
  console.log('\n2. 发送测试请求:');
  console.log('URL:', url);
  console.log('Model:', model);
  console.log('Prompt:', testPrompt);
  
  try {
    console.log('\n3. 正在调用API...');
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      // 设置30秒超时
      signal: AbortSignal.timeout(30000)
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`请求耗时: ${duration}ms`);
    console.log('响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API请求失败:');
      console.error('状态码:', response.status);
      console.error('错误信息:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('\n4. API响应成功:');
    console.log('完整响应:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('\n✅ AI回复:', data.choices[0].message.content);
    } else {
      console.log('⚠️ 响应格式异常，未找到预期的回复内容');
    }
    
  } catch (error) {
    console.error('\n❌ API调用异常:');
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    
    if (error.name === 'TimeoutError') {
      console.error('🕐 这是一个超时错误，可能的原因:');
      console.error('  - 网络连接问题');
      console.error('  - API服务器响应慢');
      console.error('  - API密钥或URL配置错误');
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🌐 网络请求错误，可能的原因:');
      console.error('  - URL格式错误');
      console.error('  - 网络连接问题');
      console.error('  - DNS解析问题');
    }
    
    console.error('\n完整错误对象:', error);
  }
  
  console.log('\n=== AI API 测试结束 ===');
}

// 运行测试
testAIAPI().catch(console.error);