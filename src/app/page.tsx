'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Registration from '@/components/Registration';
import Fortune from '@/components/Fortune';
import SplashScreen from '@/components/SplashScreen';
import { useFortune } from '@/hooks/useFortune';

// 错误页面组件
const ErrorPage = ({ message }: { message?: string | null }) => (
  <div className="min-h-screen bg-black flex items-center justify-center p-4">
    <motion.div
      className="max-w-md w-full bg-white/20 backdrop-blur-md rounded-3xl p-8 shadow-xl text-center border border-white/30"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"
        initial={{ rotate: -10 }}
        animate={{ rotate: 10 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      >
        <span className="text-3xl text-white">⚠️</span>
      </motion.div>
      <h1 className="text-2xl font-bold text-white mb-4">{message || '访问方式不正确'}</h1>
      <p className="text-white/80 leading-relaxed mb-6">
        请通过 NFC 手环触碰来访问此页面，开启你的专属体验之旅。
      </p>
      <motion.div
        className="inline-flex items-center space-x-2 text-sm text-white/60"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>🔮</span>
        <span>等待你的到来...</span>
      </motion.div>
    </motion.div>
  </div>
);

export default function Home() {
  const [nfcuid, setNfcuid] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 确保在客户端环境中执行参数解析
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    console.log('=== Parameter parsing useEffect triggered ===');
    
    const searchParams = new URLSearchParams(window.location.search);
    console.log('URL search params:', window.location.search);
    
    // 首先尝试获取 nfcuid 参数
    let uidFromUrl = searchParams.get('nfcuid');
    console.log('Direct nfcuid:', uidFromUrl);
    
    // 如果没有找到 nfcuid，则检查是否只有一个参数且包含 'nfc'
    if (!uidFromUrl) {
      const allParams = Array.from(searchParams.entries());
      console.log('All params:', allParams);
      console.log('All params length:', allParams.length);
      
      if (allParams.length >= 1 && allParams[0]) {
        const [paramName, paramValue] = allParams[0];
        console.log('Checking param:', paramName, 'value:', paramValue);
        console.log('paramName.toLowerCase():', paramName.toLowerCase());
        console.log('includes nfc?', paramName.toLowerCase().includes('nfc'));
        if (paramName.toLowerCase().includes('nfc')) {
          uidFromUrl = paramValue;
          console.log('Found nfc param, setting uidFromUrl to:', uidFromUrl);
        }
      }
    }
    
    console.log('Final uidFromUrl before setState:', uidFromUrl);
    if (uidFromUrl) {
      console.log('Setting nfcuid state to:', uidFromUrl);
      setNfcuid(uidFromUrl);
    } else {
      console.log('No valid UID found, setting nfcuid to null');
      setNfcuid(null);
    }
  }, [isClient]);

  const { data, isLoading, error } = useFortune(nfcuid, hasRegistered);
  
  console.log('Current nfcuid state:', nfcuid);
  console.log('useFortune result:', { data, isLoading, error });

  // 注册成功后，重新获取数据并跳转到运势页面
  const handleRegistrationSuccess = () => {
    setHasRegistered(true);
  };

  // 开场动画完成后的处理
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // 显示开场动画
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (error || !nfcuid) {
    return <ErrorPage message={error} />;
  }

  // 决定渲染哪个页面
  const shouldShowRegistration = data?.action === 'register' && !hasRegistered;

  if (shouldShowRegistration) {
    return <Registration nfcuid={nfcuid} onRegistrationSuccess={handleRegistrationSuccess} />;
  }

  // 注册后或已登录用户，直接显示运势页面
  // 在 hasRegistered 为 true 时，即使 data 为空也显示 Fortune，并传入 isLoading 状态
  return (
    <Fortune 
      nfcuid={nfcuid} 
      data={data} 
      isLoading={isLoading || (hasRegistered && !data)} 
      error={error as Error | null} 
    />
  );
}