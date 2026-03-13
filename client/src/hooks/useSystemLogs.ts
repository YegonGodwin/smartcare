import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/client';

export interface SystemLog {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
  action: string;
  category: string;
  status: string;
  description: string;
  details: Record<string, unknown> | null;
  resourceId: string;
  resourceModel: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface LogsResponse {
  success: boolean;
  message: string;
  data: {
    logs: SystemLog[];
    pagination: Pagination;
  };
}

interface UseSystemLogsOptions {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export function useSystemLogs(options: UseSystemLogsOptions = {}) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page.toString());
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.category) queryParams.append('category', options.category);
      if (options.status) queryParams.append('status', options.status);
      if (options.action) queryParams.append('action', options.action);
      if (options.startDate) queryParams.append('startDate', options.startDate);
      if (options.endDate) queryParams.append('endDate', options.endDate);

      const response = await apiRequest<LogsResponse>(`/system-logs?${queryParams.toString()}`);
      
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system logs');
    } finally {
      setIsLoading(false);
    }
  }, [
    options.page,
    options.limit,
    options.category,
    options.status,
    options.action,
    options.startDate,
    options.endDate
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    pagination,
    isLoading,
    error,
    refetch: fetchLogs
  };
}
