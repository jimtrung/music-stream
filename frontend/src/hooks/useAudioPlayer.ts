import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { setProgress, setIsPlaying, playNext, setIsLoading } from '../store/playerSlice';
import { getAudioUrl, getCoverUrl } from '../utils/urlUtil';

export function useAudioPlayer(audioRef: React.RefObject<HTMLAudioElement>) {
  const isSeeking = useRef(false);
  const dispatch = useDispatch();
  
  const { currentTrack, isPlaying, volume, repeat, progress } = useSelector(
    (state: RootState) => state.player
  );

  // Use refs to avoid stale closures in event listeners
  const isPlayingRef = useRef(isPlaying);
  const repeatRef = useRef(repeat);
  const lastUpdate = useRef(0);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);

  // Define handlers
  const handleTimeUpdate = useCallback(() => {
    if (isSeeking.current || !audioRef.current) return;
    
    const now = Date.now();
    if (now - lastUpdate.current < 250) return;
    lastUpdate.current = now;

    const audio = audioRef.current;
    if (audio.duration && !isNaN(audio.duration)) {
      const newProgress = (audio.currentTime / audio.duration) * 100;
      dispatch(setProgress(newProgress));
    }
  }, [dispatch, audioRef]);

  const handleTrackEnd = useCallback(() => {
    if (repeatRef.current === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    } else {
      dispatch(playNext());
    }
  }, [dispatch, audioRef]);

  const handleAudioError = useCallback(() => {
    const audio = audioRef.current;
    if (audio?.error) {
      console.error('Audio Playback Error:', audio.error.message, audio.src);
      dispatch(setIsPlaying(false));
      dispatch(setIsLoading(false));
    }
  }, [dispatch, audioRef]);

  // Initialize and bind events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.crossOrigin = 'anonymous';

    const handleWaiting = () => dispatch(setIsLoading(true));
    const handlePlaying = () => dispatch(setIsLoading(false));
    const handleCanPlay = () => {
      if (isPlayingRef.current && audio.paused) {
        audio.play().catch(err => console.warn('Autoplay prevented:', err.message));
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleTrackEnd);
      audio.removeEventListener('error', handleAudioError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [handleTimeUpdate, handleTrackEnd, handleAudioError, dispatch, audioRef]);

  // Synchronize Source and Playback State
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const audioUrl = getAudioUrl(currentTrack.audioUrl);
    
    // 1. Source Sync
    if (audioUrl && audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.load();
      
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artistName || 'Unknown Artist',
          album: 'Music Streaming',
          artwork: [{ 
            src: getCoverUrl(currentTrack.coverUrl) || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=512&h=512&auto=format&fit=crop', 
            sizes: '512x512', 
            type: 'image/jpeg' 
          }]
        });
      }
    }

    // 2. Playback State Sync
    if (isPlaying) {
      if (audio.paused && audio.readyState >= 2) { // HAVE_CURRENT_DATA or better
        audio.play().catch(() => {});
      }
    } else {
      if (!audio.paused) audio.pause();
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [currentTrack?.id, currentTrack?.audioUrl, isPlaying, audioRef]);

  // Volume Sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume, audioRef]);

  // Progress Sync (Seeking from external source)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || isSeeking.current) return;

    const targetTime = (progress / 100) * audio.duration;
    if (Math.abs(audio.currentTime - targetTime) > 3.0) {
      audio.currentTime = targetTime;
    }
  }, [progress, audioRef]);

  // Cross-Tab Playback Sync
  useEffect(() => {
    const channel = new BroadcastChannel('music_streaming_player');
    
    channel.onmessage = (event) => {
      if (event.data.type === 'PLAYING_START') {
        // Another tab started playing, pause this one
        if (isPlaying) {
          dispatch(setIsPlaying(false));
        }
      }
    };

    if (isPlaying) {
      channel.postMessage({ type: 'PLAYING_START' });
    }

    return () => channel.close();
  }, [isPlaying, dispatch]);

  const seekTo = (percentage: number) => {
    if (audioRef.current && audioRef.current.duration) {
      isSeeking.current = true;
      audioRef.current.currentTime = (percentage / 100) * audioRef.current.duration;
      dispatch(setProgress(percentage));
      setTimeout(() => { isSeeking.current = false; }, 200);
    }
  };

  return { seekTo };
}

