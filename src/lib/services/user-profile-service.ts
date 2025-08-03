import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  userId: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'manager' | 'hr' | 'admin';
  department?: string;
  employeeId?: string;
  phoneNumber?: string;
  profileImage?: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProfileData {
  userId: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  role: 'employee' | 'manager' | 'hr' | 'admin';
  department?: string;
  employeeId?: string;
  phoneNumber?: string;
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  department?: string;
  phoneNumber?: string;
  bio?: string;
  profileImage?: string;
}

export class UserProfileService {
  // ユーザープロファイルの型変換
  private static mapFromSupabase(data: any): UserProfile {
    return {
      id: data.id,
      userId: data.user_id,
      tenantId: data.tenant_id,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      department: data.department,
      employeeId: data.employee_id,
      phoneNumber: data.phone_number,
      profileImage: data.profile_image,
      bio: data.bio,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // 現在のユーザープロファイルを取得
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.rpc('get_current_user_profile');

      if (error) {
        console.error('Error fetching current user profile:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      return this.mapFromSupabase(data[0]);
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      return null;
    }
  }

  // ユーザープロファイルを作成
  static async createUserProfile(profileData: CreateUserProfileData): Promise<UserProfile> {
    try {

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: profileData.userId,
          tenant_id: profileData.tenantId,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          role: profileData.role,
          department: profileData.department,
          employee_id: profileData.employeeId,
          phone_number: profileData.phoneNumber,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error creating user profile:', error);
        throw error;
      }

      return this.mapFromSupabase(data);
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  }

  // ユーザープロファイルを更新
  static async updateUserProfile(updates: UpdateUserProfileData): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.rpc('update_user_profile', {
        p_first_name: updates.firstName,
        p_last_name: updates.lastName,
        p_department: updates.department,
        p_phone_number: updates.phoneNumber,
        p_bio: updates.bio,
        p_profile_image: updates.profileImage,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        return null;
      }

      return this.mapFromSupabase(data[0]);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // テナント内の全ユーザープロファイルを取得
  static async getAllUserProfiles(tenantId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data.map(this.mapFromSupabase);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      throw error;
    }
  }

  // 特定のユーザープロファイルを取得
  static async getUserProfileById(id: string, tenantId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.mapFromSupabase(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // ユーザーIDでプロファイルを取得
  static async getUserProfileByUserId(userId: string, tenantId: string): Promise<UserProfile | null> {
    try {
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data

      if (error) {
        console.error('❌ Supabase error fetching user profile:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return this.mapFromSupabase(data);
    } catch (error) {
      console.error('❌ Error fetching user profile by user ID:', error);
      throw error;
    }
  }

  // 部門別ユーザープロファイルを取得
  static async getUserProfilesByDepartment(department: string, tenantId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('department', department)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data.map(this.mapFromSupabase);
    } catch (error) {
      console.error('Error fetching user profiles by department:', error);
      throw error;
    }
  }

  // 役職別ユーザープロファイルを取得
  static async getUserProfilesByRole(role: UserProfile['role'], tenantId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', role)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data.map(this.mapFromSupabase);
    } catch (error) {
      console.error('Error fetching user profiles by role:', error);
      throw error;
    }
  }

  // ユーザープロファイルを非アクティブ化
  static async deactivateUserProfile(id: string, tenantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deactivating user profile:', error);
      throw error;
    }
  }

  // サインアップ時のユーザープロファイル作成
  static async createProfileForNewUser(
    user: User,
    additionalData: {
      firstName: string;
      lastName: string;
      role: UserProfile['role'];
      department?: string;
    },
    tenantId: string
  ): Promise<UserProfile> {
    try {
      
      // まず既存のプロファイルをチェック（より寛容な方法で）
      let existingProfile: UserProfile | null = null;
      try {
        existingProfile = await this.getUserProfileByUserId(user.id, tenantId);
      } catch (error) {
        // 既存プロファイルの取得エラーは無視（新規ユーザーの場合は正常）
      }
      
      if (existingProfile) {
        // 既存のプロファイルがある場合は更新
        const updatedProfile = await this.updateUserProfile({
          firstName: additionalData.firstName,
          lastName: additionalData.lastName,
          department: additionalData.department,
        });
        return updatedProfile || existingProfile;
      }

      // 新しいプロファイルを作成
      const newProfile = await this.createUserProfile({
        userId: user.id,
        tenantId,
        firstName: additionalData.firstName,
        lastName: additionalData.lastName,
        role: additionalData.role,
        department: additionalData.department,
        employeeId: `EMP${Date.now().toString().slice(-6)}`, // 簡易的な従業員ID生成
      });
      
      return newProfile;
    } catch (error) {
      console.error('❌ Error creating profile for new user:', error);
      throw error;
    }
  }
}