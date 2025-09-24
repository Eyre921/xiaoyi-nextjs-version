import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// 动态加载动画数据
const useAnimationData = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/DailyDate.json')
      .then(response => response.json())
      .then(setData)
      .catch(console.error);
  }, []);
  
  return data;
};

interface TransitionAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  fromPage?: string;
  toPage?: string;
}

const TransitionAnimation: React.FC<TransitionAnimationProps> = ({ 
  isVisible, 
  onComplete, 
  fromPage = 'registration', 
  toPage = 'fortune'
}) => {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'playing' | 'exit'>('enter');
  const animationData = useAnimationData();

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('enter');
      // 短暂延迟后开始播放动画
      const enterTimer = setTimeout(() => {
        setAnimationPhase('playing');
      }, 100);

      return () => clearTimeout(enterTimer);
    } else {
      setAnimationPhase('exit');
      const exitTimer = setTimeout(onComplete, 500);
      return () => clearTimeout(exitTimer);
    }
  }, [isVisible, onComplete]);

  const handleVideoEnd = () => {
    // 动画播放完毕后等待一段时间再跳转
    setTimeout(() => {
      setAnimationPhase('exit');
      setTimeout(onComplete, 800);
    }, 1000);
  };

  if (!isVisible && animationPhase === 'exit') {
    return null;
  }

  const getOpacity = () => {
    switch (animationPhase) {
      case 'enter':
        return 'opacity-0';
      case 'playing':
        return 'opacity-100';
      case 'exit':
        return 'opacity-0';
      default:
        return 'opacity-100';
    }
  };

  return (
    <div className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-500 ${getOpacity()} px-4 py-8`}>
      <div className="w-full max-w-md mx-auto bg-white/20 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/30">
        {animationData ? (
          <video
            src="/transition-animation.mp4"
            className="w-full h-32 sm:h-36 md:h-40 object-cover"
            autoPlay
            muted
            loop={false}
            onEnded={handleVideoEnd}
            key={`${fromPage}-${toPage}`} // 确保每次过渡都重新加载动画
          />
        ) : (
          <div className="w-full h-32 sm:h-36 md:h-40 flex items-center justify-center bg-white/15">
            <div className="text-white/80">加载动画中...</div>
          </div>
        )}
        
        {/* 页面标识文字 */}
        <div className="p-3 text-center bg-white/15 backdrop-blur-sm">
          <div className="text-sm text-white/80 mb-1">
            {fromPage === 'registration' ? '✨ 注册完成' : '🔄 页面切换中'}
          </div>
          <div className="text-lg font-bold text-white">
            {toPage === 'fortune' ? '正在进入运势分析' : '页面加载中...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransitionAnimation;