// 文件路径: src/components/Registration.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, MessageCircle, Heart, Sparkles, Star, Zap, ArrowRight, Users, Shield, UserCheck, Music } from 'lucide-react';

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
    const newDecorations = Array.from({ length: 20 }, (_, i) => ({
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

interface RegistrationPageProps {
  nfcuid: string | null;
  onRegistrationSuccess?: () => void;
}

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
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 flex items-center justify-center"
            >
                <img 
                    src="/avatar.svg" 
                    alt="DD Avatar" 
                    className="w-full h-full object-contain"
                />
            </motion.div>
        </motion.div>
    </div>
);

// 聊天气泡组件 - 毛玻璃效果
const ChatBubble: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.4, ease: "easeOut" }}
        className="flex items-start space-x-3 mb-4"
    >
        <DDAvatar />
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.15, duration: 0.3 }}
            className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl rounded-tl-md p-3 shadow-2xl max-w-xs relative flex-1"
        >
            <div className="absolute -left-2 top-3 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-white/30"></div>
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    </motion.div>
);

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

// 现代化输入框组件
const FormInput: React.FC<{
    label: string;
    icon: React.ReactNode;
    type: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    delay: number;
}> = ({ label, icon, type, name, value, onChange, placeholder, required, delay }) => {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="relative"
        >
            <label className="block text-sm font-semibold text-white mb-2">
                <span className="flex items-center">
                    <span className="text-white/80 mr-2">{icon}</span>
                    {label}
                </span>
            </label>
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white/50 focus:outline-none transition-all duration-300 ${
                        isFocused 
                            ? 'border-white/50 bg-white/20 shadow-lg shadow-white/20' 
                            : 'border-white/30 hover:border-white/40'
                    }`}
                />
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
                    isFocused ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-black/20' : ''
                }`} />
            </div>
        </motion.div>
    );
};

// 现代化生日选择组件 - 分段式选择器
const BirthdateInput: React.FC<{
    label: string;
    icon: React.ReactNode;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    delay: number;
}> = ({ label, icon, name, value, onChange, delay }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    
    // 解析当前日期值
    const parseDate = (dateStr: string) => {
        if (!dateStr) return { year: '', month: '', day: '' };
        const [year, month, day] = dateStr.split('-');
        return { year: year || '', month: month || '', day: day || '' };
    };
    
    const { year, month, day } = parseDate(value);
    
    // 生成年份选项（1950-2010）
    const yearOptions = Array.from({ length: 61 }, (_, i) => 2010 - i);
    
    // 生成月份选项
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const monthNum = i + 1;
        return {
            value: monthNum.toString().padStart(2, '0'),
            label: `${monthNum}月`
        };
    });
    
    // 生成日期选项
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };
    
    const dayOptions = year && month ? 
        Array.from({ length: getDaysInMonth(parseInt(year), parseInt(month)) }, (_, i) => {
            const dayNum = i + 1;
            return {
                value: dayNum.toString().padStart(2, '0'),
                label: `${dayNum}日`
            };
        }) : [];
    
    const handleDateChange = (type: 'year' | 'month' | 'day', newValue: string) => {
        const currentDate = parseDate(value);
        const updatedDate = { ...currentDate, [type]: newValue };
        
        // 如果年月日都有值，则组合成完整日期
        if (updatedDate.year && updatedDate.month && updatedDate.day) {
            const fullDate = `${updatedDate.year}-${updatedDate.month}-${updatedDate.day}`;
            const syntheticEvent = {
                target: { name, value: fullDate }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
        } else {
            // 部分日期也要更新
            const partialDate = `${updatedDate.year || ''}-${updatedDate.month || ''}-${updatedDate.day || ''}`;
            const syntheticEvent = {
                target: { name, value: partialDate }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
        }
    };
    
    const formatDisplayDate = () => {
        if (!year || !month || !day) return '请选择生日';
        return `${year}年${parseInt(month)}月${parseInt(day)}日`;
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="relative"
        >
            <label className="block text-sm font-semibold text-white mb-2">
            <span className="flex items-center">
                <span className="text-white/80 mr-2">{icon}</span>
                {label}
            </span>
        </label>
        
        {/* 显示区域 */}
        <motion.div
            className="relative"
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.2 }}
        >
            <div
                onClick={() => setShowPicker(!showPicker)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/40 rounded-2xl focus:ring-2 focus:ring-white/30 focus:border-white/60 transition-all duration-300 text-white shadow-sm cursor-pointer flex items-center justify-between touch-manipulation"
                tabIndex={0}
            >
                    <span className={year && month && day ? 'text-white' : 'text-white/60'}>
                        {formatDisplayDate()}
                    </span>
                    <motion.div
                        animate={{
                            rotate: showPicker ? 180 : 0,
                            scale: isFocused ? 1.1 : 1
                        }}
                        transition={{ duration: 0.2 }}
                        className="text-white/60"
                    >
                        <Calendar size={16} />
                    </motion.div>
                </div>
                
                <motion.div
                    className="absolute inset-0 rounded-2xl bg-white/20 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isFocused || showPicker ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>
            
            {/* 分段选择器 */}
            <AnimatePresence>
                {showPicker && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-black/50 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl z-50 p-4"
                    >
                        <div className="grid grid-cols-3 gap-3">
                            {/* 年份选择 */}
                            <div>
                                <label className="block text-xs font-medium text-white/80 mb-2">年份</label>
                                <select
                                    value={year}
                                    onChange={(e) => handleDateChange('year', e.target.value)}
                                    className="w-full px-2 py-2 text-sm bg-black/40 border border-white/40 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/60 transition-all duration-200 text-white"
                                >
                                    <option value="">年</option>
                                    {yearOptions.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* 月份选择 */}
                            <div>
                                <label className="block text-xs font-medium text-white/80 mb-2">月份</label>
                                <select
                                    value={month}
                                    onChange={(e) => handleDateChange('month', e.target.value)}
                                    className="w-full px-2 py-2 text-sm bg-black/30 border border-white/30 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/50 transition-all duration-200 text-white"
                                >
                                    <option value="">月</option>
                                    {monthOptions.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* 日期选择 */}
                            <div>
                                <label className="block text-xs font-medium text-white/80 mb-2">日期</label>
                                <select
                                    value={day}
                                    onChange={(e) => handleDateChange('day', e.target.value)}
                                    disabled={!year || !month}
                                    className="w-full px-2 py-2 text-sm bg-black/40 border border-white/40 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/60 transition-all duration-200 disabled:bg-black/20 disabled:text-white/50 text-white"
                                >
                                    <option value="">日</option>
                                    {dayOptions.map(d => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* 完成按钮 */}
                        <div className="mt-4 pt-3 border-t border-white/20">
                            <div className="flex justify-end">
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowPicker(false)}
                                    className="px-4 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                                >
                                    完成
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* 点击外部关闭选择器 */}
            {showPicker && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowPicker(false)}
                />
            )}
        </motion.div>
    );
};

