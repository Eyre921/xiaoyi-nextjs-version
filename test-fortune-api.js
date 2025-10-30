// 运势生成API详细测试
// 模拟实际的运势生成场景

require('dotenv').config();

async function testFortuneGeneration() {
  console.log('=== 运势生成API详细测试 ===');
  
  // 模拟用户数据
  const user1 = {
    id: 1,
    name: "张三",
    gender: "男",
    bio: "喜欢读书和旅行的程序员",
    birthdate: "1990-05-15",
    wechat_id: "zhangsan123"
  };
  
  const user2 = {
    id: 2,
    name: "李四",
    gender: "女", 
    bio: "热爱摄影和美食的设计师",
    birthdate: "1992-08-20",
    wechat_id: "lisi456"
  };
  
  console.log('\n测试用户信息:');
  console.log('用户1:', user1.name, '-', user1.bio);
  console.log('用户2:', user2.name, '-', user2.bio);
  
  // API配置
  const apiKey = process.env.CUSTOM_API_KEY;
  const apiUrl = process.env.CUSTOM_API_URL;
  const model = process.env.CUSTOM_MODEL;
  
  // 构建完整的运势生成提示词（与实际应用相同）
  const prompt = `你是一位充满智慧的运势大师，擅长为人们解读缘分与运势。现在有两位用户通过NFC手环相遇，请为他们生成一段温暖、有趣且富有诗意的运势解读。

用户1信息：
- **姓名：** ${user1.name}
- **性别：** ${user1.gender}
- **生日：** ${user1.birthdate}
- **个人简介：** ${user1.bio}
- **微信号：** ${user1.wechat_id}

用户2信息：
- **姓名：** ${user2.name}
- **性别：** ${user2.gender}
- **生日：** ${user2.birthdate}
- **个人简介：** ${user2.bio}
- **微信号：** ${user2.wechat_id}

最终呈现: 输出一个完整的、无须修改的最终成品。不要包含任何关于你如何生成这段文字的元注释或解释。350个汉字以内`;

  const url = `${apiUrl}/chat/completions`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  
  const body = {
    "model": model,
    "messages": [{ "role": "user", "content": prompt }]
  };
  
  console.log('\n开始运势生成测试...');
  console.log('提示词长度:', prompt.length, '字符');
  
  try {
    const startTime = Date.now();
    
    console.log('\n正在调用API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      // 30秒超时
      signal: AbortSignal.timeout(30000)
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`API调用耗时: ${duration}ms`);
    console.log('响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API请求失败:');
      console.error('状态码:', response.status);
      console.error('错误详情:', errorText);
      return;
    }
    
    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const fortuneResult = data.choices[0].message.content;
      console.log('\n✅ 运势生成成功!');
      console.log('生成内容长度:', fortuneResult.length, '字符');
      console.log('\n--- 生成的运势内容 ---');
      console.log(fortuneResult);
      console.log('--- 运势内容结束 ---');
      
      // 检查token使用情况
      if (data.usage) {
        console.log('\nToken使用情况:');
        console.log('输入tokens:', data.usage.prompt_tokens);
        console.log('输出tokens:', data.usage.completion_tokens);
        console.log('总计tokens:', data.usage.total_tokens);
      }
      
    } else {
      console.log('⚠️ 响应格式异常');
      console.log('完整响应:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('\n❌ 运势生成失败:');
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    
    if (error.name === 'TimeoutError') {
      console.error('\n🕐 超时错误分析:');
      console.error('- 当前超时设置: 30秒');
      console.error('- 建议检查网络连接');
      console.error('- 可能需要增加超时时间');
    }
    
    // 测试降级方案
    console.log('\n🔄 测试降级方案...');
    const fallbackMessage = `你好，${user1.name}！今日的能量场有些特殊，让我为你直接介绍一位有趣的朋友吧～

${user2.name} 此刻也同在活动现场，"${user2.bio}"

👉 去发现这个有趣人类
- 姓名：${user2.name}
- 微信号：${user2.wechat_id}`;
    
    console.log('降级方案内容:');
    console.log(fallbackMessage);
  }
  
  console.log('\n=== 运势生成测试结束 ===');
}

// 运行测试
testFortuneGeneration().catch(console.error);