import { useState, useCallback, useMemo } from 'react';
import { Employee, Department } from '@/types/employee';
import { 
  OrgVersion, 
  VersionMetadata, 
  VersionComparison,
  CreateVersionOptions,
  RestoreOptions,
  VersionFilters,
  VersionStatistics
} from '@/types/version';
import { versionManager } from '@/lib/version-manager';

export interface UseVersionManagerOptions {
  autoSave?: boolean;
  saveInterval?: number; // milliseconds
}

export function useVersionManager(options: UseVersionManagerOptions = {}) {
  const [currentVersion, setCurrentVersion] = useState<OrgVersion | null>(null);
  const [versions, setVersions] = useState<OrgVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);

  // 現在のバージョンを読み込み
  const loadCurrentVersion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const version = versionManager.getCurrentVersion();
      setCurrentVersion(version);
    } catch (err) {
      setError(err instanceof Error ? err.message : '現在のバージョンの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // すべてのバージョンを読み込み
  const loadAllVersions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allVersions = versionManager.getAllVersions();
      setVersions(allVersions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'バージョンの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // フィルタリングされたバージョンを読み込み
  const loadFilteredVersions = useCallback(async (filters: VersionFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filteredVersions = versionManager.getFilteredVersions(filters);
      setVersions(filteredVersions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'フィルタリングされたバージョンの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 新しいバージョンを作成
  const createVersion = useCallback(async (
    employees: Employee[],
    departments: Department[],
    options: CreateVersionOptions,
    createdBy: string = 'user'
  ): Promise<OrgVersion | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newVersion = await versionManager.createVersion(
        employees, 
        departments, 
        options, 
        createdBy
      );
      
      if (newVersion) {
        setCurrentVersion(newVersion);
        // バージョンリストを更新
        await loadAllVersions();
      }
      
      return newVersion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'バージョンの作成に失敗しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadAllVersions]);

  // バージョンを取得
  const getVersion = useCallback((versionId: string): OrgVersion | null => {
    return versionManager.getVersion(versionId);
  }, []);

  // バージョン間の比較
  const compareVersions = useCallback(async (
    fromVersionId: string, 
    toVersionId: string
  ): Promise<VersionComparison | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const comparisonResult = versionManager.compareVersions(fromVersionId, toVersionId);
      setComparison(comparisonResult);
      return comparisonResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'バージョン比較に失敗しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // バージョンの復元
  const restoreVersion = useCallback(async (
    options: RestoreOptions
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const restoredVersion = await versionManager.restoreVersion(options);
      
      if (restoredVersion) {
        setCurrentVersion(restoredVersion);
        await loadAllVersions();
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'バージョンの復元に失敗しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadAllVersions]);

  // バージョンの削除
  const deleteVersion = useCallback(async (versionId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = versionManager.deleteVersion(versionId);
      
      if (success) {
        await loadAllVersions();
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'バージョンの削除に失敗しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadAllVersions]);

  // 統計情報を取得
  const getStatistics = useCallback((): VersionStatistics => {
    return versionManager.getStatistics();
  }, []);

  // 自動保存機能
  const createAutoSave = useCallback(async (
    employees: Employee[],
    departments: Department[],
    description?: string
  ): Promise<OrgVersion | null> => {
    if (!options.autoSave) {
      return null;
    }

    const autoSaveOptions: CreateVersionOptions = {
      name: `自動保存 - ${new Date().toLocaleString('ja-JP')}`,
      description: description || '自動保存されたバージョン',
      tags: ['auto-save'],
      autoGenerate: true
    };

    return await createVersion(employees, departments, autoSaveOptions);
  }, [options.autoSave, createVersion]);

  // バージョン履歴のタイムライン生成
  const generateTimeline = useMemo(() => {
    return versions.map(version => ({
      id: version.metadata.id,
      name: version.metadata.name,
      date: version.metadata.createdAt,
      createdBy: version.metadata.createdBy,
      description: version.metadata.description,
      tags: version.metadata.tags,
      isActive: version.metadata.isActive,
      statistics: version.statistics
    })).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [versions]);

  // 最新の変更分析
  const getLatestChanges = useMemo(() => {
    if (versions.length < 2) {
      return null;
    }
    
    const latest = versions[0];
    const previous = versions[1];
    
    return versionManager.compareVersions(previous.metadata.id, latest.metadata.id);
  }, [versions]);

  // バージョン検索機能
  const searchVersions = useCallback((query: string) => {
    return versions.filter(version => 
      version.metadata.name.toLowerCase().includes(query.toLowerCase()) ||
      version.metadata.description?.toLowerCase().includes(query.toLowerCase()) ||
      version.metadata.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }, [versions]);

  // タグによるフィルタリング
  const filterByTags = useCallback((tags: string[]) => {
    return versions.filter(version =>
      tags.some(tag => version.metadata.tags?.includes(tag))
    );
  }, [versions]);

  // 作成者によるフィルタリング
  const filterByCreator = useCallback((createdBy: string) => {
    return versions.filter(version => version.metadata.createdBy === createdBy);
  }, [versions]);

  // 期間によるフィルタリング
  const filterByDateRange = useCallback((from: Date, to: Date) => {
    return versions.filter(version => 
      version.metadata.createdAt >= from && version.metadata.createdAt <= to
    );
  }, [versions]);

  // バージョンのエクスポート（JSON形式）
  const exportVersion = useCallback((versionId: string): string | null => {
    const version = getVersion(versionId);
    if (!version) {
      return null;
    }
    
    return JSON.stringify(version, null, 2);
  }, [getVersion]);

  // バージョンのインポート（JSON形式）
  const importVersion = useCallback(async (versionJson: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const versionData = JSON.parse(versionJson) as OrgVersion;
      
      // バリデーション（簡略化）
      if (!versionData.metadata || !versionData.employees || !versionData.departments) {
        throw new Error('無効なバージョンデータです');
      }
      
      // インポート処理（実際の実装では詳細なバリデーションが必要）
      // ここでは簡略化してバージョンマネージャーに直接追加
      const importedVersion = await createVersion(
        versionData.employees.map(emp => ({
          id: emp.id,
          employeeId: emp.employeeId,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          joinDate: new Date(emp.joinDate),
          department: emp.department,
          position: emp.position,
          managerId: emp.managerId,
          profileImage: emp.profileImage,
          phoneNumber: emp.phoneNumber,
          birthDate: emp.birthDate ? new Date(emp.birthDate) : undefined,
          address: emp.address,
          emergencyContact: emp.emergencyContact,
          skills: emp.skills,
          bio: emp.bio,
          isActive: emp.isActive,
          createdAt: new Date(emp.createdAt),
          updatedAt: new Date(emp.updatedAt)
        })),
        versionData.departments.map(dept => ({
          id: dept.id,
          name: dept.name,
          parentId: dept.parentId,
          managerId: dept.managerId,
          level: dept.level,
          description: dept.description,
          color: dept.color,
          isActive: dept.isActive,
          createdAt: new Date(dept.createdAt),
          updatedAt: new Date(dept.updatedAt)
        })),
        {
          name: `インポート - ${versionData.metadata.name}`,
          description: `インポートされたバージョン: ${versionData.metadata.description}`,
          tags: [...(versionData.metadata.tags || []), 'imported']
        }
      );
      
      return importedVersion !== null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'バージョンのインポートに失敗しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [createVersion]);

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 比較をクリア
  const clearComparison = useCallback(() => {
    setComparison(null);
  }, []);

  return {
    // 状態
    currentVersion,
    versions,
    isLoading,
    error,
    comparison,
    
    // アクション
    loadCurrentVersion,
    loadAllVersions,
    loadFilteredVersions,
    createVersion,
    getVersion,
    compareVersions,
    restoreVersion,
    deleteVersion,
    createAutoSave,
    
    // 分析・検索
    getStatistics,
    generateTimeline,
    getLatestChanges,
    searchVersions,
    filterByTags,
    filterByCreator,
    filterByDateRange,
    
    // インポート・エクスポート
    exportVersion,
    importVersion,
    
    // ユーティリティ
    clearError,
    clearComparison
  };
}