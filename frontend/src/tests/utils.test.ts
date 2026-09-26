import { describe, it, expect } from 'vitest';
import { formatDuration } from '../utils/format';
import { getAudioUrl, getCoverUrl } from '../utils/urlUtil';

describe('utils', () => {
  it('formats zero seconds as 0:00', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('formats single-digit seconds with leading zero', () => {
    expect(formatDuration(5)).toBe('0:05');
  });

  it('formats minutes and seconds correctly', () => {
    expect(formatDuration(75)).toBe('1:15');
  });

  it('returns undefined when audio or cover URLs are missing', () => {
    expect(getAudioUrl()).toBeUndefined();
    expect(getCoverUrl()).toBeUndefined();
  });

  it('preserves absolute URLs unchanged', () => {
    const url = 'http://example.com/file.mp3';
    expect(getAudioUrl(url)).toBe(url);
    expect(getCoverUrl(url)).toBe(url);
  });
});
