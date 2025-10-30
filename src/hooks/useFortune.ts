// src/hooks/useFortune.ts

import { useState, useEffect, useCallback } from 'react';

interface FortuneData {
  action?: 'register';
  message?: string | null;
  error?: string;
}

interface ValidateUserResponse {
  exists: boolean;
  action?: 'register' | 'fortune';
  error?: string;
}

interface UseFortune {
  data: FortuneData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useFortune = (nfcuid: string | null): UseFortune => {
  const [data, setData] = useState<FortuneData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFortune = useCallback(async () => {
    if (!nfcuid) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: 先验证用户是否存在，避免不必要的运势API调用
      console.log(`[${new Date().toISOString()}] 开始验证用户: ${nfcuid}`);
      const validateResponse = await fetch(`/api/validate-user?nfcuid=${encodeURIComponent(nfcuid)}`);
      
      if (!validateResponse.ok) {
        if (validateResponse.status === 404) {
          // NFC UID 不存在
          throw new Error('无效的 NFC UID。请检查您的设备。');
        } else if (validateResponse.status === 500) {
          throw new Error('服务器内部错误，请稍后重试。');
        } else {
          throw new Error(`验证失败: ${validateResponse.status}`);
        }
      }

      const validateResult: ValidateUserResponse = await validateResponse.json();
      
      // 如果用户不存在，直接返回注册提示，不调用运势API
      if (!validateResult.exists) {
        console.log(`[${new Date().toISOString()}] 用户不存在，引导注册: ${nfcuid}`);
        setData({
          action: 'register',
          message: 'User not found. Please register first.'
        });
        return;
      }

      // Step 2: 用户存在，调用运势API
      console.log(`[${new Date().toISOString()}] 用户存在，获取运势: ${nfcuid}`);
      const response = await fetch(`/api/fortune?nfcuid=${encodeURIComponent(nfcuid)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // 这种情况理论上不应该发生，因为我们已经验证过用户存在
          throw new Error('用户数据异常，请重试。');
        } else if (response.status === 500) {
          throw new Error('服务器内部错误，请稍后重试。');
        } else {
          throw new Error(`请求失败: ${response.status}`);
        }
      }

      const result: FortuneData = await response.json();
      setData(result);
    } catch (err) {
      console.error('获取运势数据失败:', err);
      setError(err instanceof Error ? err.message : '获取运势数据失败');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [nfcuid]);

  useEffect(() => {
    fetchFortune();
  }, [fetchFortune]);

  const refetch = useCallback(() => {
    fetchFortune();
  }, [fetchFortune]);

  return {
    data,
    loading,
    error,
    refetch
  };
};