import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Playlist, Track, UserProfile } from '../types';

interface HomeDataState {
  playlists: Playlist[];
  tracks: Track[];
  artists: UserProfile[];
  hasLoaded: boolean;
}

const initialState: HomeDataState = {
  playlists: [],
  tracks: [],
  artists: [],
  hasLoaded: false,
};

const homeDataSlice = createSlice({
  name: 'homeData',
  initialState,
  reducers: {
    setHomeData: (
      state,
      action: PayloadAction<{ playlists: Playlist[]; tracks: Track[]; artists: UserProfile[] }>
    ) => {
      state.playlists = action.payload.playlists;
      state.tracks = action.payload.tracks;
      state.artists = action.payload.artists;
      state.hasLoaded = true;
    },
    clearHomeData: (state) => {
      state.playlists = [];
      state.tracks = [];
      state.artists = [];
      state.hasLoaded = false;
    },
  },
});

export const { setHomeData, clearHomeData } = homeDataSlice.actions;
export default homeDataSlice.reducer;
