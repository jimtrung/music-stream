import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ContextMenuItem } from '../types';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  type: string;
  targetId: string;
  items: ContextMenuItem[];
}

interface UserPlaylist {
  id: string;
  name: string;
  trackIds: string[];
}

interface UIState {
  theme: 'dark' | 'light';
  contextMenu: ContextMenuState;
  sidebarCollapsed: boolean;
  likedSongIds: string[];
  userPlaylists: UserPlaylist[];
  searchQuery: string;
  activeSearchFilter: string;
}

const initialState: UIState = {
  theme: 'dark',
  contextMenu: {
    isOpen: false,
    x: 0,
    y: 0,
    type: '',
    targetId: '',
    items: [],
  },
  sidebarCollapsed: false,
  likedSongIds: [],
  userPlaylists: [],
  searchQuery: '',
  activeSearchFilter: 'all',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', state.theme);
    },
    openContextMenu: (state, action: PayloadAction<{ x: number; y: number; type: string; targetId: string; items?: ContextMenuItem[] }>) => {
      state.contextMenu = {
        isOpen: true,
        x: action.payload.x,
        y: action.payload.y,
        type: action.payload.type,
        targetId: action.payload.targetId,
        items: action.payload.items || [],
      };
    },
    closeContextMenu: (state) => {
      state.contextMenu.isOpen = false;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const trackId = action.payload;
      const index = state.likedSongIds.indexOf(trackId);
      if (index === -1) {
        state.likedSongIds.push(trackId);
      } else {
        state.likedSongIds.splice(index, 1);
      }
    },
    addToPlaylist: (state, action: PayloadAction<{ playlistId: string; trackId: string }>) => {
      const { playlistId, trackId } = action.payload;
      const playlist = state.userPlaylists.find(p => p.id === playlistId);
      if (playlist && !playlist.trackIds.includes(trackId)) {
        playlist.trackIds.push(trackId);
      }
    },
    createUserPlaylist: (state, action: PayloadAction<{ name: string }>) => {
      state.userPlaylists.push({
        id: `up${Date.now()}`,
        name: action.payload.name,
        trackIds: [],
      });
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setActiveSearchFilter: (state, action: PayloadAction<string>) => {
      state.activeSearchFilter = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  openContextMenu,
  closeContextMenu,
  toggleSidebar,
  toggleLike,
  addToPlaylist,
  createUserPlaylist,
  setSearchQuery,
  setActiveSearchFilter,
} = uiSlice.actions;

export default uiSlice.reducer;
