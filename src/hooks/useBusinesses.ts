import { useState, useEffect, useCallback } from 'react';
import type { Business } from '@/data/directory';

interface UseBusinessesOptions {
  town?: string;
  type?: string;
  search?: string;
}

interface UseBusinessesResult {
  businesses: Business[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Global cache
const cache = new Map<string, { data: Business[]; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

function getCacheKey(options: UseBusinessesOptions): string {
  return JSON.stringify(options);
}

export function useBusinesses(options: UseBusinessesOptions = {}): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = getCacheKey(options);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setBusinesses(cached.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.town) params.append('town', options.town);
      if (options.type) params.append('type', options.type);
      if (options.search) params.append('search', options.search);

      const url = `/api/directory/businesses${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }

      const data = await response.json();
      const fetchedBusinesses = data.businesses || [];

      // Update cache
      cache.set(cacheKey, { data: fetchedBusinesses, timestamp: Date.now() });

      setBusinesses(fetchedBusinesses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Try to use stale cache on error
      const staleCache = cache.get(cacheKey);
      if (staleCache) {
        setBusinesses(staleCache.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, options.town, options.type, options.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { businesses, isLoading, error, refetch: fetchData };
}

export function useBusiness(slug: string | undefined): {
  business: Business | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/directory/businesses?slug=${encodeURIComponent(slug)}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Business not found');
          setBusiness(null);
          return;
        }
        throw new Error('Failed to fetch business');
      }

      const data = await response.json();
      setBusiness(data.business || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { business, isLoading, error, refetch: fetchData };
}

// Clear all cached data (call after admin edits)
export function clearBusinessesCache(): void {
  cache.clear();
}
