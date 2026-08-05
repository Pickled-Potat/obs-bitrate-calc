import { expect, test, describe } from 'vitest';
import { calculateOBSBitrate } from './calculator';

describe('calculateOBSBitrate', () => {
  test('calculates correct Twitch 1080p60 NVENC settings', () => {
    const result = calculateOBSBitrate('twitch', '1080p60', 'nvenc_h264', 160, 25.0);
    expect(result.recommendedBitrateKbps).toBe(6000);
    expect(result.audioBitrateKbps).toBe(160);
    expect(result.totalBitrateKbps).toBe(6160);
    expect(result.stabilityStatus).toBe('EXCELLENT');
  });

  test('detects CRITICAL warning when upload speed is lower than bitrate', () => {
    const result = calculateOBSBitrate('twitch', '1080p60', 'nvenc_h264', 160, 4.0);
    expect(result.stabilityStatus).toBe('CRITICAL');
  });

  test('calculates YouTube 4K60 AV1 bitrate correctly', () => {
    const result = calculateOBSBitrate('youtube', '4k60', 'nvenc_av1', 320, 50.0);
    expect(result.recommendedBitrateKbps).toBe(12960);
    expect(result.obsSettings.rateControl).toBe('CBR (Constant Bitrate)');
  });
});
