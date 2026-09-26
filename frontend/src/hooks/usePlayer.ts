import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import {
  setCurrentTrack,
  togglePlay,
  setIsPlaying,
  toggleExpanded,
  setVolume,
  setProgress,
  setQueue,
  playNext,
  playPrevious,
  toggleShuffle,
  toggleRepeat,
} from '../store/playerSlice';
import type { Track } from '../types';

export function usePlayer() {
  const dispatch = useDispatch<AppDispatch>();
  const player = useSelector((state: RootState) => state.player);

  return {
    // State
    currentTrack: player.currentTrack,
    isPlaying: player.isPlaying,
    isExpanded: player.isExpanded,
    volume: player.volume,
    progress: player.progress,
    duration: player.duration,
    queue: player.queue,
    queueIndex: player.queueIndex,
    shuffle: player.shuffle,
    repeat: player.repeat,

    // Actions
    playTrack: (track: Track) => dispatch(setCurrentTrack(track)),
    togglePlay: () => dispatch(togglePlay()),
    play: () => dispatch(setIsPlaying(true)),
    pause: () => dispatch(setIsPlaying(false)),
    toggleExpanded: () => dispatch(toggleExpanded()),
    setVolume: (volume: number) => dispatch(setVolume(volume)),
    setProgress: (progress: number) => dispatch(setProgress(progress)),
    setQueue: (tracks: Track[]) => dispatch(setQueue({ tracks })),
    playNext: () => dispatch(playNext()),
    playPrevious: () => dispatch(playPrevious()),
    toggleShuffle: () => dispatch(toggleShuffle()),
    toggleRepeat: () => dispatch(toggleRepeat()),
  };
}
