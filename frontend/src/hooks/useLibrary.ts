import { useState, useCallback } from 'react';
import type { Playlist, Track } from '../types';

export function useLibrary() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);

  const createPlaylist = useCallback((name: string, description: string = '') => {
    const newPlaylist: Playlist = {
      id: `p${Date.now()}`,
      name,
      description,
      cover: 'linear-gradient(135deg, #1DB954 0%, #191414 100%)',
      owner: 'You',
      ownerId: 'u1',
      trackIds: [],
      followers: 0,
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    return newPlaylist;
  }, []);

  const addToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId && !p.trackIds.includes(trackId)
          ? { ...p, trackIds: [...p.trackIds, trackId] }
          : p
      )
    );
  }, []);

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) }
          : p
      )
    );
  }, []);

  const toggleLike = useCallback((track: Track) => {
    setLikedSongs((prev) => {
      const isLiked = prev.some((t) => t.id === track.id);
      if (isLiked) {
        return prev.filter((t) => t.id !== track.id);
      }
      return [...prev, track];
    });
  }, []);

  const isLiked = useCallback(
    (trackId: string) => likedSongs.some((t) => t.id === trackId),
    [likedSongs]
  );

  return {
    playlists,
    likedSongs,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    toggleLike,
    isLiked,
  };
}
