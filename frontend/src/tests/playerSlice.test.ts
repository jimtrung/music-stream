import { describe, it, expect } from 'vitest';
import playerReducer, { setCurrentTrack, togglePlay, setVolume, setQueue, playNext } from '../store/playerSlice';

describe('playerSlice', () => {
  it('sets currentTrack and duration when a track is selected', () => {
    const track = { id: '1', title: 'song', duration: 120 } as any;
    const nextState = playerReducer(undefined, setCurrentTrack(track));
    expect(nextState.currentTrack).toEqual(track);
    expect(nextState.duration).toBe(120);
  });

  it('clears currentTrack when null is selected', () => {
    const nextState = playerReducer(undefined, setCurrentTrack(null));
    expect(nextState.currentTrack).toBeNull();
  });

  it('toggles play state', () => {
    const initial = playerReducer(undefined, { type: 'unknown' });
    const playing = playerReducer(initial, togglePlay());
    expect(playing.isPlaying).toBe(true);
    expect(playerReducer(playing, togglePlay()).isPlaying).toBe(false);
  });

  it('clamps volume to the 0-100 range', () => {
    expect(playerReducer(undefined, setVolume(50)).volume).toBe(50);
    expect(playerReducer(undefined, setVolume(-10)).volume).toBe(0);
    expect(playerReducer(undefined, setVolume(200)).volume).toBe(100);
  });

  it('advances to the next track in the queue', () => {
    const trackA = { id: 'a', title: 'A', duration: 100 } as any;
    const trackB = { id: 'b', title: 'B', duration: 200 } as any;
    let state = playerReducer(undefined, setQueue({ tracks: [trackA, trackB] }));
    state = playerReducer(state, playNext());
    expect(state.currentTrack).toEqual(trackB);
    expect(state.queueIndex).toBe(1);
  });
});
