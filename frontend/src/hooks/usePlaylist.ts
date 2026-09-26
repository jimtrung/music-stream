import { useState, useCallback } from 'react';
import type { Playlist, Track } from '../types';

export function usePlaylist(playlistId?: string) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlaylist = useCallback((id: string) => {
    setLoading(true);
    // Real API implementation needed
    setLoading(false);
  }, []);

  const addTrack = useCallback((track: Track) => {
    if (playlist && !playlist.trackIds.includes(track.id)) {
      setPlaylist({
        ...playlist,
        trackIds: [...playlist.trackIds, track.id],
      });
      setTracks((prev) => [...prev, track]);
    }
  }, [playlist]);

  const removeTrack = useCallback((trackId: string) => {
    if (playlist) {
      setPlaylist({
        ...playlist,
        trackIds: playlist.trackIds.filter((id) => id !== trackId),
      });
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    }
  }, [playlist]);

  return {
    playlist,
    tracks,
    loading,
    loadPlaylist,
    addTrack,
    removeTrack,
    allPlaylists: [],
  };
}
