import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/client';
import type { User } from '../model';

export function useUsers() {
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ data: User[] }>('/users/staff');
      setStaff(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff list');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAccess = async (userId: string, data: { role?: string; isActive?: boolean; department?: string }) => {
    try {
      await apiRequest(`/users/${userId}/access`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      await fetchStaff();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update user access' 
      };
    }
  };

  const deleteUserAccount = async (userId: string) => {
    try {
      await apiRequest(`/users/${userId}`, {
        method: 'DELETE',
      });
      await fetchStaff();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete user' 
      };
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return {
    staff,
    isLoading,
    error,
    refetch: fetchStaff,
    updateAccess,
    deleteUserAccount,
  };
}
