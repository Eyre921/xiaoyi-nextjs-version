'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type TransitionType = 
  | 'slide-left' 
  | 'slide-right' 
  | 'slide-up' 
  | 'slide-down'
  | 'scale-fade'
  | 'rotate-fade'
  | 'flip-horizontal'
  | 'flip-vertical'
  | 'zoom-blur'
  | 'spiral'
  | 'wave'
  | 'curtain';

export type PageType = 'registration' | 'fortune' | 'admin' | 'error';

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
  transitionType?: TransitionType;
  duration?: number;
  fromPage?: string | null;
  toPage?: string;
}

// 页面层级定义（用于确定切换方向）
const PAGE_HIERARCHY = {
  'error': 0,
  'registration': 1,
  'fortune': 2
};

// 根据页面切换方向选择合适的动画
const getDirectionalTransition = (fromPage: string | null, toPage: string): TransitionType => {
  if (!fromPage) return 'slide-left';
  
  const fromLevel = PAGE_HIERARCHY[fromPage as keyof typeof PAGE_HIERARCHY] ?? 1;
  const toLevel = PAGE_HIERARCHY[toPage as keyof typeof PAGE_HIERARCHY] ?? 1;
  
  if (fromLevel < toLevel) {
    // 向前进入（如：注册 -> 运势）
    return 'slide-left'; // 从右侧滑入
  } else if (fromLevel > toLevel) {
    // 向后退出（如：运势 -> 注册）
    return 'flip-horizontal'; // 翻转效果
  } else {
    // 同级切换
    return 'scale-fade'; // 缩放效果
  }
};

// 定义各种过渡动画变体
const transitionVariants = {
  'slide-left': {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  },
  'slide-right': {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 }
  },
  'slide-up': {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 }
  },
  'slide-down': {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 }
  },
  'scale-fade': {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 }
  },
  'rotate-fade': {
    initial: { rotate: -180, scale: 0.8, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: 180, scale: 0.8, opacity: 0 }
  },
  'flip-horizontal': {
    initial: { rotateY: -90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: 90, opacity: 0 }
  },
  'flip-vertical': {
    initial: { rotateX: -90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    exit: { rotateX: 90, opacity: 0 }
  },
  'zoom-blur': {
    initial: { scale: 0.3, filter: 'blur(20px)', opacity: 0 },
    animate: { scale: 1, filter: 'blur(0px)', opacity: 1 },
    exit: { scale: 3, filter: 'blur(20px)', opacity: 0 }
  },
  'spiral': {
    initial: { 
      scale: 0.1, 
      rotate: -720, 
      x: '50%', 
      y: '50%', 
      opacity: 0 
    },
    animate: { 
      scale: 1, 
      rotate: 0, 
      x: 0, 
      y: 0, 
      opacity: 1 
    },
    exit: { 
      scale: 0.1, 
      rotate: 720, 
      x: '-50%', 
      y: '-50%', 
      opacity: 0 
    }
  },
  'wave': {
    initial: { 
      scaleX: 0, 
      transformOrigin: 'left center',
      opacity: 0 
    },
    animate: { 
      scaleX: 1, 
      opacity: 1
    },
    exit: { 
      scaleX: 0, 
      transformOrigin: 'right center',
      opacity: 0
    }
  },
  'curtain': {
    initial: { 
      clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
      opacity: 0 
    },
    animate: { 
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      opacity: 1
    },
    exit: { 
      clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
      opacity: 0
    }
  }
};

// 根据页面类型自动选择过渡效果
const getAutoTransitionType = (fromPage?: PageType, toPage?: PageType): TransitionType => {
  if (fromPage === 'registration' && toPage === 'fortune') {
    return 'spiral';
  }
  if (fromPage === 'fortune' && toPage === 'registration') {
    return 'slide-right';
  }
  if (toPage === 'admin') {
    return 'flip-horizontal';
  }
  if (toPage === 'error') {
    return 'zoom-blur';
  }
  return 'scale-fade';
};

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  pageKey,
  transitionType,
  duration = 0.8,
  fromPage,
  toPage
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // 优先使用指定的过渡类型，否则使用智能方向检测
  const finalTransitionType = transitionType || getDirectionalTransition(fromPage || null, toPage || pageKey);
  const variants = transitionVariants[finalTransitionType];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{
          duration,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="w-full h-full"
        style={{ 
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// 页面容器组件，带有交错动画效果
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  staggerChildren = true,
  staggerDelay = 0.1
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerChildren ? staggerDelay : 0,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="w-full"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// 背景过渡组件
interface BackgroundTransitionProps {
  fromColor?: string;
  toColor?: string;
  pattern?: 'gradient' | 'particles' | 'waves' | 'geometric';
  duration?: number;
}

export const BackgroundTransition: React.FC<BackgroundTransitionProps> = ({
  fromColor = 'from-black',
  toColor = 'to-gray-900',
  pattern = 'gradient',
  duration = 2
}) => {
  const [currentPattern, setCurrentPattern] = useState(pattern);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPattern(pattern);
    }, 100);
    return () => clearTimeout(timer);
  }, [pattern]);

  const getBackgroundPattern = () => {
    switch (currentPattern) {
      case 'particles':
        return (
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        );
      case 'waves':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 opacity-10"
                style={{
                  background: `radial-gradient(circle at ${50 + i * 20}% ${50 + i * 15}%, white 0%, transparent 50%)`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>
        );
      case 'geometric':
        return (
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute border border-white/10"
                style={{
                  left: `${Math.random() * 90}%`,
                  top: `${Math.random() * 90}%`,
                  width: `${20 + Math.random() * 40}px`,
                  height: `${20 + Math.random() * 40}px`,
                }}
                animate={{
                  rotate: [0, 360],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 10 + Math.random() * 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`fixed inset-0 bg-gradient-to-br ${fromColor} ${toColor} -z-10`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration }}
    >
      {getBackgroundPattern()}
    </motion.div>
  );
};

export default PageTransition;