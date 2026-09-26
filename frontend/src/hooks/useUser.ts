import { useState, useCallback } from 'react';
import type { UserProfile } from '../types';

export function useUser() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  }, [currentUser]);

  const getUserById = useCallback((userId: string): UserProfile | undefined => {
    return undefined;
  }, []);

  const toggleFollow = useCallback((userId: string) => {
    // In a real app, this would make an API call
    // For now, just log the action
    console.log(`Toggle follow for user: ${userId}`);
  }, []);

  const login = useCallback(async (_email: string, _password: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // setCurrentUser(...) // Should be handled by real auth flow
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return {
    currentUser,
    loading,
    updateProfile,
    getUserById,
    toggleFollow,
    login,
    logout,
  };
}
