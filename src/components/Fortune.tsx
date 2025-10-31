// 文件路径: src/components/Fortune.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Zap, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// 装饰元素组件
const FloatingDecorations: React.FC = () => {
  const [decorations, setDecorations] = useState<Array<{
    id: number;
    type: string;
    left: number;
    top: number;
    delay: number;
    duration: number;
    size: number;
  }>>([]);

  useEffect(() => {
    // 在客户端生成随机装饰元素
    const newDecorations = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      type: i % 2 === 0 ? 'heart' : 'star',
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      size: 12 + Math.random() * 8
    }));
    setDecorations(newDecorations);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {decorations.map((decoration) => (
        <div
          key={decoration.id}
          className="absolute animate-pulse"
          style={{
            left: `${decoration.left}%`,
            top: `${decoration.top}%`,
            animationDelay: `${decoration.delay}s`,
            animationDuration: `${decoration.duration}s`
          }}
        >
          {decoration.type === 'heart' ? (
            <Heart 
              size={decoration.size} 
              className="text-white/30 fill-white/20" 
            />
          ) : (
            <Star 
              size={decoration.size} 
              className="text-white/30 fill-white/20" 
            />
          )}
        </div>
      ))}
    </div>
  );
};

// 解析运势内容的函数
const parseFortuneContent = (text: string) => {
    // 首先尝试使用标准分隔符 ---，提取到最后一个分隔符
    const standardParts = text.split('---');
    if (standardParts.length >= 2) {
        // 找到最后一个分隔符的位置，前面的都是运势内容，后面的是联系信息
        const lastSeparatorIndex = text.lastIndexOf('---');
        const fortuneText = text.substring(0, lastSeparatorIndex).trim();
        const contactInfo = text.substring(lastSeparatorIndex + 3).trim(); // +3 是因为 '---' 长度为3
        
        return {
            fortuneText: fortuneText || '',
            contactInfo: contactInfo || ''
        };
    }
    
    // 如果没有标准分隔符，尝试智能识别联系人信息
    // 查找包含"去发现这个有趣人类"、"姓名"、"微信号"等关键词的部分
    const contactPatterns = [
        /👉\s*去发现这个有趣人类[\s\S]*$/,
        /👉\s*.*?人类[\s\S]*$/,
        /姓名[：:]\s*[\s\S]*$/,
        /微信号[：:]\s*[\s\S]*$/,
        /联系方式[\s\S]*$/
    ];
    
    for (const pattern of contactPatterns) {
        const match = text.match(pattern);
        if (match) {
            const contactStart = match.index!;
            const fortuneText = text.substring(0, contactStart).trim();
            const contactInfo = text.substring(contactStart).trim();
            
            // 确保运势文本不为空
            if (fortuneText.length > 0) {
                return {
                    fortuneText,
                    contactInfo
                };
            }
        }
    }
    
    // 如果都没有匹配到，返回原始文本
    return {
        fortuneText: text,
        contactInfo: null
    };
};

// 提取微信号的函数
const extractWechatId = (contactInfo: string) => {
    // 匹配多种可能的微信号格式
    const patterns = [
        /\*\*微信号[：:]\*\*\s*([^\s\n]+)/,  // **微信号：** format
        /微信号[：:]\s*([^\s\n]+)/,          // 微信号： format
        /微信ID[：:]\s*([^\s\n]+)/,          // 微信ID： format
        /WeChat[：:]\s*([^\s\n]+)/i          // WeChat： format (case insensitive)
    ];
    
    for (const pattern of patterns) {
        const match = contactInfo.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return null;
};

// DD头像组件
const DDAvatar: React.FC = () => (
    <div className="relative flex-shrink-0">
        {/* 呼吸光晕背景层 */}
        <motion.div
            className="absolute inset-0 w-12 h-12 rounded-full"
            style={{
                background: 'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)',
                filter: 'blur(8px)',
            }}
            animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 0.9, 0.6],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
        
        {/* 第二层光晕 */}
        <motion.div
            className="absolute inset-0 w-12 h-12 rounded-full"
            style={{
                background: 'radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 80%)',
                filter: 'blur(4px)',
            }}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
            }}
        />
        
        {/* 头像主体 */}
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg border border-white/20"
            style={{
                boxShadow: '0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)'
            }}
        >
            <div className="w-10 h-10 flex items-center justify-center">
                <img 
                    src="/avatar.svg" 
                    alt="DD Avatar" 
                    className="w-full h-full object-contain"
                />
            </div>
        </motion.div>
    </div>
);

