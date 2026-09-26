import { useEffect, useState } from "react"
import { authApi } from "../api/auth.api";
import { Profile } from "../types/profile.types";
import { MINIO_BASE_URL } from "../constants/env";

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);  
  
  const signup = async (username: string, email: string, password: string) => {
    await authApi.signup({ username, email, password});
  };
  
  const signin = async (username: string, password: string) => {
    const res = await authApi.signin({ username, password });
    localStorage.setItem("access_token", res.accessToken);
    const [profileData] = await Promise.all([getProfile(), getMe()]);
    return profileData;
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem("access_token");
  };
  
  const getProfile = async () => {
    const profileData = await authApi.profile();
    console.log('Raw Profile Data:', profileData);
    if (profileData) {
      // Ensure userId is present regardless of backend field naming (id vs userId)
      if (!profileData.userId && profileData.id) {
        profileData.userId = profileData.id;
      }
      
      if (profileData.avatarUrl && !profileData.avatarUrl.startsWith('http')) {
        profileData.avatarUrl = MINIO_BASE_URL + profileData.avatarUrl;
      }
      setProfile(profileData);
      return profileData;
    }
    return null;
  };
  
  const updateProfile = async (name?: string, avatar?: any) => {
    const profileData = await authApi.updateProfile({name, avatar});
    setProfile(profileData);
  }

  const getMe = async () => {
    const userData = await authApi.me();
    setUser(userData);
  };
  
  const refresh = async () => {
    const res = await authApi.refresh();
    return res.accessToken;
  }
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (localStorage.getItem("access_token") === null) {
          const accessToken = await refresh();
          localStorage.setItem("access_token", accessToken);
        }
        
        await Promise.all([getProfile(), getMe()]);
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  return {
    loading,
    user,
    profile,
    isAuthenticated: profile,
    signup,
    signin,
    logout,
    getProfile,
    updateProfile,
    refresh
  };
}
