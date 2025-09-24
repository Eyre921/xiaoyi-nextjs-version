// src/hooks/useFortune.ts

import { useState, useEffect, useCallback } from 'react';

interface FortuneData {
  action?: 'register';
  message: string;
}

interface UseFortuneResult {
  data: FortuneData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useFortune = (nfcuid: string | null, hasRegistered: boolean): UseFortuneResult => {
  const [data, setData] = useState<FortuneData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  console.log('useFortune called with:', { nfcuid, hasRegistered });

  const fetchFortune = useCallback(async () => {
    console.log('fetchFortune called with nfcuid:', nfcuid);
    
    if (!nfcuid) {
      console.log('No nfcuid provided, setting error');
      setError('NFC UID is not provided.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/fortune?nfcuid=${nfcuid}`;
      console.log('Fetching from URL:', url);
      const response = await fetch(url);
      
      // 先获取文本再解析JSON，避免解析错误
      const text = await response.text();
      let result;
      
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON解析错误:', parseError);
        console.error('原始响应文本:', text);
        throw new Error(`服务器返回了非JSON格式的数据: ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        throw new Error(result.error || `Server responded with status ${response.status}`);
      }

      setData(result as FortuneData);
      setHasFetched(true);
    } catch (err: unknown) {
      console.error('useFortune error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch fortune.');
    } finally {
      setIsLoading(false);
    }
  }, [nfcuid]);

  // 手动重新获取数据的函数
  const refetch = useCallback(() => {
    setHasFetched(false);
    fetchFortune();
  }, [fetchFortune]);

  useEffect(() => {
    if (nfcuid && (!hasFetched || hasRegistered)) {
      fetchFortune();
    }
  }, [fetchFortune, hasFetched, hasRegistered, nfcuid]);

  return { data, isLoading, error, refetch };
};