// 聊天气泡组件
const ChatBubble: React.FC<{ children: React.ReactNode; isUser?: boolean }> = ({ children, isUser = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
        {!isUser && <DDAvatar />}
        <div className={`max-w-[85%] ${isUser ? 'bg-blue-500/30 backdrop-blur-sm text-white border border-blue-400/30' : 'bg-white/20 backdrop-blur-xl border border-white/30 text-white'} rounded-2xl px-4 py-3 shadow-sm`}>
            {children}
        </div>
    </motion.div>
);

// 微信号复制组件
const WechatCopyButton: React.FC<{ wechatId: string }> = ({ wechatId }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            // 首先尝试使用现代的 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(wechatId);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                return;
            }
            
            // 备用方法：使用传统的 document.execCommand
            const textArea = document.createElement('textarea');
            textArea.value = wechatId;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                throw new Error('复制命令执行失败');
            }
        } catch (err) {
            console.error('复制失败:', err);
            // 如果复制失败，至少选中文本让用户手动复制
            alert(`复制失败，请手动复制微信号：${wechatId}`);
        }
    };

    return (
        <motion.button
            onClick={handleCopy}
            className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                animate={copied ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
            </motion.div>
            <span>{copied ? '已复制' : '复制微信号'}</span>
        </motion.button>
    );
};

// 现代化浮动装饰元素
const FloatingIcon: React.FC<{ icon: React.ReactNode; delay: number; x: string; y: string }> = ({ icon, delay, x, y }) => (
    <motion.div
        className={`absolute ${x} ${y} text-gray-300/60`}
        initial={{ opacity: 0, scale: 0, rotate: 0 }}
        animate={{ 
            opacity: [0.3, 0.8, 0.3], 
            scale: [0.8, 1.2, 0.8], 
            rotate: [0, 180, 360],
            y: [-10, 10, -10]
        }}
        transition={{ 
            duration: 6, 
            delay, 
            repeat: Infinity, 
            repeatDelay: 3,
            ease: "easeInOut"
        }}
    >
        {icon}
    </motion.div>
);

// 流式文字显示组件
const StreamingText: React.FC<{ text: string; speed?: number; onComplete?: () => void }> = ({ 
    text, 
    speed = 50, 
    onComplete 
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isStreaming, setIsStreaming] = useState(false);
    const [lastText, setLastText] = useState('');

    useEffect(() => {
        // 只有当文本真正改变且不为空时才重置
        if (text && text !== lastText && text.trim() !== '') {
            setDisplayedText('');
            setCurrentIndex(0);
            setIsStreaming(true);
            setLastText(text);
        }
    }, [text, lastText]);

    useEffect(() => {
        if (isStreaming && currentIndex < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timer);
        } else if (isStreaming && currentIndex === text.length) {
            setIsStreaming(false);
            if (onComplete) {
                onComplete();
            }
        }
        // 添加空的返回语句以满足所有代码路径
        return undefined;
    }, [currentIndex, text, speed, onComplete, isStreaming]);

    return (
        <div className="text-white text-sm leading-relaxed">
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic text-white/90">{children}</em>,
                }}
            >
                {displayedText}
            </ReactMarkdown>
            {currentIndex < text.length && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-2 h-4 bg-white ml-1"
                />
            )}
        </div>
    );
};

