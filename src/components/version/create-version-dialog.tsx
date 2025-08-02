'use client';

import { useState } from 'react';
import { CreateVersionOptions } from '@/types/version';
import { Employee, Department } from '@/types/employee';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  GitBranch, 
  Users, 
  Building, 
  Tag, 
  X,
  Clock,
  CheckCircle
} from 'lucide-react';

interface CreateVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  departments: Department[];
  onCreateVersion: (options: CreateVersionOptions) => Promise<void>;
  parentVersionId?: string;
  isLoading?: boolean;
}

export default function CreateVersionDialog({
  open,
  onOpenChange,
  employees,
  departments,
  onCreateVersion,
  parentVersionId,
  isLoading = false
}: CreateVersionDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const activeEmployees = employees.filter(emp => emp.isActive);
  const inactiveEmployees = employees.filter(emp => !emp.isActive);
  const activeDepartments = departments.filter(dept => dept.isActive);
  const inactiveDepartments = departments.filter(dept => !dept.isActive);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    const options: CreateVersionOptions = {
      name: name.trim(),
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      includeInactive,
      parentVersionId
    };

    try {
      await onCreateVersion(options);
      // リセット
      setName('');
      setDescription('');
      setTags([]);
      setCurrentTag('');
      setIncludeInactive(false);
      onOpenChange(false);
    } catch (error) {
      // エラーハンドリングは親コンポーネントで行う
    }
  };

  const generateSuggestedName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `バージョン ${dateStr} ${timeStr}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <span>新しいバージョンを作成</span>
          </DialogTitle>
          <DialogDescription>
            現在の組織状態のスナップショットを作成します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* プレビュー統計 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">含まれるデータ</CardTitle>
              <CardDescription>
                このバージョンに含まれるデータの概要
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {includeInactive ? employees.length : activeEmployees.length}
                    </div>
                    <div className="text-sm text-gray-600">従業員</div>
                    {includeInactive && inactiveEmployees.length > 0 && (
                      <div className="text-xs text-gray-500">
                        (非アクティブ: {inactiveEmployees.length})
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {includeInactive ? departments.length : activeDepartments.length}
                    </div>
                    <div className="text-sm text-gray-600">部署</div>
                    {includeInactive && inactiveDepartments.length > 0 && (
                      <div className="text-xs text-gray-500">
                        (非アクティブ: {inactiveDepartments.length})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* バージョン名 */}
          <div className="space-y-2">
            <Label htmlFor="name">バージョン名 *</Label>
            <div className="flex space-x-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: リリース v1.0"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setName(generateSuggestedName())}
              >
                <Clock className="h-4 w-4 mr-1" />
                自動生成
              </Button>
            </div>
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="このバージョンの変更内容や目的を記述してください"
              rows={3}
            />
          </div>

          {/* タグ */}
          <div className="space-y-2">
            <Label htmlFor="tags">タグ</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="タグを入力してEnterキーで追加"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!currentTag.trim()}
              >
                <Tag className="h-4 w-4 mr-1" />
                追加
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* オプション */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>非アクティブなデータを含める</Label>
                <div className="text-sm text-gray-500">
                  削除された従業員や部署もバージョンに含めます
                </div>
              </div>
              <Switch
                checked={includeInactive}
                onCheckedChange={setIncludeInactive}
              />
            </div>
          </div>

          <Separator />

          {/* アクションボタン */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  作成中...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  バージョンを作成
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}