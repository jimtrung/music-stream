import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveAccessToken,
  saveRefreshToken,
  getAccessToken,
  getRefreshToken,
  deleteAccessToken,
  deleteRefreshToken,
  clearTokens,
} from '../utils/authTokenUtil';

describe('authTokenUtil', () => {
  const storage: Record<string, string> = {};

  beforeEach(() => {
    storage['access_token'] = '';
    storage['refresh_token'] = '';

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key in storage ? storage[key] : null),
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves and retrieves the access token', () => {
    saveAccessToken('abc');
    expect(getAccessToken()).toBe('abc');
  });

  it('saves and retrieves the refresh token', () => {
    saveRefreshToken('def');
    expect(getRefreshToken()).toBe('def');
  });

  it('deletes the access token', () => {
    saveAccessToken('abc');
    deleteAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it('deletes the refresh token', () => {
    saveRefreshToken('def');
    deleteRefreshToken();
    expect(getRefreshToken()).toBeNull();
  });

  it('clears both tokens', () => {
    saveAccessToken('x');
    saveRefreshToken('y');
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