// 现代化运势卡片 - 改为聊天形式
const FortuneCard: React.FC<{ text: string; isLoading?: boolean; isWaiting?: boolean }> = ({ 
    text, 
    isLoading = false, 
    isWaiting = false 
}) => {
    const [showContactInfo, setShowContactInfo] = useState(false);
    const [streamingComplete, setStreamingComplete] = useState(false);
    const [processedText, setProcessedText] = useState('');

    // 解析运势内容
// 移除未使用的变量声明

    // 只有当文本真正改变时才更新processedText
    useEffect(() => {
        if (text && text.trim() !== '' && text !== processedText) {
            setProcessedText(text);
            setStreamingComplete(false);
            setShowContactInfo(false);
        }
    }, [text, processedText]);

    useEffect(() => {
        if (streamingComplete && parseFortuneContent(processedText).contactInfo) {
            // 延迟显示联系人信息
            setTimeout(() => setShowContactInfo(true), 2000);
        }
    }, [processedText, streamingComplete]);

    if (isLoading || isWaiting) {
        return (
            <ChatBubble>
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full"
                    />
                    <span className="text-white/80">
                        {isWaiting ? '正在生成Autopia 时刻....' : '正在为您生成专属运势...'}
                    </span>
                </div>
            </ChatBubble>
        );
    }

    return (
        <div className="space-y-4">
            {/* 运势内容 */}
            <ChatBubble>
                <StreamingText 
                    text={parseFortuneContent(processedText).fortuneText} 
                    speed={30}
                    onComplete={() => setStreamingComplete(true)}
                />
            </ChatBubble>

            {/* 联系人信息 */}
            <AnimatePresence>
                {showContactInfo && parseFortuneContent(processedText).contactInfo && (
                    <ChatBubble>
                        <div>
                            <div className="space-y-3">
                                <div className="p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg">
                                    <div className="prose prose-sm max-w-none text-white mb-3">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                            }}
                                        >
                                            {parseFortuneContent(processedText).contactInfo}
                                        </ReactMarkdown>
                                    </div>
                                    
                                    {/* 微信号复制按钮 */}
                                    {extractWechatId(parseFortuneContent(processedText).contactInfo || '') && (
                                        <div className="flex justify-center">
                                            <WechatCopyButton wechatId={extractWechatId(parseFortuneContent(processedText).contactInfo || '') || ''} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ChatBubble>
                )}
            </AnimatePresence>
        </div>
    );
};

// 底部交互区域
const InteractionArea: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <motion.div
            className="relative"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <motion.div
                className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 text-center shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex items-center justify-center space-x-2">
                    <motion.div
                        animate={isHovered ? { scale: 1.2, rotate: 15 } : { scale: 1, rotate: 0 }}
                        className="text-white/80"
                    >
                        <Heart size={20} />
                    </motion.div>
                    <span className="text-white font-medium">与 天天组合 的AI聊天对话功能即将上线</span>
                    <motion.div
                        animate={isHovered ? { scale: 1.2, rotate: -15 } : { scale: 1, rotate: 0 }}
                        className="text-white/80"
                    >
                        <Zap size={20} />
                    </motion.div>
                </div>
                <motion.div
                    className="text-xs text-white/60 mt-1"
                    animate={isHovered ? { opacity: 1 } : { opacity: 0.7 }}
                >
                    敬请期待～～
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

interface FortuneData {
  message?: string | null;
  action?: string;
}

interface FortunePageProps {
  nfcuid: string | null;
  data?: FortuneData | null;
  isLoading?: boolean;
  error?: string | null;
  refetch?: () => void;
}

