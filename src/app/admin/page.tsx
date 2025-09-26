'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const xiaoyi = searchParams.get('xiaoyi');
    
    if (xiaoyi) {
      // 如果有xiaoyi参数，重定向到管理后台页面，使用xiaoyi作为token
      router.replace(`/admin/${xiaoyi}`);
    } else {
      // 如果没有xiaoyi参数，显示错误或重定向到首页
      router.replace('/');
    }
  }, [router, searchParams]);

  // 显示加载状态
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在验证访问权限...</p>
      </div>
    </div>
  );
}