import { supabase } from '../supabase';
import type { Database } from '../supabase';

export interface OrgVersion {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  isActive: boolean;
  isDraft: boolean;
  tag?: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface VersionSnapshot {
  id: string;
  versionId: string;
  entityType: 'employee' | 'department';
  entityId: string;
  snapshotData: any;
  createdAt: Date;
}

export interface VersionChange {
  id: string;
  versionId: string;
  entityType: 'employee' | 'department';
  entityId: string;
  fieldName: string;
  oldValue: any;
  newValue: any;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: Date;
}

type SupabaseOrgVersion = Database['public']['Tables']['org_versions']['Row'];
type SupabaseVersionSnapshot = Database['public']['Tables']['version_snapshots']['Row'];
type SupabaseVersionChange = Database['public']['Tables']['version_changes']['Row'];

export class VersionService {
  // バージョンデータの型変換
  private static mapVersionFromSupabase(data: SupabaseOrgVersion): OrgVersion {
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      createdBy: data.created_by,
      isActive: data.is_active,
      isDraft: data.is_draft,
      tag: data.tag || undefined,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static mapSnapshotFromSupabase(data: SupabaseVersionSnapshot): VersionSnapshot {
    return {
      id: data.id,
      versionId: data.version_id,
      entityType: data.entity_type,
      entityId: data.entity_id,
      snapshotData: data.snapshot_data,
      createdAt: new Date(data.created_at),
    };
  }

  private static mapChangeFromSupabase(data: SupabaseVersionChange): VersionChange {
    return {
      id: data.id,
      versionId: data.version_id,
      entityType: data.entity_type,
      entityId: data.entity_id,
      fieldName: data.field_name,
      oldValue: data.old_value,
      newValue: data.new_value,
      changeType: data.change_type,
      impactLevel: data.impact_level,
      createdAt: new Date(data.created_at),
    };
  }

  // 全バージョン取得
  static async getAll(tenantId: string): Promise<OrgVersion[]> {
    try {
      const { data, error } = await supabase
        .from('org_versions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(this.mapVersionFromSupabase);
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
  }

  // バージョン取得（ID指定）
  static async getById(id: string, tenantId: string): Promise<OrgVersion | null> {
    try {
      const { data, error } = await supabase
        .from('org_versions')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.mapVersionFromSupabase(data);
    } catch (error) {
      console.error('Error fetching version:', error);
      throw error;
    }
  }

  // アクティブバージョン取得
  static async getActive(tenantId: string): Promise<OrgVersion | null> {
    try {
      const { data, error } = await supabase
        .from('org_versions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.mapVersionFromSupabase(data);
    } catch (error) {
      console.error('Error fetching active version:', error);
      throw error;
    }
  }

  // バージョン作成
  static async create(
    version: Omit<OrgVersion, 'id' | 'createdAt' | 'updatedAt'>,
    tenantId: string
  ): Promise<OrgVersion> {
    try {
      const { data, error } = await supabase
        .from('org_versions')
        .insert({
          tenant_id: tenantId,
          name: version.name,
          description: version.description,
          created_by: version.createdBy,
          is_active: version.isActive,
          is_draft: version.isDraft,
          tag: version.tag,
          metadata: version.metadata,
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapVersionFromSupabase(data);
    } catch (error) {
      console.error('Error creating version:', error);
      throw error;
    }
  }

  // バージョン更新
  static async update(
    id: string,
    updates: Partial<Omit<OrgVersion, 'id' | 'createdAt' | 'updatedAt'>>,
    tenantId: string
  ): Promise<OrgVersion> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.isDraft !== undefined) updateData.is_draft = updates.isDraft;
      if (updates.tag !== undefined) updateData.tag = updates.tag;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

      const { data, error } = await supabase
        .from('org_versions')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return this.mapVersionFromSupabase(data);
    } catch (error) {
      console.error('Error updating version:', error);
      throw error;
    }
  }

  // バージョン削除
  static async delete(id: string, tenantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('org_versions')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting version:', error);
      throw error;
    }
  }

  // アクティブバージョン設定
  static async setActive(id: string, tenantId: string): Promise<void> {
    try {
      // 現在のアクティブバージョンを非アクティブにする
      await supabase
        .from('org_versions')
        .update({ is_active: false })
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      // 指定されたバージョンをアクティブにする
      const { error } = await supabase
        .from('org_versions')
        .update({ is_active: true, is_draft: false })
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting active version:', error);
      throw error;
    }
  }

  // スナップショット作成
  static async createSnapshot(
    versionId: string,
    entityType: 'employee' | 'department',
    entityId: string,
    snapshotData: any,
    tenantId: string
  ): Promise<VersionSnapshot> {
    try {
      const { data, error } = await supabase
        .from('version_snapshots')
        .insert({
          tenant_id: tenantId,
          version_id: versionId,
          entity_type: entityType,
          entity_id: entityId,
          snapshot_data: snapshotData,
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapSnapshotFromSupabase(data);
    } catch (error) {
      console.error('Error creating snapshot:', error);
      throw error;
    }
  }

  // バージョンのスナップショット取得
  static async getSnapshots(versionId: string, tenantId: string): Promise<VersionSnapshot[]> {
    try {
      const { data, error } = await supabase
        .from('version_snapshots')
        .select('*')
        .eq('version_id', versionId)
        .eq('tenant_id', tenantId)
        .order('created_at');

      if (error) throw error;
      return data.map(this.mapSnapshotFromSupabase);
    } catch (error) {
      console.error('Error fetching snapshots:', error);
      throw error;
    }
  }

  // 変更記録
  static async recordChange(
    versionId: string,
    entityType: 'employee' | 'department',
    entityId: string,
    fieldName: string,
    oldValue: any,
    newValue: any,
    changeType: 'CREATE' | 'UPDATE' | 'DELETE',
    impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    tenantId: string
  ): Promise<VersionChange> {
    try {
      const { data, error } = await supabase
        .from('version_changes')
        .insert({
          tenant_id: tenantId,
          version_id: versionId,
          entity_type: entityType,
          entity_id: entityId,
          field_name: fieldName,
          old_value: oldValue,
          new_value: newValue,
          change_type: changeType,
          impact_level: impactLevel,
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapChangeFromSupabase(data);
    } catch (error) {
      console.error('Error recording change:', error);
      throw error;
    }
  }

  // バージョンの変更取得
  static async getChanges(versionId: string, tenantId: string): Promise<VersionChange[]> {
    try {
      const { data, error } = await supabase
        .from('version_changes')
        .select('*')
        .eq('version_id', versionId)
        .eq('tenant_id', tenantId)
        .order('created_at');

      if (error) throw error;
      return data.map(this.mapChangeFromSupabase);
    } catch (error) {
      console.error('Error fetching changes:', error);
      throw error;
    }
  }

  // バージョン比較
  static async compareVersions(
    fromVersionId: string,
    toVersionId: string,
    tenantId: string
  ): Promise<{
    employeeChanges: VersionChange[];
    departmentChanges: VersionChange[];
  }> {
    try {
      const [fromChanges, toChanges] = await Promise.all([
        this.getChanges(fromVersionId, tenantId),
        this.getChanges(toVersionId, tenantId),
      ]);

      // 変更の差分を計算
      const employeeChanges = toChanges.filter(change => 
        change.entityType === 'employee' &&
        !fromChanges.some(fromChange => 
          fromChange.entityType === change.entityType &&
          fromChange.entityId === change.entityId &&
          fromChange.fieldName === change.fieldName
        )
      );

      const departmentChanges = toChanges.filter(change => 
        change.entityType === 'department' &&
        !fromChanges.some(fromChange => 
          fromChange.entityType === change.entityType &&
          fromChange.entityId === change.entityId &&
          fromChange.fieldName === change.fieldName
        )
      );

      return { employeeChanges, departmentChanges };
    } catch (error) {
      console.error('Error comparing versions:', error);
      throw error;
    }
  }
}