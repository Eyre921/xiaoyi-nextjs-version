// 文件路径: src/components/Fortune.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Heart, Zap, Copy, Check } from 'lucide-react';
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
    // 首先尝试使用标准分隔符 ---
    const standardParts = text.split('---');
    if (standardParts.length >= 2) {
        return {
            fortuneText: standardParts[0]?.trim() || '',
            contactInfo: standardParts[1]?.trim() || ''
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
    <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
    >
        <div className="w-12 h-12 flex items-center justify-center">
            <img 
                src="/logo.svg" 
                alt="DD Logo" 
                className="w-full h-full object-contain filter invert"
            />
        </div>
    </motion.div>
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
                        {isWaiting ? '正在生成Daily Date....' : '正在为您生成专属运势...'}
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
                    <span className="text-white font-medium">与 DD 的聊天对话功能即将上线</span>
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
  message: string;
  action?: string;
}

interface FortunePageProps {
  nfcuid: string | null;
  data?: FortuneData | null;
  isLoading?: boolean;
  error?: Error | null;
}

const FortunePage: React.FC<FortunePageProps> = ({ data, isLoading }) => {

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* 装饰元素背景 */}
            <FloatingDecorations />
            
            {/* 现代化背景装饰 */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-64 h-64 bg-white/15 rounded-full blur-3xl" />
                <div className="absolute top-40 right-20 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
                <div className="absolute bottom-32 left-20 w-56 h-56 bg-white/15 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
            </div>

            {/* 简化的浮动装饰图标 */}
            <FloatingIcon icon={<Sparkles size={12} />} delay={0} x="top-20" y="left-8" />
            <FloatingIcon icon={<Star size={10} />} delay={1} x="top-32" y="right-12" />
            <FloatingIcon icon={<Heart size={10} />} delay={2} x="bottom-40" y="left-16" />
            <FloatingIcon icon={<Zap size={12} />} delay={3} x="bottom-24" y="right-8" />

            {/* 主要内容区域 */}
            <div className="relative z-10 max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col min-h-screen">


                {/* 对话区域 */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <AnimatePresence mode="wait">
                        {data ? (
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