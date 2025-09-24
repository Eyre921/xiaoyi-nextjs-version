import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import Lottie from 'lottie-react';

// 动态加载动画数据
const useAnimationData = () => {
  const [data, setData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    fetch('/DailyDate.json')
      .then(response => response.json())
      .then(animationData => {
        setData(animationData);
        setIsLoaded(true);
      })
      .catch(console.error);
  }, []);
  
  return { data, isLoaded };
};

// 装饰元素组件
const FloatingDecorations = () => {
  const decorations = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    type: i % 2 === 0 ? 'heart' : 'star',
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    size: 12 + Math.random() * 8
  }));

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

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const { data: animationData, isLoaded } = useAnimationData();

  useEffect(() => {
    // 只有当动画数据加载完成且动画播放完成后才开始跳转
    if (isLoaded && animationCompleted) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 500); // 等待淡出动画完成
      }, 1000); // 给用户一点时间欣赏完成的动画

      return () => clearTimeout(timer);
    }
    // 如果条件不满足，不需要返回清理函数
    return undefined;
  }, [isLoaded, animationCompleted, onComplete]);

  // 如果没有动画数据，使用简单的定时器
  useEffect(() => {
    if (!isLoaded) {
      const fallbackTimer = setTimeout(() => {
        setAnimationCompleted(true);
      }, 3000); // 3秒后强制完成

      return () => clearTimeout(fallbackTimer);
    }
    // 如果条件不满足，不需要返回清理函数
    return undefined;
  }, [isLoaded]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center transition-opacity duration-500 opacity-0 pointer-events-none">
        <FloatingDecorations />
        <div className="w-full max-w-md mx-auto bg-white/60 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/50 m-4">
          {animationData ? (
          <Lottie
            animationData={animationData}
            className="w-full aspect-square"
            loop={false}
            onComplete={() => setAnimationCompleted(true)}
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-white/30">
            <div className="text-white/80">加载动画中...</div>
          </div>
        )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center transition-opacity duration-500">
      <FloatingDecorations />
      <div className="w-full max-w-md mx-auto bg-white/60 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/50 m-4">
        {animationData ? (
          <Lottie
            animationData={animationData}
            className="w-full aspect-square"
            loop={false}
            onComplete={() => setAnimationCompleted(true)}
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-white/30">
            <div className="text-white/80">加载动画中...</div>
          </div>
        )}
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Daily Date</h2>
          <p className="text-white/80">欢迎来到你的专属世界</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;