import { useState, useEffect, useCallback } from 'react';
import { eventsApi, galleryApi, Event, GalleryImage, handleApiError } from '../services/api';

interface PaginationInfo {
  current: number;
  total: number;
  limit: number;
  count: number;
  totalRecords: number;
}

// Custom hook for fetching events
export const useEvents = (params?: {
  status?: string;
  limit?: number;
  page?: number;
  category?: string;
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsApi.getAll(params);
      setEvents(response.events);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(handleApiError(err));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    pagination,
    refetch: fetchEvents
  };
};

// Custom hook for fetching upcoming events
export const useUpcomingEvents = (limit: number = 10) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsApi.getUpcoming(limit);
      setEvents(response.events);
    } catch (err) {
      setError(handleApiError(err));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchUpcomingEvents
  };
};

// Custom hook for fetching gallery images
export const useGalleryImages = (params?: {
  category?: string;
  limit?: number;
  page?: number;
  sort?: string;
  featured?: boolean;
}) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await galleryApi.getAll(params);
      setImages(response.images);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(handleApiError(err));
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    loading,
    error,
    pagination,
    refetch: fetchImages
  };
};

// Custom hook for fetching gallery categories
export const useGalleryCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await galleryApi.getCategories();
      setCategories(response.categories);
    } catch (err) {
      setError(handleApiError(err));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

// Generic async action hook
export const useAsyncAction = <T extends any[], R>(
  action: (...args: T) => Promise<R>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<R | null>(null);

  const execute = useCallback(
    async (...args: T) => {
      try {
        setLoading(true);
        setError(null);
        const result = await action(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [action]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset
  };
};

// Hook for handling API states with local state fallback
export const useApiWithFallback = <T>(
  apiCall: () => Promise<T>,
  fallbackData: T,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T>(fallbackData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setHasAttempted(true);
      const result = await apiCall();
      setData(result);
      setIsUsingFallback(false);
    } catch (err) {
      console.warn('API call failed, using fallback data:', err);
      setError(handleApiError(err));
      setData(fallbackData);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, [...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isUsingFallback: hasAttempted && isUsingFallback,
    refetch: fetchData
  };
};