// 现代化文本域组件（用于个人简介）
const FormTextarea: React.FC<{
    label: string;
    icon: React.ReactNode;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    required?: boolean;
    delay: number;
}> = ({ label, icon, name, value, onChange, placeholder, required, delay }) => {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="relative"
        >
            <label className="block text-sm font-semibold text-white mb-2">
            <span className="flex items-center">
                <span className="text-white/80 mr-2">{icon}</span>
                {label}
            </span>
        </label>
        <div className="relative">
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                required={required}
                rows={3}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white/50 focus:outline-none transition-all duration-300 resize-none ${
                    isFocused 
                        ? 'border-white/50 bg-white/20 shadow-lg shadow-white/20' 
                        : 'border-white/30 hover:border-white/40'
                }`}
            />
            <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
                isFocused ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-black/20' : ''
            }`} />
        </div>
        </motion.div>
    );
};

// 现代化性别选择组件（按钮组形式）
const GenderSelect: React.FC<{
    label: string;
    icon: React.ReactNode;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    delay: number;
}> = ({ label, icon, name, value, onChange, required, delay }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="relative"
        >
            <label className="block text-sm font-semibold text-white mb-2">
                <span className="flex items-center">
                    <span className="text-white/80 mr-2">{icon}</span>
                    {label}
                </span>
            </label>
            <div className="relative">
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    required={required}
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white focus:outline-none transition-all duration-300 appearance-none ${
                        isFocused 
                            ? 'border-white/50 bg-white/20 shadow-lg shadow-white/20' 
                            : 'border-white/30 hover:border-white/40'
                    }`}
                >
                    <option value="" className="bg-black text-white">请选择性别</option>
                    <option value="male" className="bg-black text-white">男</option>
                    <option value="female" className="bg-black text-white">女</option>
                    <option value="other" className="bg-black text-white">其他</option>
                </select>
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
                    isFocused ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-black/20' : ''
                }`} />
                
                {/* 自定义下拉箭头 */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <motion.div
                        animate={{ rotate: isFocused ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-white/60"
                    >
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

// 推荐设置组件
const MatchableToggle: React.FC<{
    label: string;
    icon: React.ReactNode;
    name: string;
    value: boolean;
    onChange: (name: string, value: boolean) => void;
    delay: number;
}> = ({ label, icon, name, value, onChange, delay }) => {
    const handleToggle = () => {
        onChange(name, !value);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="relative"
        >
            <label className="block text-sm font-semibold text-white mb-2">
                <span className="flex items-center">
                    <span className="text-white/80 mr-2">{icon}</span>
                    {label}
                </span>
            </label>
            <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl">
                <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 transition-colors duration-300 ${
                        value ? 'bg-green-400' : 'bg-gray-400'
                    }`} />
                    <span className="text-white text-sm">
                        {value ? '开启智能推荐' : '关闭智能推荐'}
                    </span>
                </div>
                <motion.button
                    type="button"
                    onClick={handleToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/20 ${
                        value ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.span
                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300"
                        animate={{ x: value ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                </motion.button>
            </div>
            
            <AnimatePresence mode="wait">
                {value ? (
                    <motion.div
                        key="enabled"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 pt-3 border-t border-white/20"
                    >
                        <div className="flex items-center text-sm text-green-400">
                            <UserCheck size={14} className="mr-2" />
                            <span>已开启智能推荐，DD 会为您寻找有趣的朋友</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="disabled"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 pt-3 border-t border-white/20"
                    >
                        <div className="flex items-center text-sm text-white/70">
                            <Shield size={14} className="mr-2" />
                            <span>您的信息将保持私密，不会被推荐给其他用户</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const RegistrationPage: React.FC<RegistrationPageProps> = ({ nfcuid, onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthdate: '',
    wechat_id: '',
    bio: '',
    favoriteSong: '',
    is_matchable: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMatchableChange = (name: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 表单验证
    if (!formData.name.trim()) {
      setError('请输入您的姓名');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.gender) {
      setError('请选择您的性别');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.birthdate) {
      setError('请选择您的生日');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.wechat_id.trim()) {
      setError('请输入您的微信号');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.bio.trim()) {
      setError('请输入个人简介');
      setIsSubmitting(false);
      return;
    }
    
    if (formData.bio.trim().length < 10) {
      setError('个人简介至少需要10个字符，让大家更好地了解你');
      setIsSubmitting(false);
      return;
    }

    if (!formData.favoriteSong.trim()) {
      setError('请分享您最喜欢的歌曲');
      setIsSubmitting(false);
      return;
    }

    if (formData.favoriteSong.trim().length < 5) {
      setError('请详细分享一下您最喜欢的歌曲');
      setIsSubmitting(false);
      return;
    }

    if (!nfcuid) {
      setError('缺少NFC UID参数');
      setIsSubmitting(false);
      return;
    }

    try {
      // 合并个人简介和最喜欢歌曲
      const combinedBio = `${formData.bio.trim()}\n\n【我最喜欢的歌曲】\n${formData.favoriteSong.trim()}`;
      
      // 准备发送到后端的数据，移除favoriteSong字段
      const { favoriteSong, ...dataToSend } = formData;
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nfcuid,
          ...dataToSend,
          bio: combinedBio
        }),
      });

      // 首先检查响应内容类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from register:', text);
        throw new Error(`服务器返回了非JSON格式的数据: ${text.substring(0, 100)}`);
      }
      
      // 先获取文本再解析JSON
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON解析错误 in register:', parseError);
        console.error('原始响应文本:', text);
        throw new Error(`JSON解析失败: ${parseError instanceof Error ? parseError.message : '未知错误'}`);
      }
      
      if (!response.ok) {
        // 优先使用 error 字段，因为 API 返回的错误信息在 error 字段中
        throw new Error(result.error || result.message || '注册时发生未知错误');
      }
      
      console.log('注册成功:', result);
      // 只有在后端确认成功后才跳转
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }
    } catch (err) {
      console.error('后台注册过程中出现错误:', err);
      setError(err instanceof Error ? err.message : '注册失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* 移动端优化的背景装饰 - 更加微妙 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 w-32 h-32 bg-blue-50/30 rounded-full blur-3xl" />
        <div className="absolute top-20 right-5 w-24 h-24 bg-purple-50/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-5 w-28 h-28 bg-pink-50/25 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-5 w-36 h-36 bg-indigo-50/20 rounded-full blur-3xl" />
      </div>

      {/* 装饰元素背景 */}
      <FloatingDecorations />
      
      {/* 移动端优化的浮动装饰图标 */}
      <FloatingIcon icon={<Sparkles size={8} />} delay={0} x="top-16" y="left-4" />
      <FloatingIcon icon={<Star size={6} />} delay={1} x="top-24" y="right-6" />
      <FloatingIcon icon={<Heart size={6} />} delay={2} x="bottom-32" y="left-8" />
      <FloatingIcon icon={<Zap size={8} />} delay={3} x="bottom-16" y="right-4" />
      
      {/* 移动端优化的主容器 - 完全自适应 */}
      <div className="relative z-10 min-h-screen w-full">
        {/* 顶部安全区域 */}
        <div className="h-safe-top" />
        
        {/* 主内容区域 - 完全自适应移动端 */}
        <div className="px-4 py-2 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full"
          >


          {/* 对话区域 - 移动端优化 */}
          <div className="mb-6">
            {/* DD的寒暄消息 */}
            <ChatBubble delay={1.0}>
              <div className="text-white">
                <p className="font-medium mb-2 text-sm">嗨，我是 DD，可以让我更了解你吗！</p>
                <p className="text-xs text-white/80">这样我可以为你打开一个有趣的世界呢～</p>
              </div>
            </ChatBubble>
          </div>

          {/* 表单区域 - 移动端优化 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="relative"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-2xl w-full">
              {/* 毛玻璃装饰效果 */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/8 to-white/15 rounded-2xl" />
              
              <div className="relative z-10">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* 姓名输入 */}
                  <FormInput
                    label="姓名"
                    icon={<User size={16} />}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="请输入您的姓名"
                    required
                    delay={1.4}
                  />

                  {/* 性别选择 */}
                  <GenderSelect
                    label="性别"
                    icon={<Users size={16} />}
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    delay={1.5}
                  />

                  {/* 生日输入 */}
                  <BirthdateInput
                    label="生日"
                    icon={<Calendar size={16} />}
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    required
                    delay={1.6}
                  />

                  {/* 微信号输入 */}
                  <FormInput
                    label="微信号"
                    icon={<MessageCircle size={16} />}
                    type="text"
                    name="wechat_id"
                    value={formData.wechat_id}
                    onChange={handleInputChange}
                    placeholder="请输入您的微信号"
                    required
                    delay={1.7}
                  />

                  {/* 个人简介输入 */}
                  <FormTextarea
                    label="个人简介"
                    icon={<Heart size={16} />}
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="三句话自我介绍，例如：古镇里的手作银饰匠人，也是一个业余的塔罗牌解读师。相信万物皆有灵，每天的必修课是和我的猫一起发呆。享受没有规划的旅行。"
                    required
                    delay={1.8}
                  />

                  {/* 最喜欢歌曲输入 */}
                  <FormTextarea
                    label="这次演唱会你最喜欢的一首歌"
                    icon={<Music size={16} />}
                    name="favoriteSong"
                    value={formData.favoriteSong}
                    onChange={handleInputChange}
                    placeholder="分享一下这次演唱会中你最喜欢的歌曲，以及它为什么打动了你..."
                    required
                    delay={1.85}
                  />

                  {/* 推荐设置 */}
                  <MatchableToggle
                    label="推荐设置"
                    icon={<UserCheck size={16} />}
                    name="is_matchable"
                    value={formData.is_matchable}
                    onChange={handleMatchableChange}
                    delay={1.95}
                  />

                  {/* 现代化错误信息 */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl"
                      >
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse" />
                          <span className="text-red-300 text-sm font-medium">{error}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 现代化提交按钮 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0, duration: 0.5 }}
                    className="pt-2"
                  >
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-center justify-center">
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                            />
                            正在开启运势之旅...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <motion.div
                              whileHover={{ scale: 1.1, x: 2 }}
                              className="mr-2"
                            >
                              <ArrowRight size={20} />
                            </motion.div>
                            开启运势之旅
                          </div>
                        )}
                      </div>
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </div>
          </motion.div>

          {/* 移动端优化的底部提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.3, duration: 0.5 }}
            className="text-center mt-6"
          >
            <p className="text-white/60 text-xs font-medium px-4">
              您的信息将被安全保护，仅用于生成个性化运势 ✨
            </p>
          </motion.div>
          
          {/* 底部安全区域 */}
          <div className="h-safe-bottom pb-4" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;