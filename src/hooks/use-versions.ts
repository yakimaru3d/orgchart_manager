import { useState, useEffect, useCallback } from 'react';
import { 
  OrgVersion, 
  VersionSnapshot, 
  VersionChange, 
  VersionService 
} from '@/lib/services/version-service';
import { useAuth } from '@/contexts/auth-context';

export function useVersions() {
  const { tenantId } = useAuth();
  const [versions, setVersions] = useState<OrgVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await VersionService.getAll(tenantId);
      setVersions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch versions');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const createVersion = useCallback(async (version: Omit<OrgVersion, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newVersion = await VersionService.create(version, tenantId);
      setVersions(prev => [newVersion, ...prev]);
      return newVersion;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create version');
    }
  }, [tenantId]);

  const updateVersion = useCallback(async (
    id: string, 
    updates: Partial<Omit<OrgVersion, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    try {
      const updatedVersion = await VersionService.update(id, updates, tenantId);
      setVersions(prev => prev.map(v => v.id === id ? updatedVersion : v));
      return updatedVersion;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update version');
    }
  }, [tenantId]);

  const deleteVersion = useCallback(async (id: string) => {
    try {
      await VersionService.delete(id, tenantId);
      setVersions(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete version');
    }
  }, [tenantId]);

  const setActiveVersion = useCallback(async (id: string) => {
    try {
      await VersionService.setActive(id, tenantId);
      setVersions(prev => prev.map(v => ({ ...v, isActive: v.id === id })));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to set active version');
    }
  }, [tenantId]);

  const activeVersion = versions.find(v => v.isActive);

  return {
    versions,
    activeVersion,
    loading,
    error,
    fetchVersions,
    createVersion,
    updateVersion,
    deleteVersion,
    setActiveVersion,
  };
}

export function useVersion(id: string) {
  const { tenantId } = useAuth();
  const [version, setVersion] = useState<OrgVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await VersionService.getById(id, tenantId);
        setVersion(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch version');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVersion();
    }
  }, [id, tenantId]);

  return { version, loading, error };
}

export function useVersionSnapshots(versionId: string) {
  const { tenantId } = useAuth();
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await VersionService.getSnapshots(versionId, tenantId);
      setSnapshots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch snapshots');
    } finally {
      setLoading(false);
    }
  }, [versionId, tenantId]);

  useEffect(() => {
    if (versionId) {
      fetchSnapshots();
    }
  }, [fetchSnapshots, versionId]);

  const createSnapshot = useCallback(async (
    entityType: 'employee' | 'department',
    entityId: string,
    snapshotData: any
  ) => {
    try {
      const newSnapshot = await VersionService.createSnapshot(
        versionId, 
        entityType, 
        entityId, 
        snapshotData, 
        tenantId
      );
      setSnapshots(prev => [...prev, newSnapshot]);
      return newSnapshot;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create snapshot');
    }
  }, [versionId, tenantId]);

  return {
    snapshots,
    loading,
    error,
    fetchSnapshots,
    createSnapshot,
  };
}

export function useVersionChanges(versionId: string) {
  const { tenantId } = useAuth();
  const [changes, setChanges] = useState<VersionChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChanges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await VersionService.getChanges(versionId, tenantId);
      setChanges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch changes');
    } finally {
      setLoading(false);
    }
  }, [versionId, tenantId]);

  useEffect(() => {
    if (versionId) {
      fetchChanges();
    }
  }, [fetchChanges, versionId]);

  const recordChange = useCallback(async (
    entityType: 'employee' | 'department',
    entityId: string,
    fieldName: string,
    oldValue: any,
    newValue: any,
    changeType: 'CREATE' | 'UPDATE' | 'DELETE',
    impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ) => {
    try {
      const newChange = await VersionService.recordChange(
        versionId,
        entityType,
        entityId,
        fieldName,
        oldValue,
        newValue,
        changeType,
        impactLevel,
        tenantId
      );
      setChanges(prev => [...prev, newChange]);
      return newChange;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to record change');
    }
  }, [versionId, tenantId]);

  return {
    changes,
    loading,
    error,
    fetchChanges,
    recordChange,
  };
}

export function useVersionComparison(fromVersionId: string, toVersionId: string) {
  const { tenantId } = useAuth();
  const [comparison, setComparison] = useState<{
    employeeChanges: VersionChange[];
    departmentChanges: VersionChange[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await VersionService.compareVersions(fromVersionId, toVersionId, tenantId);
        setComparison(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to compare versions');
      } finally {
        setLoading(false);
      }
    };

    if (fromVersionId && toVersionId) {
      fetchComparison();
    }
  }, [fromVersionId, toVersionId, tenantId]);

  return { comparison, loading, error };
}