const FortunePage: React.FC<FortunePageProps> = ({ data, isLoading, error, refetch }) => {

    return (
        <div className="min-h-screen bg-black relative" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {/* 固定背景层，使用流动的CSS渐变背景 */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.4) 0%, transparent 60%),
                        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.4) 0%, transparent 60%),
                        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 60%),
                        linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%)
                    `,
                    backgroundSize: '400% 400%',
                    backgroundAttachment: 'fixed',
                    animation: 'flowingBackground 15s ease-in-out infinite'
                }}
            />

            {/* 交错的多行 Autopia 玻璃拟态字样背景 */}
            <div className="fixed inset-0 z-1 pointer-events-none overflow-hidden">
                {/* 最上面一行 */}
                <motion.div 
                    className="absolute top-8 left-0 w-full flex justify-start"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'linear', delay: 2 }}
                >
                    <div 
                        className="text-5xl sm:text-6xl font-bold text-white/5 select-none whitespace-nowrap transform rotate-1"
                        style={{
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            textShadow: '0 0 20px rgba(255, 255, 255, 0.06)',
                            backdropFilter: 'blur(1px)',
                            WebkitBackdropFilter: 'blur(1px)',
                            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        AUTOPIA AUTOPIA AUTOPIA AUTOPIA AUTOPIA
                    </div>
                </motion.div>

                {/* 第一行 */}
                <motion.div 
                    className="absolute top-1/4 left-0 w-full flex justify-start"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                    <div 
                        className="text-6xl sm:text-7xl font-bold text-white/8 select-none whitespace-nowrap"
                        style={{
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            textShadow: '0 0 30px rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(1px)',
                            WebkitBackdropFilter: 'blur(1px)',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                         天天爱音乐节 天天爱音乐节 天天爱音乐节 天天爱音乐节
                     </div>
                </motion.div>

                {/* 第二行 */}
                <motion.div 
                    className="absolute top-1/2 left-0 w-full flex justify-end"
                    initial={{ x: '100%' }}
                    animate={{ x: '-100%' }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                >
                    <div 
                        className="text-5xl sm:text-6xl font-bold text-white/6 select-none whitespace-nowrap transform rotate-3"
                        style={{
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            textShadow: '0 0 25px rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(1px)',
                            WebkitBackdropFilter: 'blur(1px)',
                            background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.04) 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        MUSIC FESTIVAL MUSIC FESTIVAL
                    </div>
                </motion.div>

                {/* 第三行 */}
                <motion.div 
                    className="absolute top-3/4 left-0 w-full flex justify-start"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear', delay: 5 }}
                >
                    <div 
                        className="text-7xl sm:text-8xl font-bold text-white/7 select-none whitespace-nowrap transform -rotate-2"
                        style={{
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            textShadow: '0 0 35px rgba(255, 255, 255, 0.12)',
                            backdropFilter: 'blur(1px)',
                            WebkitBackdropFilter: 'blur(1px)',
                            background: 'linear-gradient(225deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.07) 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        AUTOPIA AUTOPIA AUTOPIA
                    </div>
                </motion.div>

                {/* 最下面一行 */}
                <motion.div 
                    className="absolute bottom-8 left-0 w-full flex justify-end"
                    initial={{ x: '100%' }}
                    animate={{ x: '-100%' }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'linear', delay: 8 }}
                >
                    <div 
                        className="text-6xl sm:text-7xl font-bold text-white/6 select-none whitespace-nowrap transform -rotate-1"
                        style={{
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            textShadow: '0 0 25px rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(1px)',
                            WebkitBackdropFilter: 'blur(1px)',
                            background: 'linear-gradient(270deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        AUTOPIA AUTOPIA AUTOPIA AUTOPIA
                    </div>
                </motion.div>
            </div>

            {/* 流动的音乐节emoji */}
            <div className="fixed inset-0 z-2 pointer-events-none overflow-hidden">
                {/* 音符 */}
                <motion.div 
                    className="absolute text-4xl opacity-20"
                    initial={{ left: '-10%', top: '20%' }}
                    animate={{ left: '110%', top: '80%' }}
                    transition={{ duration: 35, repeat: Infinity, ease: 'linear', delay: 0 }}
                >
                    🎵
                </motion.div>

                {/* 麦克风 */}
                <motion.div 
                    className="absolute text-3xl opacity-15"
                    initial={{ right: '-10%', top: '60%' }}
                    animate={{ right: '110%', top: '30%' }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear', delay: 10 }}
                >
                    🎤
                </motion.div>

                {/* 吉他 */}
                <motion.div 
                    className="absolute text-3xl opacity-18"
                    initial={{ left: '-10%', bottom: '30%' }}
                    animate={{ left: '110%', bottom: '60%' }}
                    transition={{ duration: 45, repeat: Infinity, ease: 'linear', delay: 20 }}
                >
                    🎸
                </motion.div>

                {/* 星星 */}
                <motion.div 
                    className="absolute text-2xl opacity-12"
                    initial={{ right: '-10%', top: '25%' }}
                    animate={{ right: '110%', bottom: '25%' }}
                    transition={{ duration: 38, repeat: Infinity, ease: 'linear', delay: 15 }}
                >
                    ⭐
                </motion.div>

                {/* 鲜花 - 玫瑰 */}
                <motion.div 
                    className="absolute text-3xl opacity-16 drop-shadow-[0_0_8px_rgba(255,182,193,0.6)]"
                    initial={{ left: '-10%', top: '45%' }}
                    animate={{ left: '110%', top: '15%' }}
                    transition={{ duration: 42, repeat: Infinity, ease: 'linear', delay: 5 }}
                >
                    🌹
                </motion.div>

                {/* 水晶 */}
                <motion.div 
                    className="absolute text-2xl opacity-14 drop-shadow-[0_0_10px_rgba(147,197,253,0.7)]"
                    initial={{ right: '-10%', bottom: '40%' }}
                    animate={{ right: '110%', bottom: '70%' }}
                    transition={{ duration: 50, repeat: Infinity, ease: 'linear', delay: 25 }}
                >
                    💎
                </motion.div>

                {/* 手链 */}
                <motion.div 
                    className="absolute text-2xl opacity-13 drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]"
                    initial={{ left: '-10%', bottom: '20%' }}
                    animate={{ left: '110%', bottom: '50%' }}
                    transition={{ duration: 36, repeat: Infinity, ease: 'linear', delay: 30 }}
                >
                    📿
                </motion.div>

                {/* 樱花 */}
                <motion.div 
                    className="absolute text-3xl opacity-15 drop-shadow-[0_0_8px_rgba(255,192,203,0.6)]"
                    initial={{ right: '-10%', top: '80%' }}
                    animate={{ right: '110%', top: '50%' }}
                    transition={{ duration: 44, repeat: Infinity, ease: 'linear', delay: 8 }}
                >
                    🌸
                </motion.div>

                {/* 音乐符号 */}
                <motion.div 
                    className="absolute text-2xl opacity-17 drop-shadow-[0_0_6px_rgba(138,43,226,0.5)]"
                    initial={{ left: '-10%', top: '65%' }}
                    animate={{ left: '110%', top: '35%' }}
                    transition={{ duration: 39, repeat: Infinity, ease: 'linear', delay: 18 }}
                >
                    🎶
                </motion.div>

                {/* 向日葵 */}
                <motion.div 
                    className="absolute text-3xl opacity-16 drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]"
                    initial={{ right: '-10%', top: '15%' }}
                    animate={{ right: '110%', top: '85%' }}
                    transition={{ duration: 48, repeat: Infinity, ease: 'linear', delay: 12 }}
                >
                    🌻
                </motion.div>

                {/* 宝石戒指 */}
                <motion.div 
                    className="absolute text-2xl opacity-14 drop-shadow-[0_0_8px_rgba(255,20,147,0.6)]"
                    initial={{ left: '-10%', top: '10%' }}
                    animate={{ left: '110%', top: '90%' }}
                    transition={{ duration: 41, repeat: Infinity, ease: 'linear', delay: 22 }}
                >
                    💍
                </motion.div>

                {/* 耳机 */}
                <motion.div 
                    className="absolute text-3xl opacity-15 drop-shadow-[0_0_6px_rgba(0,191,255,0.5)]"
                    initial={{ right: '-10%', bottom: '15%' }}
                    animate={{ right: '110%', bottom: '85%' }}
                    transition={{ duration: 37, repeat: Infinity, ease: 'linear', delay: 28 }}
                >
                    🎧
                </motion.div>

                {/* 郁金香 */}
                <motion.div 
                    className="absolute text-3xl opacity-16 drop-shadow-[0_0_8px_rgba(255,105,180,0.6)]"
                    initial={{ left: '-10%', bottom: '60%' }}
                    animate={{ left: '110%', bottom: '10%' }}
                    transition={{ duration: 43, repeat: Infinity, ease: 'linear', delay: 6 }}
                >
                    🌷
                </motion.div>
            </div>

            {/* 主要内容区域 */}
            <div className="relative z-10 max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col min-h-screen" style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top) + 1.5rem)' }}>


                {/* 对话区域 */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <AnimatePresence mode="wait">
                        {error ? (
                            <ChatBubble>
                                <div className="text-center">
                                    <motion.div
                                        className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"
                                        initial={{ rotate: -10 }}
                                        animate={{ rotate: 10 }}
                                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                    >
                                        <span className="text-2xl text-white">⚠️</span>
                                    </motion.div>
                                    <h3 className="text-lg font-bold text-white mb-2">生成运势时遇到了小问题</h3>
                                    <p className="text-white/80 text-sm mb-4">{error}</p>
                                    {refetch && (
                                        <motion.button
                                            onClick={refetch}
                                            className="px-6 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all duration-200"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            重新生成
                                        </motion.button>
                                    )}
                                </div>
                            </ChatBubble>
                        ) : data ? (
                            <FortuneCard text={data.message || ''} isLoading={!!isLoading} />
                        ) : (
                            <FortuneCard text="" isWaiting={true} />
                        )}
                    </AnimatePresence>
                </div>

                {/* 底部交互区域 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-8"
                >
                    <InteractionArea />
                </motion.div>
            </div>
        </div>
    );
};

export default FortunePage;