'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../../../hooks/useDebounce';
import { 
  Users, 
  Activity, 
  Download, 
  RefreshCw, 
  Eye, 
  Calendar,
  Heart,
  Shield,
  Database,
  TrendingUp,
  UserCheck,
  Clock,
  Filter,
  Search,
  ChevronDown,
  ExternalLink,
  Edit,
  Trash2,
  X,
  Save,
  Watch,
  Plus,
  MoreHorizontal,
  FileDown,
  Settings
} from 'lucide-react';

// shadcn/ui 组件导入
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 类型定义
interface User {
  id: number;
  name: string;
  gender: string;
  wechat_id: string;
  nfc_uid: string | null;
  birthdate: string | null;
  status: string;
  is_matchable: boolean;
  bio: string | null;
  created_at: string;
  last_fortune_at: string | null;
  last_fortune_message: string | null;
}

interface Match {
  id: number;
  user1_id: number;
  user2_id: number;
  fortune_id: number | null;
  matched_at: string;
  user1_name?: string;
  user1_wechat_id?: string;
  user2_name?: string;
  user2_wechat_id?: string;
  fortune_text?: string;
}

interface Bracelet {
  nfc_uid: string;
  status: string;
  created_at: string;
  user_name?: string;
  user_wechat_id?: string;
  user_status?: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  successfulMatches: number;
  totalBracelets: number;
  activeBracelets: number;
  todayActivity?: number;
}

