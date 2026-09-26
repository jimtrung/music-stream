import { useState, useCallback } from 'react';
import type { Track, Playlist, UserProfile } from '../types';
import { useDebounce } from './useDebounce';

interface SearchResults {
  tracks: Track[];
  playlists: Playlist[];
  users: UserProfile[];
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    tracks: [],
    playlists: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ tracks: [], playlists: [], users: [] });
      return;
    }

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const lowerQuery = searchQuery.toLowerCase();

      setResults({
        tracks: [],
        playlists: [],
        users: [],
      });
      setLoading(false);
    }, 200);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    search,
    debouncedQuery,
  };
}
