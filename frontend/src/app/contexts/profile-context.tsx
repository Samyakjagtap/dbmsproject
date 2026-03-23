import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ProfileContextType {
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILE_IMAGE_KEY = 'expense_tracker_profile_image';
const PROFILE_NAME_KEY = 'expense_tracker_profile_name';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileImage, setProfileImageState] = useState<string | null>(() => {
    const stored = localStorage.getItem(PROFILE_IMAGE_KEY);
    return stored || null;
  });

  const [userName, setUserNameState] = useState<string>(() => {
    const stored = localStorage.getItem(PROFILE_NAME_KEY);
    return stored || 'John Doe';
  });

  // Save profile image to localStorage whenever it changes
  useEffect(() => {
    if (profileImage) {
      localStorage.setItem(PROFILE_IMAGE_KEY, profileImage);
    } else {
      localStorage.removeItem(PROFILE_IMAGE_KEY);
    }
  }, [profileImage]);

  // Save user name to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(PROFILE_NAME_KEY, userName);
  }, [userName]);

  const setProfileImage = (image: string | null) => {
    setProfileImageState(image);
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
  };

  const value: ProfileContextType = {
    profileImage,
    setProfileImage,
    userName,
    setUserName,
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
