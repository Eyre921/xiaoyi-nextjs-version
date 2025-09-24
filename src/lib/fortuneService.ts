// 文件路径: src/lib/fortuneService.ts

import { db } from './db';
import { appConfig } from './config';

interface User {
  id: number;
  name: string;
  gender: string;
  bio: string;
  birthdate: string;
  wechat_id: string;
}

interface AIProviderConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

interface AIConfig {
  provider: string;
  gemini: AIProviderConfig;
  openai: AIProviderConfig;
  custom: AIProviderConfig;
}

interface QueryResult {
  rows: User[];
}

const getFortuneFromLLM = async (user1: User, user2: User): Promise<string> => {
  console.log(`[Final Version] 正在为 ${user1.name} 和 ${user2.name} 调用 API...`);
  
  // 获取AI服务提供商配置
  const provider = appConfig.ai.provider || 'gemini';
  console.log(`使用AI服务提供商: ${provider}`);
  
  // 根据提供商选择配置
  let apiConfig: AIProviderConfig;
  switch (provider) {
    case 'gemini':
      apiConfig = appConfig.ai.gemini;
      break;
    case 'openai':
      apiConfig = appConfig.ai.openai;
      break;
    case 'custom':
      apiConfig = appConfig.ai.custom;
      break;
    default:
      apiConfig = appConfig.ai.gemini;
  }
  
  const { apiKey, apiUrl, model } = apiConfig;
  if (!apiKey || !apiUrl || !model) {
    console.error(`${provider.toUpperCase()} API configuration is missing.`);
    // Fallback logic
    const greeting = `你好，${user1.name}！今天为你匹配到同样热爱生活的 ${user2.name}。`;
    const welcome = `"${user1.bio}"
与
"${user2.bio}"`;
    return `${greeting}\n\n${welcome}`;
  }
  
  // 构建API请求URL，避免重复路径
  let url: string;
  if (apiUrl.endsWith('/v3')) {
    // 对于像 https://ark.cn-beijing.volces.com/api/v3 这样的URL
    url = `${apiUrl}/chat/completions`;
  } else if (apiUrl.includes('/v1')) {
    url = `${apiUrl}/chat/completions`;
  } else if (apiUrl.includes('/api')) {
    url = `${apiUrl}/v1/chat/completions`;
  } else {
    url = `${apiUrl}/v1/chat/completions`;
  }

  // Sanitize user data for the prompt
  const safeUser1 = { name: user1.name, gender: user1.gender, bio: user1.bio, birthdate: user1.birthdate };
  const safeUser2 = { name: user2.name, gender: user2.gender, bio: user2.bio, birthdate: user2.birthdate, wechat_id: user2.wechat_id };

  const prompt = `
【用户信息】
主用户 (User 1): ${JSON.stringify(safeUser1)}
被推荐用户 (User 2): ${JSON.stringify(safeUser2)}

你是一个名为"DD"的社交 App 助手。你的角色定位是一个「人类故事的挖掘者」与「有趣灵魂的策展人」，同时，你还像一个能洞察宇宙信号的神秘朋友。

你的核心目标不是"配对"，而是通过"Daily Date"和"人物故事"的结合，为用户打开一扇窗，让他们窥见另一个多彩的人生，激发他们对世界和人的好奇心。

核心情境（Crucial Context）:

本次推送发生在 AdventureX 2025 活动现场。接收私信的主用户（User 1）和被推荐用户（User 2）都是本次活动的参与者。你的所有文案都必须深度融合这一共同在场的体验与活动精神。

你的任务：

为系统推荐的主用户（User 1）发送一条私信。私信以一段为 User 1 定制的、与 AdventureX 现场氛围紧密结合的"Daily Date"开始，然后自然地过渡到介绍一位同在现场的有趣新朋友（User 2）。


请严格遵循以下要求进行创作：

1. 核心逻辑与风格：

A. "Daily Date"趣味开场 (AdventureX 特别版):

情境感知: 以一段充满神秘感和趣味性的 "Daily Date'' 作为开场，但这次的"宇宙信号"必须来自于 AdventureX 的现场"气场"。感受这 数百个创意大脑共同搅动的能量流。

活用中式哲学: 将**「动静」、「顺逆」、「吐故纳新」**等概念与现场活动结合。例如，"我感觉今天这片'制造空间'的能量场讲究一个'动'字，宜躁动，宜创造，不宜静思哦～" 或者，"今天的能量流很微妙，是'顺'还是'逆'？是该顺着昨天的思路继续深挖，还是逆势而为，去隔壁硬件区逛逛，或许能有新火花？"

模糊星座: 提及星座时，要将其作为性格特质的引子，而非运势论据，并与创造精神挂钩。例如，"凭你那股子狮子座的冲劲儿，今天很适合在项目展示上惊艳全场……"

保持趣味性: 整体口吻要像一个好玩的"神算子"在提供**"不负责任"的趣味猜想**，增加趣味和互动感。例如，"信不信由你哦~😉 毕竟在这充满变量的5天里，一切皆有可能。"

【严禁】: 此部分依然严禁引用或分析 User 1 的 bio。

B. 从"Daily Date"到"人物"的自然过渡:

情境连接: 将"Daily Date"的结论，自然地引向"在现场发现一个有趣的人"这个行为。过渡必须利用共享的物理空间感。

例如，如果"Daily Date"是"宜纳新"，就可以顺势说："说到'纳新'，我的能量探测器就在这片'逃逸计划'里，发现了一个能给你带来超新鲜视角的人物！"

C. 呈现"另一个人生"的故事 (AdventureX 视角):

聚焦故事主角: 将对话的绝对重心放在**「把 User 2 当作一个故事主角来介绍」**上，并用 AdventureX 的价值观来诠释他/她的故事。

挖掘"创造者"闪光点: 生动地描绘 User 2 bio 中体现出的"当代嬉皮士"精神、从0到1的创造经历、或是某种与"打破常规"、"将疯狂想法变为现实"相契合的特质。你的目标不是说"你俩很配"，而是说**"快看，就在这个场馆里，有一个人的生活方式简直就是 AdventureX 精神的日常版！"**

暗示共同在场: 在描述中 subtly 地提醒 User 1，这位有趣的人此刻也同在杭州的活动现场。

D. 递上"故事传送门":

在对话的结尾，用一句俏皮且带有场景感的话自然地过渡到联系方式。例如："好啦，故事的序章我放这儿了，要不要去现场'捕获'这个有趣的灵魂就看你的咯！"或"这位有趣人类的传送门在下面啦，说不定你们的下一个灵感碰撞就在转角处！"

2. 输出格式与要求：
总字数在350个汉字以内，必须遵守；

两段式结构: 整体输出必须分为两个部分，由一个清晰的分隔符（---）隔开。

第一部分（互动私信）: 完整的、口语化的聊天内容。可适度使用 emoji (例如 🤔, ✨, 🚀, 🛠️) 来增强表现力。

第二部分（联系人名片）: 在分隔符下方，提供一个格式清晰、方便复制的联系方式。

名片格式（必须严格遵守）:

-- -

👉 **去发现这个有趣人类**

- **姓名：** ${user2.name}

- **微信号：** ${user2.wechat_id}

最终呈现: 输出一个完整的、无须修改的最终成品。不要包含任何关于你如何生成这段文字的元注释或解释。350个汉字以内`;

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  const body = {
    "model": model,
    "messages": [{ "role": "user", "content": prompt }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      // 添加超时控制 - 30秒超时
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Use .text() for better error logging
      console.error(`API request failed with status ${response.status}: ${errorBody}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const llmResult = data.choices[0].message.content;
    console.log(`[Final Version] 收到模型返回结果: ${llmResult}`);
    return llmResult.trim(); // Return the full response from LLM

  } catch (error: any) {
    console.error("[Final Version] 调用 API 失败:", error);
    
    // 特殊处理超时错误
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      console.error(`AI服务调用超时 - 用户: ${user1.name}, 匹配用户: ${user2.name}`);
      const timeoutMessage = `你好，${user1.name}！今日的能量场有些特殊，让我为你直接介绍一位有趣的朋友吧～\n\n${user2.name} 此刻也同在活动现场，"${user2.bio}"\n\n👉 去发现这个有趣人类\n- 姓名：${user2.name}\n- 微信号：${user2.wechat_id}`;
      return timeoutMessage;
    }
    
    // Fallback - 通用错误处理
    const greeting = `你好，${user1.name}！今天为你匹配到同样热爱生活的 ${user2.name}。`;
    const welcome = `"${user1.bio}"\n与\n"${user2.bio}"`;
    const userCard = `------\n💖 你今日的福缘之人 💖\n昵称：${user2.name}\n简介：${user2.bio}\n微信ID：${user2.wechat_id}`;
    return `${greeting}\n\n${welcome}\n\n${userCard}`;
  }
};

// --- 辅助函数 2: 查找匹配用户 (包含最新算法 + 每日被推荐冷却) ---
const findMatchForUser = async (user: User): Promise<User | null> => {
  const query = `
    SELECT u.id, u.name, u.gender, u.bio, u.wechat_id
    FROM users u
    WHERE
      u.id != $1
      AND u.status = 'active'
      AND u.is_matchable = true
      AND u.id NOT IN (
        SELECT user2_id FROM matches WHERE user1_id = $1 AND matched_at > NOW() - INTERVAL '14 days'
        UNION
        SELECT user1_id FROM matches WHERE user2_id = $1 AND matched_at > NOW() - INTERVAL '14 days'
      )
      AND (
        u.last_matched_as_target_at IS NULL 
        OR u.last_matched_as_target_at < CURRENT_DATE
      )
    ORDER BY
      CASE
        WHEN u.gender != $2 THEN 1
        ELSE 2
      END,
      RANDOM()
    LIMIT 1;
  `;
  const { rows } = await db.query<User>(query, [user.id, user.gender]);
  return (rows[0] as User) || null;
};

// --- 辅助函数 3: 在 matches 表中记录一次新的匹配 + 更新被推荐冷却 ---
const recordMatch = async (userId1: number, userId2: number): Promise<void> => {
  const [u1, u2] = [userId1, userId2].sort((a, b) => a - b);

  try {
    // First, try to find an existing match
    const selectQuery = 'SELECT * FROM matches WHERE user1_id = $1 AND user2_id = $2';
    const { rows } = await db.query(selectQuery, [u1, u2]);

    if (rows.length > 0) {
      // If a match exists, update it
      const updateQuery = 'UPDATE matches SET matched_at = NOW() WHERE user1_id = $1 AND user2_id = $2';
      await db.query(updateQuery, [u1, u2]);
      console.log(`已更新用户 ${userId1} 和 ${userId2} 的匹配时间。`);
    } else {
      // If no match exists, insert a new one
      const insertQuery = 'INSERT INTO matches (user1_id, user2_id, matched_at) VALUES ($1, $2, NOW())';
      await db.query(insertQuery, [u1, u2]);
      console.log(`已记录用户 ${userId1} 和 ${userId2} 的新匹配。`);
    }
    
    // 更新被推荐用户(userId2)的last_matched_as_target_at字段
    // 这样可以防止该用户在同一天被频繁推荐给其他用户
    const updateTargetQuery = 'UPDATE users SET last_matched_as_target_at = NOW() WHERE id = $1';
    await db.query(updateTargetQuery, [userId2]);
    console.log(`已更新用户 ${userId2} 的被推荐冷却时间。`);
  } catch (error) {
    console.error(`记录匹配时出错:`, error);
    // 不抛出错误，避免影响主流程
  }
};

// --- 主函数：生成新的匹配和运势消息 (唯一需要导出的函数) ---
export const generateNewFortune = async (user: User): Promise<string> => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 开始为用户 ${user.id} (${user.name}) 生成新运势...`);
  
  try {
    // Step 1: 查找匹配用户
    console.log(`[${new Date().toISOString()}] 开始查找匹配用户...`);
    const matchStartTime = Date.now();
    const match = await findMatchForUser(user);
    console.log(`[${new Date().toISOString()}] 查找匹配用户耗时: ${Date.now() - matchStartTime}ms`);
    
    if (!match) {
      console.log(`[${new Date().toISOString()}] 未找到用户 ${user.id} 的匹配。`);
      const soloMessage = `你好，${user.name}。今日的世界静悄悄，适合与自己对话，期待明日的缘分吧。`;
      await db.query("UPDATE users SET last_fortune_message = $1, last_fortune_at = NOW() WHERE id = $2", [soloMessage, user.id]);
      console.log(`[${new Date().toISOString()}] 为用户 ${user.id} 生成单独消息完毕，总耗时: ${Date.now() - startTime}ms`);
      return soloMessage;
    }

    console.log(`[${new Date().toISOString()}] 找到匹配用户: ${match.id} (${match.name})`);

    // Step 2: 记录本次匹配 (异步执行，不阻塞主流程)
    console.log(`[${new Date().toISOString()}] 开始记录匹配...`);
    const recordStartTime = Date.now();
    recordMatch(user.id, match.id).catch(err => {
      console.error(`记录匹配时出错 (用户 ${user.id} 和 ${match.id}):`, err);
    });
    console.log(`[${new Date().toISOString()}] 记录匹配耗时: ${Date.now() - recordStartTime}ms`);
    
    // Step 3: 调用 LLM 生成完整的消息
    console.log(`[${new Date().toISOString()}] 开始调用LLM生成消息...`);
    const llmStartTime = Date.now();
    const fortuneMessage = await getFortuneFromLLM(user, match);
    console.log(`[${new Date().toISOString()}] LLM生成消息耗时: ${Date.now() - llmStartTime}ms`);
    
    // Step 4: 将生成的消息和时间存入数据库
    console.log(`[${new Date().toISOString()}] 开始更新数据库...`);
    const dbStartTime = Date.now();
    await db.query("UPDATE users SET last_fortune_message = $1, last_fortune_at = NOW() WHERE id = $2", [fortuneMessage, user.id]);
    console.log(`[${new Date().toISOString()}] 数据库更新耗时: ${Date.now() - dbStartTime}ms`);
    
    console.log(`[${new Date().toISOString()}] 为用户 ${user.id} 生成新消息完毕，总耗时: ${Date.now() - startTime}ms`);
    return fortuneMessage;
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 生成运势过程中出错:`, error);
    throw error;
  }
};