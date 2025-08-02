'use client';

import { useState } from 'react';
import { OrgVersion, VersionMetadata } from '@/types/version';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  GitBranch, 
  Eye, 
  RotateCcw, 
  Download, 
  Trash2,
  Users,
  Building
} from 'lucide-react';

interface VersionTimelineProps {
  versions: OrgVersion[];
  currentVersionId?: string;
  onViewVersion: (version: OrgVersion) => void;
  onRestoreVersion: (version: OrgVersion) => void;
  onDeleteVersion: (version: OrgVersion) => void;
  onExportVersion: (version: OrgVersion) => void;
  onCompareVersions: (fromVersion: OrgVersion, toVersion: OrgVersion) => void;
}

export default function VersionTimeline({
  versions,
  currentVersionId,
  onViewVersion,
  onRestoreVersion,
  onDeleteVersion,
  onExportVersion,
  onCompareVersions
}: VersionTimelineProps) {
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());

  const handleVersionSelect = (versionId: string) => {
    const newSelection = new Set(selectedVersions);
    if (newSelection.has(versionId)) {
      newSelection.delete(versionId);
    } else {
      if (newSelection.size >= 2) {
        newSelection.clear();
      }
      newSelection.add(versionId);
    }
    setSelectedVersions(newSelection);
  };

  const handleCompare = () => {
    if (selectedVersions.size === 2) {
      const [fromId, toId] = Array.from(selectedVersions);
      const fromVersion = versions.find(v => v.metadata.id === fromId);
      const toVersion = versions.find(v => v.metadata.id === toId);
      
      if (fromVersion && toVersion) {
        onCompareVersions(fromVersion, toVersion);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <GitBranch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              バージョンが見つかりません
            </h3>
            <p className="text-gray-500">
              まだバージョンが作成されていません。最初のバージョンを作成してください。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 比較アクション */}
      {selectedVersions.size === 2 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitBranch className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  2つのバージョンが選択されています
                </span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleCompare}>
                  比較する
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedVersions(new Set())}
                >
                  選択解除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* バージョンリスト */}
      <div className="space-y-4">
        {versions.map((version, index) => {
          const isSelected = selectedVersions.has(version.metadata.id);
          const isCurrent = version.metadata.id === currentVersionId;
          const isFirst = index === 0;
          
          return (
            <div key={version.metadata.id} className="relative">
              {/* 接続線 */}
              {!isFirst && (
                <div className="absolute left-6 -top-4 h-4 w-px bg-gray-200" />
              )}
              
              <Card className={`transition-all ${
                isSelected ? 'ring-2 ring-blue-500 border-blue-200' : 
                isCurrent ? 'ring-2 ring-green-500 border-green-200' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* タイムラインドット */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isCurrent ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Clock className={`h-5 w-5 ${
                        isCurrent ? 'text-green-600' : 'text-gray-500'
                      }`} />
                    </div>

                    {/* バージョン情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {version.metadata.name}
                            </h3>
                            {isCurrent && (
                              <Badge variant="default">現在</Badge>
                            )}
                            {version.metadata.tags?.map(tag => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          {version.metadata.description && (
                            <p className="text-sm text-gray-600">
                              {version.metadata.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {getInitials(version.metadata.createdBy)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{version.metadata.createdBy}</span>
                            </div>
                            <span>{formatDate(version.metadata.createdAt)}</span>
                          </div>

                          {/* 統計情報 */}
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1 text-blue-600">
                              <Users className="h-4 w-4" />
                              <span>{version.statistics.totalEmployees}人</span>
                            </div>
                            <div className="flex items-center space-x-1 text-green-600">
                              <Building className="h-4 w-4" />
                              <span>{version.statistics.totalDepartments}部署</span>
                            </div>
                          </div>
                        </div>

                        {/* アクションボタン */}
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => handleVersionSelect(version.metadata.id)}
                          >
                            {isSelected ? '選択中' : '選択'}
                          </Button>
                          
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onViewVersion(version)}
                              title="詳細を表示"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {!isCurrent && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onRestoreVersion(version)}
                                title="このバージョンに復元"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onExportVersion(version)}
                              title="エクスポート"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            
                            {!isCurrent && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDeleteVersion(version)}
                                title="削除"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* 選択ガイド */}
      {selectedVersions.size === 1 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              💡 もう1つのバージョンを選択して2つのバージョンを比較できます
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}