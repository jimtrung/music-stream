export function syncPlayback(audio, isPlaying) {
  if (isPlaying) {
    if (audio.paused && audio.readyState >= 2) {
      audio.play();
    }
  } else {
    if (!audio.paused) {
      audio.pause();
    }
  }
}