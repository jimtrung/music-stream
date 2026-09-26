import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isExpanded: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  isLoading: boolean;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  isExpanded: false,
  volume: 70,
  progress: 0,
  duration: 0,
  queue: [],
  queueIndex: 0,
  shuffle: false,
  repeat: 'off',
  isLoading: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<Track | null>) => {
      state.currentTrack = action.payload;
      state.progress = 0;
      if (action.payload) {
        state.duration = action.payload.duration || 0;
      }
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    toggleExpanded: (state) => {
      state.isExpanded = !state.isExpanded;
    },
    setExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(100, action.payload));
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setQueue: (state, action: PayloadAction<{ tracks: Track[]; startIndex?: number }>) => {
      state.queue = action.payload.tracks;
      state.queueIndex = action.payload.startIndex ?? 0;
      if (state.queue.length > 0 && state.queueIndex < state.queue.length) {
        state.currentTrack = state.queue[state.queueIndex] ?? null;
        if (state.currentTrack) {
          state.duration = state.currentTrack.duration || 0;
          state.progress = 0;
        }
      }
    },
    playNext: (state) => {
      if (state.queue.length > 0) {
        const nextIndex = (state.queueIndex + 1) % state.queue.length;
        state.queueIndex = nextIndex;
        state.currentTrack = state.queue[nextIndex] ?? null;
        state.progress = 0;
        if (state.currentTrack) {
          state.duration = state.currentTrack.duration || 0;
        }
      }
    },
    playPrevious: (state) => {
      if (state.queue.length > 0) {
        const prevIndex = state.queueIndex === 0 ? state.queue.length - 1 : state.queueIndex - 1;
        state.queueIndex = prevIndex;
        state.currentTrack = state.queue[prevIndex] ?? null;
        state.progress = 0;
        if (state.currentTrack) {
          state.duration = state.currentTrack.duration || 0;
        }
      }
    },
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },
    toggleRepeat: (state) => {
      const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeat);
      state.repeat = modes[(currentIndex + 1) % modes.length] ?? 'off';
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setCurrentTrack,
  togglePlay,
  setIsPlaying,
  toggleExpanded,
  setExpanded,
  setVolume,
  setProgress,
  setQueue,
  playNext,
  playPrevious,
  toggleShuffle,
  toggleRepeat,
  setIsLoading,
} = playerSlice.actions;

// Aliases for compatibility
export const nextTrack = playNext;
export const previousTrack = playPrevious;

export default playerSlice.reducer;
