'use client';

import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GitBranch, UserCheck, Building } from 'lucide-react';

export default function Dashboard() {
  const { data: session } = useSession();

  const stats = [
    {
      title: '総従業員数',
      value: '247',
      description: '先月より+12人',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: '部署数',
      value: '8',
      description: '新部署2部署',
      icon: Building,
      color: 'bg-green-500',
    },
    {
      title: 'アクティブ管理者',
      value: '24',
      description: '+3昇進',
      icon: UserCheck,
      color: 'bg-purple-500',
    },
    {
      title: '組織レベル',
      value: '5',
      description: '階層の深さ',
      icon: GitBranch,
      color: 'bg-orange-500',
    },
  ];

  const recentActivities = [
    {
      action: '従業員追加',
      details: 'John Doeがエンジニアリング部に入社しました',
      time: '2時間前',
      type: 'success',
    },
    {
      action: '部署作成',
      details: 'データサイエンスチームが設立されました',
      time: '1日前',
      type: 'info',
    },
    {
      action: '職位変更',
      details: 'Sarah Smithがシニアマネージャーに昇進しました',
      time: '2日前',
      type: 'success',
    },
    {
      action: '従業員異動',
      details: 'Mike Johnsonがマーケティング部に異動しました',
      time: '3日前',
      type: 'warning',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600">
            おかえりなさい、{session?.user?.name}さん
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>最近のアクティビティ</CardTitle>
              <CardDescription>
                組織の最新の変更
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Badge
                      variant={
                        activity.type === 'success'
                          ? 'default'
                          : activity.type === 'warning'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="mt-1"
                    >
                      {activity.action}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.details}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
              <CardDescription>
                よく使用されるタスク
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">新しい従業員を追加</div>
                  <div className="text-sm text-gray-600">
                    新しいチームメンバーを登録
                  </div>
                </button>
                <button className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">組織図を更新</div>
                  <div className="text-sm text-gray-600">
                    報告構造を変更
                  </div>
                </button>
                <button className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="font-medium">レポートを生成</div>
                  <div className="text-sm text-gray-600">
                    従業員データをエクスポート
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}