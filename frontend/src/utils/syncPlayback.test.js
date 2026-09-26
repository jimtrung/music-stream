import { describe, test, expect, vi } from "vitest";
import { syncPlayback } from "./syncPlayback";

describe("Unit Test syncPlayback", () => {

  test("TC01 - dừng nhạc khi đang phát", () => {
    const mockAudio = {
      paused: false,
      pause: vi.fn()
    };

    syncPlayback(mockAudio, false);

    expect(mockAudio.pause).toHaveBeenCalled();
  });

  test("TC02 - không gọi pause khi đã dừng", () => {
    const mockAudio = {
      paused: true,
      pause: vi.fn()
    };

    syncPlayback(mockAudio, false);

    expect(mockAudio.pause).not.toHaveBeenCalled();
  });

});