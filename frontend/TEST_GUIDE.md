# Test Play/Pause Logic

## Files Created

### 1. `src/store/playerSlice.test.ts`
Tests for the Redux reducer logic:
- `togglePlay()` - Toggle play state
- `setIsPlaying()` - Set play state directly
- `setCurrentTrack()` - Set current track
- `playNext()` - Play next track
- `playPrevious()` - Play previous track
- Queue wrapping behavior

### 2. `src/components/Player/PlayerBar.test.tsx`
Tests for the PlayerBar component UI:
- Render empty player when no track
- Render play button when paused
- Render pause button when playing
- Handle play/pause button clicks
- Display track info

## How to Run Tests

### Install dependencies (if needed)
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Run all tests
```bash
npm run test
```

### Run specific test file
```bash
npm run test playerSlice.test.ts
npm run test PlayerBar.test.tsx
```

### Run tests in watch mode
```bash
npm run test -- --watch
```

## Test Coverage

Current tests cover:
- ✅ Toggle play/pause state
- ✅ Set play state directly
- ✅ Track selection and progress reset
- ✅ Queue navigation (next/previous)
- ✅ Queue wrapping (first/last track)
- ✅ UI rendering based on playback state
- ✅ Button click handling

## Flow Diagram

```
PlayerBar (UI)
    ↓
dispatch(togglePlay())
    ↓
playerSlice reducer
    ↓
state.isPlaying changes
    ↓
useAudioPlayer hook detects change
    ↓
audio.play() or audio.pause()
```

## Next Steps

1. Run tests to verify play/pause logic
2. Check for any failing tests
3. Update test cases as needed when modifying play/pause logic
