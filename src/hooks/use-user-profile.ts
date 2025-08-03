import { useState, useEffect, useCallback } from 'react';
import { UserProfile, UserProfileService, UpdateUserProfileData } from '@/lib/services/user-profile-service';
import { useAuth } from '@/contexts/auth-context';

export function useUserProfile() {
  const { user, tenantId } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userProfile = await UserProfileService.getCurrentUserProfile();
      setProfile(userProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: UpdateUserProfileData) => {
    try {
      setError(null);
      const updatedProfile = await UserProfileService.updateUserProfile(updates);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}

export function useUserProfiles() {
  const { tenantId } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfiles = await UserProfileService.getAllUserProfiles(tenantId);
      setProfiles(userProfiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profiles');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const getProfilesByDepartment = useCallback(async (department: string) => {
    try {
      return await UserProfileService.getUserProfilesByDepartment(department, tenantId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch profiles by department');
    }
  }, [tenantId]);

  const getProfilesByRole = useCallback(async (role: UserProfile['role']) => {
    try {
      return await UserProfileService.getUserProfilesByRole(role, tenantId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch profiles by role');
    }
  }, [tenantId]);

  const deactivateProfile = useCallback(async (profileId: string) => {
    try {
      await UserProfileService.deactivateUserProfile(profileId, tenantId);
      setProfiles(prev => prev.filter(p => p.id !== profileId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to deactivate profile');
    }
  }, [tenantId]);

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    getProfilesByDepartment,
    getProfilesByRole,
    deactivateProfile,
  };
}

export function useProfileById(profileId: string) {
  const { tenantId } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const userProfile = await UserProfileService.getUserProfileById(profileId, tenantId);
        setProfile(userProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId, tenantId]);

  return { profile, loading, error };
}