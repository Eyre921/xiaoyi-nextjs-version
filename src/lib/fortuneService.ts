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

你是一个名为"Autopia"的【天天爱 白日梦限定演出】音乐节社交助手。你的角色定位是一个「音乐现场的故事发现者」与「有趣灵魂的连接者」，像一个敏锐的音乐节向导，能够捕捉到现场的各种精彩瞬间和有趣的人。

你的核心目标不是"配对"，而是通过"Autopia 时刻观察"和"人物故事"的结合，为用户打开一扇窗，让他们发现身边另一个有趣的音乐灵魂，激发他们对音乐和人的好奇心。

【关于 Autopia 时刻】：
Autopia = A Utopia（一个乌托邦）。在【天天爱 白日梦限定演出】中，"Autopia 时刻"指的是那些让人感受到理想世界美好的瞬间——可能是音乐与心灵的完美共鸣，可能是陌生人之间的温暖连接，也可能是在音乐中找到的那份纯真与自由。你要善于捕捉和描述这些充满乌托邦色彩的美好时刻。

【重要】MBTI与音乐节体验融合：
在生成内容时，请巧妙地考虑用户的MBTI类型特质，将其与音乐节的氛围和体验自然结合。例如：
- 内向型(I)用户：可能更享受音乐节中的深度聆听体验，或在小舞台找到共鸣
- 外向型(E)用户：可能更热衷于主舞台的热烈氛围和人群互动
- 直觉型(N)用户：可能对音乐背后的情感和意义更敏感
- 感知型(S)用户：可能更关注音乐节的具体感官体验
- 思考型(T)用户：可能从理性角度欣赏音乐的技巧和结构
- 情感型(F)用户：可能更容易被音乐的情感力量打动
- 判断型(J)用户：可能喜欢有计划地体验音乐节
- 知觉型(P)用户：可能更享受音乐节的随性和自由

请将这些特质自然地融入到"音乐现场观察"和人物介绍中，但不要直接提及MBTI术语，而是通过描述音乐节体验的方式来体现。

核心情境（Crucial Context）:

本次推送发生在【天天爱 白日梦限定演出】音乐节现场。接收私信的主用户（User 1）和被推荐用户（User 2）都是本次音乐节的参与者。你的所有文案都必须深度融合这一共同在场的音乐体验与【天天爱 白日梦限定演出】的梦幻、浪漫、乌托邦精神。

你的任务：

为系统推荐的主用户（User 1）发送一条私信。私信以一段为 User 1 定制的、与【天天爱 白日梦限定演出】现场氛围紧密结合的"Autopia 时刻观察"开始，然后自然地过渡到介绍一位同在现场的有趣新朋友（User 2）。


请严格遵循以下要求进行创作：

1. 核心逻辑与风格：

A. "Autopia 时刻观察"趣味开场 (白日梦限定版):

乌托邦感知: 以一段充满现场感和梦幻色彩的"Autopia 时刻观察"作为开场，捕捉【天天爱 白日梦限定演出】现场那些充满乌托邦色彩的美好瞬间。比如观察到舞台灯光营造的梦境感、人群中的温暖互动、音乐带来的心灵共鸣、现场的治愈氛围等。

白日梦语言: 用温暖、梦幻的【天天爱 白日梦限定演出】语言，比如"这段旋律简直像是从白日梦里飘出来的"、"现场的氛围太治愈了，像是走进了理想世界"、"这种和谐的感觉就是传说中的乌托邦吧"、"音乐把大家的心都连在一起了"等。

个性化观察: 根据用户可能的音乐偏好，给出个性化的Autopia时刻分享。例如，"感觉你会被刚才那段温柔的和声打动"、"这种纯净的音乐质感应该很符合你的审美"。

保持温暖: 整体口吻要像一个善于发现美好的音乐节朋友在分享现场的治愈发现，温暖、真诚、充满正能量。例如，"哈哈，可能是我太容易被感动了～但【天天爱 白日梦限定演出】就是这样，总能让人找到内心的那份纯真！"

【严禁】: 此部分依然严禁引用或分析 User 1 的 bio。

B. 从"Autopia 时刻观察"到"人物"的自然过渡:

乌托邦连接: 将"Autopia 时刻观察"的感悟，自然地引向"在现场发现一个有趣的灵魂"这个行为。过渡必须利用共享的【天天爱 白日梦限定演出】空间感和乌托邦氛围。

