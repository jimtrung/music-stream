import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PlayerBar from './PlayerBar';
import playerReducer from '../../store/playerSlice';
import uiReducer from '../../store/uiSlice';
import type { Track } from '../../types';

// Mock track
const mockTrack: Track = {
  id: '1',
  title: 'Test Song',
  artistName: 'Test Artist',
  audioUrl: 'http://example.com/audio.mp3',
  coverUrl: 'http://example.com/cover.jpg',
  duration: 180,
};

// Create a test store
const createTestStore = (initialState?: any) => {
  return configureStore({
    reducer: {
      player: playerReducer,
      ui: uiReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (ui: React.ReactNode, store: any) =>
  render(
    <MemoryRouter>
      <Provider store={store}>{ui}</Provider>
    </MemoryRouter>
  );

afterEach(() => {
  cleanup();
});

describe('PlayerBar - Play/Pause UI', () => {
  it('should render empty player when no track is selected', () => {
    const store = createTestStore();
    renderWithProviders(<PlayerBar />, store);

    expect(screen.getByText(/Select a song to start playing/i)).toBeTruthy();
  });

  it('should render play button when not playing', () => {
    const store = createTestStore({
      player: {
        currentTrack: mockTrack,
        isPlaying: false,
        progress: 0,
        volume: 70,
        shuffle: false,
        repeat: 'off' as const,
        isLoading: false,
        isExpanded: false,
        duration: 180,
        queue: [mockTrack],
        queueIndex: 0,
      },
      ui: {
        likedSongIds: [],
        activeSearchFilter: 'all',
        contextMenu: { isOpen: false, x: 0, y: 0, type: '', targetId: '' },
        userPlaylists: [],
      },
    });

    renderWithProviders(<PlayerBar />, store);

    const playButton = screen.getByTitle('Play');
    expect(playButton).toBeTruthy();
  });

  it('should render pause button when playing', () => {
    const store = createTestStore({
      player: {
        currentTrack: mockTrack,
        isPlaying: true,
        progress: 0,
        volume: 70,
        shuffle: false,
        repeat: 'off' as const,
        isLoading: false,
        isExpanded: false,
        duration: 180,
        queue: [mockTrack],
        queueIndex: 0,
      },
      ui: {
        likedSongIds: [],
        activeSearchFilter: 'all',
        contextMenu: { isOpen: false, x: 0, y: 0, type: '', targetId: '' },
        userPlaylists: [],
      },
    });

    renderWithProviders(<PlayerBar />, store);

    const pauseButton = screen.getByTitle('Pause');
    expect(pauseButton).toBeTruthy();
  });

  it('should dispatch togglePlay action when play/pause button is clicked', () => {
    const store = createTestStore({
      player: {
        currentTrack: mockTrack,
        isPlaying: false,
        progress: 0,
        volume: 70,
        shuffle: false,
        repeat: 'off' as const,
        isLoading: false,
        isExpanded: false,
        duration: 180,
        queue: [mockTrack],
        queueIndex: 0,
      },
      ui: {
        likedSongIds: [],
        activeSearchFilter: 'all',
        contextMenu: { isOpen: false, x: 0, y: 0, type: '', targetId: '' },
        userPlaylists: [],
      },
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { rerender } = renderWithProviders(<PlayerBar />, store);

    const playButton = screen.getByTitle('Play');
    fireEvent.click(playButton);

    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('should display track info when track is playing', () => {
    const store = createTestStore({
      player: {
        currentTrack: mockTrack,
        isPlaying: true,
        progress: 50,
        volume: 70,
        shuffle: false,
        repeat: 'off' as const,
        isLoading: false,
        isExpanded: false,
        duration: 180,
        queue: [mockTrack],
        queueIndex: 0,
      },
      ui: {
        likedSongIds: [],
        activeSearchFilter: 'all',
        contextMenu: { isOpen: false, x: 0, y: 0, type: '', targetId: '' },
        userPlaylists: [],
      },
    });

    renderWithProviders(<PlayerBar />, store);

    expect(screen.getByText('Test Song')).toBeTruthy();
    expect(screen.getByText('Test Artist')).toBeTruthy();
  });
});
