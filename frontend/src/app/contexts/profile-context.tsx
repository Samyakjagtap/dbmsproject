import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { userApi, authApi } from '../services/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  balance_limit?: number;
}

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  userName: string;
  userEmail: string;
  setUserName: (name: string) => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImageState] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!authApi.isAuthenticated()) {
      setProfile(null);
      setProfileImageState(null);
      return;
    }

    setLoading(true);
    try {
      const data = await userApi.getProfile();
      setProfile(data);
      if (data.avatar_url) {
        setProfileImageState(`http://localhost:5000${data.avatar_url}`);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const setProfileImage = async (image: string | null) => {
    setProfileImageState(image);
  };

  const setUserName = async (name: string) => {
    if (!profile) return;
    try {
      await userApi.updateProfile({ name });
      setProfile(prev => prev ? { ...prev, name } : null);
    } catch (err) {
      console.error('Failed to update name:', err);
      throw err;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      await userApi.updateProfile(data);
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const value: ProfileContextType = {
    profile,
    loading,
    profileImage,
    setProfileImage,
    userName: profile?.name || '',
    userEmail: profile?.email || '',
    setUserName,
    refreshProfile,
    updateProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