export default function AdminPage() {
  // 使用固定的xiaoyi作为认证token
  const authToken = 'xiaoyi';
  
  // 状态管理
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [bracelets, setBracelets] = useState<Bracelet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // 搜索和分页状态
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [matchSearchQuery, setMatchSearchQuery] = useState('');
  const [braceletSearchQuery, setBraceletSearchQuery] = useState('');
  
  const [userPage, setUserPage] = useState(1);
  const [matchPage, setMatchPage] = useState(1);
  const [braceletPage, setBraceletPage] = useState(1);
  
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [matchTotalPages, setMatchTotalPages] = useState(1);
  const [braceletTotalPages, setBraceletTotalPages] = useState(1);
  
  // 手环过滤状态
  const [braceletFilter, setBraceletFilter] = useState<'all' | 'bound' | 'unbound'>('all');
  
  // 防抖搜索
  const debouncedUserSearch = useDebounce(userSearchQuery, 300);
  const debouncedMatchSearch = useDebounce(matchSearchQuery, 300);
  const debouncedBraceletSearch = useDebounce(braceletSearchQuery, 300);
  
  // 模态框状态
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedBracelet, setSelectedBracelet] = useState<Bracelet | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  
  // 统计数据
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMatches: 0,
    successfulMatches: 0,
    totalBracelets: 0,
    activeBracelets: 0,
    todayActivity: 0
  });

  // 活动数据
  const [activities, setActivities] = useState<any[]>([]);

  // 根据用户ID获取用户名的辅助函数
  const getUserNameById = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `用户 ${userId}`;
  };

  // 根据用户ID获取用户信息的辅助函数
  const getUserById = (userId: number): User | null => {
    return users.find(u => u.id === userId) || null;
  };

  // 数据获取函数
  const fetchUsers = async (page = 1, search = '') => {
    try {
      console.log('Fetching users:', { page, search });
      
      // 构建查询参数
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search.trim()) {
        params.append('q', search.trim());
      }
      
      // 根据是否有搜索词选择不同的API端点
      const endpoint = search.trim() ? '/api/admin/search/users' : '/api/admin/users';
      const url = `${endpoint}?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Users data received:', data);
        setUsers(data.users || []);
        setUserTotalPages(data.totalPages || data.pagination?.totalPages || 1);
      } else {
        console.error('Failed to fetch users:', response.status);
        setUsers([]);
        setUserTotalPages(1);
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
      setUsers([]);
      setUserTotalPages(1);
    }
  };

  const fetchMatches = async (page = 1, search = '') => {
    try {
      console.log('Fetching matches:', { page, search });
      
      // 构建查询参数
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search.trim()) {
        params.append('q', search.trim());
      }
      
      const url = `/api/admin/search/matches?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Matches data received:', data);
        setMatches(data.matches || []);
        setMatchTotalPages(data.pagination?.totalPages || Math.ceil((data.pagination?.total || 0) / 10) || 1);
      } else {
        console.error('Failed to fetch matches:', response.status);
        setMatches([]);
        setMatchTotalPages(1);
      }
    } catch (error) {
      console.error('获取匹配数据失败:', error);
      setMatches([]);
      setMatchTotalPages(1);
    }
  };

  const fetchBracelets = async (page = 1, search = '', filter = 'all') => {
    try {
      console.log('Fetching bracelets:', { page, search, filter });
      
      // 构建查询参数
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search.trim()) {
        params.append('q', search.trim());
      }
      
      // 添加过滤参数
      if (filter !== 'all') {
        params.append('status', filter === 'bound' ? 'active' : 'inactive');
      }
      
      // 根据是否有搜索词或过滤条件选择不同的API端点
      const endpoint = (search.trim() || filter !== 'all') ? '/api/admin/search/bracelets' : '/api/admin/bracelets';
      const url = `${endpoint}?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Bracelets data received:', data);
        setBracelets(data.bracelets || []);
        setBraceletTotalPages(data.totalPages || data.pagination?.totalPages || 1);
      } else {
        console.error('Failed to fetch bracelets:', response.status);
        setBracelets([]);
        setBraceletTotalPages(1);
      }
    } catch (error) {
      console.error('获取手环数据失败:', error);
      setBracelets([]);
      setBraceletTotalPages(1);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/admin/activities?limit=5', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('获取活动数据失败:', error);
    }
  };

  // 保存用户编辑
  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
      });
      
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === editingUser.id ? editingUser : user
        ));
        setEditingUser(null);
      } else {
        console.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // 导出数据
  const handleExport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/export?type=${type}&format=csv`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  // 删除用户
  const handleDeleteUser = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        // 刷新用户列表
        await fetchUsers(userPage, debouncedUserSearch);
        await fetchStats();
        setDeletingUser(null);
      } else {
        const error = await response.json();
        console.error('删除用户失败:', error);
        alert(error.error || '删除用户失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      alert('删除用户失败');
    }
  };

  // 初始化数据 - 使用更好的数据管理策略
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // 并行获取所有初始数据，避免冲突
        await Promise.all([
          fetchUsers(1, ''),
          fetchMatches(1, ''),
          fetchBracelets(1, '', 'all'),
          fetchStats(),
          fetchActivities()
        ]);
      } catch (error) {
        console.error('初始化数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, [authToken]);

  // 搜索效果 - 防抖处理，避免频繁请求
  useEffect(() => {
    console.log('User search changed:', debouncedUserSearch);
    if (userPage !== 1) {
      setUserPage(1); // 重置页码，会触发下面的分页效果
    } else {
      fetchUsers(1, debouncedUserSearch); // 直接获取数据
    }
  }, [debouncedUserSearch]);

  useEffect(() => {
    console.log('Match search changed:', debouncedMatchSearch);
    if (matchPage !== 1) {
      setMatchPage(1); // 重置页码，会触发下面的分页效果
    } else {
      fetchMatches(1, debouncedMatchSearch); // 直接获取数据
    }
  }, [debouncedMatchSearch]);

  useEffect(() => {
    console.log('Bracelet search changed:', debouncedBraceletSearch);
    if (braceletPage !== 1) {
      setBraceletPage(1); // 重置页码，会触发下面的分页效果
    } else {
      fetchBracelets(1, debouncedBraceletSearch, braceletFilter); // 直接获取数据
    }
  }, [debouncedBraceletSearch]);

  // 手环过滤效果
  useEffect(() => {
    console.log('Bracelet filter changed:', braceletFilter);
    if (braceletPage !== 1) {
      setBraceletPage(1); // 重置页码，会触发下面的分页效果
    } else {
      fetchBracelets(1, debouncedBraceletSearch, braceletFilter); // 直接获取数据
    }
  }, [braceletFilter]);

  // 分页效果 - 统一处理分页逻辑
  useEffect(() => {
    console.log('User page changed to:', userPage);
    fetchUsers(userPage, debouncedUserSearch);
  }, [userPage]);

  useEffect(() => {
    console.log('Match page changed to:', matchPage);
    fetchMatches(matchPage, debouncedMatchSearch);
  }, [matchPage]);

  useEffect(() => {
    console.log('Bracelet page changed to:', braceletPage);
    fetchBracelets(braceletPage, debouncedBraceletSearch, braceletFilter);
  }, [braceletPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="container mx-auto p-6 space-y-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">管理后台</h1>
            <p className="text-muted-foreground">系统数据管理与监控</p>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            设置
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              概览
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              用户管理
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              匹配记录
            </TabsTrigger>
            <TabsTrigger value="bracelets" className="flex items-center gap-2">
              <Watch className="w-4 h-4" />
              手环管理
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              数据导出
            </TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    活跃用户: {stats.activeUsers}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总匹配数</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMatches}</div>
                  <p className="text-xs text-muted-foreground">
                    成功匹配: {stats.successfulMatches}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">活跃手环</CardTitle>
                  <Watch className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeBracelets}</div>
                  <p className="text-xs text-muted-foreground">
                    总手环: {stats.totalBracelets}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">今日活动</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayActivity || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    新增用户和匹配
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>最近活动</CardTitle>
                  <CardDescription>系统最新的用户活动记录</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.length > 0 ? (
                      activities.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'user_registration' ? 'bg-green-500' :
                            activity.type === 'match_success' ? 'bg-blue-500' :
                            activity.type === 'bracelet_binding' ? 'bg-orange-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.details}</p>
                            <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p className="text-sm">暂无活动记录</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 用户管理标签页 */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">用户管理</h2>
                <p className="text-muted-foreground">管理系统中的所有用户信息</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户名、微信号、NFC UID..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-[300px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchUsers(userPage, debouncedUserSearch)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新
                  </Button>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    添加用户
                  </Button>
                </div>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户信息</TableHead>
                    <TableHead>性别</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>可匹配</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">@{user.wechat_id}</div>
                          <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.gender === 'male' ? 'default' : 'secondary'}>
                          {user.gender === 'male' ? '男' : '女'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? '活跃' : '非活跃'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_matchable ? 'default' : 'outline'}>
                          {user.is_matchable ? '可匹配' : '不可匹配'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingUser(user)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {userTotalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUserPage(Math.max(1, userPage - 1))}
                  disabled={userPage === 1}
                >
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {userPage} 页，共 {userTotalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUserPage(Math.min(userTotalPages, userPage + 1))}
                  disabled={userPage === userTotalPages}
                >
                  下一页
                </Button>
              </div>
            )}
          </TabsContent>

          {/* 匹配记录标签页 */}
          <TabsContent value="matches" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">匹配记录</h2>
                <p className="text-muted-foreground">查看所有用户匹配历史记录</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户名、运势ID..."
                    value={matchSearchQuery}
                    onChange={(e) => setMatchSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-[300px]"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fetchMatches(matchPage, debouncedMatchSearch)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新
                </Button>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>匹配信息</TableHead>
                    <TableHead>用户1</TableHead>
                    <TableHead>用户2</TableHead>
                    <TableHead>运势信息</TableHead>
                    <TableHead>匹配时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => {
                    return (
                      <TableRow key={match.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">匹配 #{match.id}</div>
                            <div className="text-xs text-muted-foreground">
                              用户ID: {match.user1_id} ↔ {match.user2_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{match.user1_name || `用户 ${match.user1_id}`}</div>
                            <div className="text-sm text-muted-foreground">
                              {match.user1_wechat_id ? `@${match.user1_wechat_id}` : `ID: ${match.user1_id}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{match.user2_name || `用户 ${match.user2_id}`}</div>
                            <div className="text-sm text-muted-foreground">
                              {match.user2_wechat_id ? `@${match.user2_wechat_id}` : `ID: ${match.user2_id}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {match.fortune_id ? `运势 #${match.fortune_id}` : '无运势'}
                            </div>
                            {match.fortune_text && (
                              <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={match.fortune_text}>
                                {match.fortune_text}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(match.matched_at).toLocaleString('zh-CN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMatch(match)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>

            {matchTotalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMatchPage(Math.max(1, matchPage - 1))}
                  disabled={matchPage === 1}
                >
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {matchPage} 页，共 {matchTotalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMatchPage(Math.min(matchTotalPages, matchPage + 1))}
                  disabled={matchPage === matchTotalPages}
                >
                  下一页
                </Button>
              </div>
            )}
          </TabsContent>

          {/* 手环管理标签页 */}
          <TabsContent value="bracelets" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">手环管理</h2>
                <p className="text-muted-foreground">管理所有NFC手环设备</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索NFC UID..."
                    value={braceletSearchQuery}
                    onChange={(e) => setBraceletSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-[300px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={braceletFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBraceletFilter('all')}
                  >
                    全部
                  </Button>
                  <Button
                    variant={braceletFilter === 'bound' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBraceletFilter('bound')}
                  >
                    已绑定
                  </Button>
                  <Button
                    variant={braceletFilter === 'unbound' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBraceletFilter('unbound')}
                  >
                    未绑定
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchBracelets(braceletPage, debouncedBraceletSearch, braceletFilter)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新
                  </Button>
                </div>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NFC UID</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>绑定用户</TableHead>
                      <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bracelets.map((bracelet) => (
                    <TableRow key={bracelet.nfc_uid}>
                      <TableCell className="font-mono text-sm">{bracelet.nfc_uid}</TableCell>
                      <TableCell>
                        <Badge variant={bracelet.status === 'bound' ? 'default' : 'secondary'}>
                          {bracelet.status === 'bound' ? '已绑定' : '未绑定'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {bracelet.user_name ? (
                          <div>
                            <p className="font-medium">{bracelet.user_name}</p>
                            <p className="text-xs text-muted-foreground">@{bracelet.user_wechat_id}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">未绑定</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(bracelet.created_at).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBracelet(bracelet)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {braceletTotalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBraceletPage(Math.max(1, braceletPage - 1))}
                  disabled={braceletPage === 1}
                >
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {braceletPage} 页，共 {braceletTotalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBraceletPage(Math.min(braceletTotalPages, braceletPage + 1))}
                  disabled={braceletPage === braceletTotalPages}
                >
                  下一页
                </Button>
              </div>
            )}
          </TabsContent>

          {/* 数据导出标签页 */}
          <TabsContent value="export" className="space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight">数据导出</h2>
              <p className="text-muted-foreground">导出系统数据为CSV格式，便于数据分析和备份</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-blue-500" />
                    用户数据
                  </CardTitle>
                  <CardDescription className="text-sm">
                    导出所有用户信息，包括基本资料和状态
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => handleExport('users')}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    导出用户数据
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-red-500" />
                    匹配记录
                  </CardTitle>
                  <CardDescription className="text-sm">
                    导出所有匹配记录和相关用户信息
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => handleExport('matches')}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    导出匹配记录
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Watch className="w-5 h-5 text-green-500" />
                    手环数据
                  </CardTitle>
                  <CardDescription className="text-sm">
                    导出所有手环设备信息和绑定状态
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => handleExport('bracelets')}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    导出手环数据
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 用户详情模态框 */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>用户详情</DialogTitle>
              <DialogDescription>
                查看用户的详细信息
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">用户ID</label>
                    <p className="text-sm text-muted-foreground">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">姓名</label>
                    <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">性别</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.gender === 'male' ? '男' : '女'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">微信号</label>
                    <p className="text-sm text-muted-foreground">{selectedUser.wechat_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">NFC UID</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.nfc_uid || '未绑定'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">生日</label>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.birthdate || '未设置'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">状态</label>
                    <Badge variant={selectedUser.status === 'active' ? 'default' : 'secondary'}>
                      {selectedUser.status === 'active' ? '活跃' : '非活跃'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">可匹配</label>
                    <Badge variant={selectedUser.is_matchable ? 'default' : 'secondary'}>
                      {selectedUser.is_matchable ? '是' : '否'}
                    </Badge>
                  </div>
                </div>
                {selectedUser.bio && (
                  <div>
                    <label className="text-sm font-medium">个人简介</label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedUser.bio}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">创建时间</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 编辑用户模态框 */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑用户</DialogTitle>
              <DialogDescription>
                修改用户的基本信息
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">姓名</label>
                    <Input
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">微信号</label>
                    <Input
                      value={editingUser.wechat_id}
                      onChange={(e) => setEditingUser({...editingUser, wechat_id: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">生日</label>
                    <Input
                      type="date"
                      value={editingUser.birthdate || ''}
                      onChange={(e) => setEditingUser({...editingUser, birthdate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">状态</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={editingUser.status}
                      onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                    >
                      <option value="active">活跃</option>
                      <option value="inactive">非活跃</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">个人简介</label>
                  <textarea
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={editingUser.bio || ''}
                    onChange={(e) => setEditingUser({...editingUser, bio: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_matchable"
                    checked={editingUser.is_matchable}
                    onChange={(e) => setEditingUser({...editingUser, is_matchable: e.target.checked})}
                  />
                  <label htmlFor="is_matchable" className="text-sm font-medium">
                    允许匹配
                  </label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                取消
              </Button>
              <Button onClick={handleSaveUser}>
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 匹配详情模态框 */}
        <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>匹配详情</DialogTitle>
              <DialogDescription>
                查看匹配记录的详细信息
              </DialogDescription>
            </DialogHeader>
            {selectedMatch && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">匹配ID</label>
                    <p className="text-sm text-muted-foreground">#{selectedMatch.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">运势ID</label>
                    <p className="text-sm text-muted-foreground">{selectedMatch.fortune_id || '无'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">用户1</label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="font-medium">{getUserById(selectedMatch.user1_id)?.name || `用户 ${selectedMatch.user1_id}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {getUserById(selectedMatch.user1_id)?.wechat_id ? 
                          `@${getUserById(selectedMatch.user1_id)?.wechat_id}` : 
                          `ID: ${selectedMatch.user1_id}`
                        }
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">用户2</label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="font-medium">{getUserById(selectedMatch.user2_id)?.name || `用户 ${selectedMatch.user2_id}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {getUserById(selectedMatch.user2_id)?.wechat_id ? 
                          `@${getUserById(selectedMatch.user2_id)?.wechat_id}` : 
                          `ID: ${selectedMatch.user2_id}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">匹配时间</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedMatch.matched_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 手环详情模态框 */}
        <Dialog open={!!selectedBracelet} onOpenChange={() => setSelectedBracelet(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>手环详情</DialogTitle>
              <DialogDescription>
                查看手环设备的详细信息
              </DialogDescription>
            </DialogHeader>
            {selectedBracelet && (
              <div className="grid gap-4 py-4">
                <div>
                  <label className="text-sm font-medium">NFC UID</label>
                  <p className="text-sm text-muted-foreground font-mono">{selectedBracelet.nfc_uid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">状态</label>
                  <Badge variant={selectedBracelet.status === 'bound' ? 'default' : 'secondary'}>
                    {selectedBracelet.status === 'bound' ? '已绑定' : '未绑定'}
                  </Badge>
                </div>
                {selectedBracelet.user_name && (
                  <div>
                    <label className="text-sm font-medium">绑定用户</label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <p className="font-medium">{selectedBracelet.user_name}</p>
                      <p className="text-xs text-muted-foreground">@{selectedBracelet.user_wechat_id}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">创建时间</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedBracelet.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 删除用户确认对话框 */}
        <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除用户</DialogTitle>
              <DialogDescription>
                此操作将永久删除用户及其相关数据，包括匹配记录和手环绑定。此操作不可撤销。
              </DialogDescription>
            </DialogHeader>
            {deletingUser && (
              <div className="py-4">
                <p className="text-sm">
                  确定要删除用户 <strong>{deletingUser.name}</strong> ({deletingUser.wechat_id}) 吗？
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingUser(null)}>
                取消
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deletingUser && handleDeleteUser(deletingUser)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}