import { describe, it, expect } from 'vitest';
import playerReducer, {
  togglePlay,
  setIsPlaying,
  setCurrentTrack,
  playNext,
  playPrevious,
  setQueue,
} from './playerSlice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Track } from '../types';

// Mock track data
const mockTrack: Track = {
  id: '1',
  title: 'Test Song',
  artistName: 'Test Artist',
  audioUrl: 'http://example.com/audio.mp3',
  coverUrl: 'http://example.com/cover.jpg',
  duration: 180,
};

const mockTrack2: Track = {
  id: '2',
  title: 'Test Song 2',
  artistName: 'Test Artist 2',
  audioUrl: 'http://example.com/audio2.mp3',
  coverUrl: 'http://example.com/cover2.jpg',
  duration: 200,
};

describe('playerSlice - Play/Pause Logic', () => {
  it('should toggle play from false to true', () => {
    const initialState = playerReducer(undefined, { type: '' });
    expect(initialState.isPlaying).toBe(false);

    const newState = playerReducer(initialState, togglePlay());
    expect(newState.isPlaying).toBe(true);
  });

  it('should toggle play from true to false', () => {
    const initialState = playerReducer(undefined, { type: '' });
    let state = playerReducer(initialState, togglePlay());
    expect(state.isPlaying).toBe(true);

    state = playerReducer(state, togglePlay());
    expect(state.isPlaying).toBe(false);
  });

  it('should set isPlaying to true', () => {
    const initialState = playerReducer(undefined, { type: '' });
    const newState = playerReducer(initialState, setIsPlaying(true));
    expect(newState.isPlaying).toBe(true);
  });

  it('should set isPlaying to false', () => {
    const initialState = playerReducer(undefined, { type: '' });
    let state = playerReducer(initialState, setIsPlaying(true));
    expect(state.isPlaying).toBe(true);

    state = playerReducer(state, setIsPlaying(false));
    expect(state.isPlaying).toBe(false);
  });

  it('should set current track and reset progress', () => {
    const initialState = playerReducer(undefined, { type: '' });
    const newState = playerReducer(
      initialState,
      setCurrentTrack(mockTrack)
    );

    expect(newState.currentTrack).toEqual(mockTrack);
    expect(newState.progress).toBe(0);
    expect(newState.duration).toBe(180);
  });

  it('should play next track in queue', () => {
    const initialState = playerReducer(undefined, { type: '' });
    let state = playerReducer(
      initialState,
      setQueue({
        tracks: [mockTrack, mockTrack2],
        startIndex: 0,
      })
    );
    expect(state.currentTrack?.id).toBe('1');
    expect(state.queueIndex).toBe(0);

    state = playerReducer(state, playNext());
    expect(state.currentTrack?.id).toBe('2');
    expect(state.queueIndex).toBe(1);
  });

  it('should play previous track in queue', () => {
    const initialState = playerReducer(undefined, { type: '' });
    let state = playerReducer(
      initialState,
      setQueue({
        tracks: [mockTrack, mockTrack2],
        startIndex: 1,
      })
    );
    expect(state.currentTrack?.id).toBe('2');
    expect(state.queueIndex).toBe(1);

    state = playerReducer(state, playPrevious());
    expect(state.currentTrack?.id).toBe('1');
    expect(state.queueIndex).toBe(0);
  });

  it('should handle play/pause when track is selected', () => {
    const initialState = playerReducer(undefined, { type: '' });
    
    // Select track
    let state = playerReducer(initialState, setCurrentTrack(mockTrack));
    expect(state.currentTrack).toEqual(mockTrack);
    expect(state.isPlaying).toBe(false);

    // Start playing
    state = playerReducer(state, setIsPlaying(true));
    expect(state.isPlaying).toBe(true);

    // Pause
    state = playerReducer(state, togglePlay());
    expect(state.isPlaying).toBe(false);

    // Resume
    state = playerReducer(state, togglePlay());
    expect(state.isPlaying).toBe(true);
  });

  it('should wrap around when playing next on last track', () => {
    const initialState = playerReducer(undefined, { type: '' });
    let state = playerReducer(
      initialState,
      setQueue({
        tracks: [mockTrack, mockTrack2],
        startIndex: 1,
      })
    );
    expect(state.queueIndex).toBe(1);

    state = playerReducer(state, playNext());
    expect(state.queueIndex).toBe(0); // Should wrap to beginning
    expect(state.currentTrack?.id).toBe('1');
  });

  it('should wrap around when playing previous on first track', () => {
    const initialState = playerReducer(undefined, { type: '' });
    let state = playerReducer(
      initialState,
      setQueue({
        tracks: [mockTrack, mockTrack2],
        startIndex: 0,
      })
    );
    expect(state.queueIndex).toBe(0);

    state = playerReducer(state, playPrevious());
    expect(state.queueIndex).toBe(1); // Should wrap to end
    expect(state.currentTrack?.id).toBe('2');
  });
});

// Helper function imported from playerSlice
import { setQueue } from './playerSlice';