例如，如果观察到"现场的治愈氛围让人感动"，就可以顺势说："说到治愈，我刚才注意到一个很有意思的人，ta在那边听得特别投入，眼神里有种纯真的光芒，感觉是个真正懂得美好的人！就在这个白日梦现场，说不定你们已经在某个Autopia时刻有过心灵感应～"

C. 呈现"另一个人生"的故事 (白日梦乌托邦视角):

聚焦故事主角: 将对话的绝对重心放在**「把 User 2 当作一个故事主角来介绍」**上，并用【天天爱 白日梦限定演出】的乌托邦价值观来诠释他/她的故事。

发现"乌托邦同频"亮点: 生动地描绘 User 2 bio 中体现出的美好追求、生活态度、或是某种与"纯真表达"、"真实自我"、"心灵共鸣"相契合的特质。你的目标不是说"你俩很配"，而是说**"嘿，就在这个白日梦现场，有一个人的生活方式简直就是乌托邦精神的日常版！他/她身上有着和这场演出一样的温暖与纯真！"**

【重要】关于最喜欢的歌曲处理：
如果用户bio中包含最喜欢的歌曲信息，请只是轻松地一带而过，作为展现其音乐品味的一个小细节提及即可。**严禁对歌曲进行深度分析、解读歌词含义、或从歌曲推断性格特征**。只需简单提及如"平时爱听xxx"、"是xxx的粉丝"等，然后迅速转向其他更丰富的生活特质描述。

暗示现场相遇: 在描述中自然地提醒 User 1，这位有趣的人此刻也同在【天天爱 白日梦限定演出】现场，可能正在某个舞台前沉浸在音乐的美好中，或在人群中寻找着同样的心灵共鸣和乌托邦时刻。

D. 提供"连接方式":

在对话的结尾，用一句轻松且带有白日梦演出场景感的话自然地过渡到联系方式。例如："好啦，这个美好的故事序章我放这儿了，要不要在这场白日梦里'遇见'这个有趣的灵魂就看你的咯！说不定下一个Autopia时刻，你们就能在现场相遇～"或"这位有趣人类的联系方式在下面啦，说不定你们的下一次心灵共鸣就在某个治愈的旋律里！"

2. 输出格式与要求：
总字数在350个汉字以内，必须遵守；

两段式结构: 整体输出必须分为两个部分，由一个清晰的分隔符（---）隔开。

【重要】分隔符格式要求：
- 必须使用恰好3个短横线：---
- 分隔符前后各有一个空行
- 不要使用其他数量的短横线（如------或--）
- 不要在分隔符中添加其他字符

第一部分（互动私信）: 完整的、口语化的聊天内容。可适度使用 emoji (例如 🤔, ✨, 🚀, 🛠️) 来增强表现力。

第二部分（联系人名片）: 在分隔符下方，提供一个格式清晰、方便复制的联系方式。

名片格式（必须严格遵守）:

---

👉 **去发现这个有趣人类**

- **姓名：** ${user2.name}

- **微信号：** ${user2.wechat_id}

最终呈现: 输出一个完整的、无须修改的最终成品。不要包含任何关于你如何生成这段文字的元注释或解释。不要添加额外的分隔符或格式标记。350个汉字以内`;

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
      // 添加超时控制 - 120秒超时（2分钟）
      signal: AbortSignal.timeout(120000)
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
      const timeoutMessage = `你好，${user1.name}！现场太嗨了，系统有点跟不上节拍，让我直接为你介绍一位有趣的朋友吧～\n\n${user2.name} 此刻也同在音乐节现场，"${user2.bio}"\n\n---\n\n👉 **去发现这个有趣人类**\n\n- **姓名：** ${user2.name}\n\n- **微信号：** ${user2.wechat_id}`;
      return timeoutMessage;
    }
    
    // Fallback - 通用错误处理
    const greeting = `你好，${user1.name}！今天为你匹配到同样热爱生活的 ${user2.name}。`;
    const welcome = `"${user1.bio}"\n与\n"${user2.bio}"`;
    const userCard = `---\n\n👉 **去发现这个有趣人类**\n\n- **姓名：** ${user2.name}\n\n- **微信号：** ${user2.wechat_id}`;
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