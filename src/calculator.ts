export interface PlatformPreset {
  name: string;
  maxBitrateKbps: number;
  recommendedAudioKbps: number;
  supportedEncoders: string[];
  maxResolution: string;
  notes: string;
}

export interface ResolutionPreset {
  name: string;
  width: number;
  height: number;
  fps: number;
  baseBitrateH264: number;
  baseBitrateAV1: number;
}

export interface EncoderPreset {
  name: string;
  type: string;
  efficiencyMultiplier: number; // AV1 = 0.75, NVENC H264 = 1.0, x264 Medium = 0.95
  recommendedPreset: string;
  recommendedTuning: string;
  bFrames: number;
}

export interface GearPreset {
  name: string;
  category: string;
  description: string;
  affiliateLink: string;
}

export const PLATFORM_PRESETS: Record<string, PlatformPreset> = {
  twitch: {
    name: 'Twitch Live',
    maxBitrateKbps: 8000,
    recommendedAudioKbps: 160,
    supportedEncoders: ['NVENC H.264', 'NVENC AV1 (Beta)', 'x264 CPU', 'AMD AMF'],
    maxResolution: '1080p60',
    notes: 'Twitch soft-caps non-partner accounts at 6,000 Kbps. Partners can stream up to 8,000 Kbps CBR.'
  },
  youtube: {
    name: 'YouTube Live',
    maxBitrateKbps: 51000,
    recommendedAudioKbps: 320,
    supportedEncoders: ['NVENC AV1', 'NVENC H.264', 'AMD AMF', 'Intel QuickSync', 'x264 CPU'],
    maxResolution: '4K60',
    notes: 'YouTube re-encodes all streams. Higher bitrates (10,000 - 25,000 Kbps) force the VP09/AV01 high-quality codec.'
  },
  kick: {
    name: 'Kick.com',
    maxBitrateKbps: 8000,
    recommendedAudioKbps: 160,
    supportedEncoders: ['NVENC H.264', 'AMD AMF', 'x264 CPU'],
    maxResolution: '1080p60',
    notes: 'Kick supports 1080p60 up to 8,000 Kbps CBR with 2-second keyframes.'
  },
  tiktok: {
    name: 'TikTok Live Studio',
    maxBitrateKbps: 6000,
    recommendedAudioKbps: 128,
    supportedEncoders: ['NVENC H.264', 'AMD AMF', 'x264 CPU'],
    maxResolution: '1080p60 (Vertical 1080x1920)',
    notes: 'TikTok Live Studio works best at 4,500 - 6,000 Kbps CBR in vertical 1080x1920 mode.'
  },
  facebook: {
    name: 'Facebook Gaming',
    maxBitrateKbps: 6000,
    recommendedAudioKbps: 128,
    supportedEncoders: ['NVENC H.264', 'AMD AMF', 'x264 CPU'],
    maxResolution: '1080p60',
    notes: 'Standard streamers are capped at 720p60 (4,000 Kbps). Level Up creators unlock 1080p60 (6,000 Kbps).'
  },
  custom: {
    name: 'Custom RTMP Server',
    maxBitrateKbps: 100000,
    recommendedAudioKbps: 320,
    supportedEncoders: ['NVENC AV1', 'NVENC H.264', 'AMD AMF', 'Intel QuickSync', 'x264 CPU'],
    maxResolution: '4K60',
    notes: 'Custom RTMP / NDI destination with unconstrained bandwidth settings.'
  }
};

export const RESOLUTION_PRESETS: Record<string, ResolutionPreset> = {
  '1080p60': { name: '1080p 60 FPS (Full HD High Motion)', width: 1920, height: 1080, fps: 60, baseBitrateH264: 6000, baseBitrateAV1: 4500 },
  '1080p30': { name: '1080p 30 FPS (Full HD Standard)', width: 1920, height: 1080, fps: 30, baseBitrateH264: 4500, baseBitrateAV1: 3200 },
  '720p60':  { name: '720p 60 FPS (HD Fast Esports)', width: 1280, height: 720, fps: 60, baseBitrateH264: 4500, baseBitrateAV1: 3000 },
  '720p30':  { name: '720p 30 FPS (HD Low Bandwidth)', width: 1280, height: 720, fps: 30, baseBitrateH264: 3000, baseBitrateAV1: 2000 },
  '1440p60': { name: '1440p 60 FPS (2K Ultra HD)', width: 2560, height: 1440, fps: 60, baseBitrateH264: 14000, baseBitrateAV1: 9500 },
  '4k60':    { name: '4K 60 FPS (2160p Ultra HD)', width: 3840, height: 2160, fps: 60, baseBitrateH264: 28000, baseBitrateAV1: 18000 }
};

export const ENCODER_PRESETS: Record<string, EncoderPreset> = {
  nvenc_h264: {
    name: 'NVIDIA NVENC H.264 (RTX / GTX)',
    type: 'GPU Hardware',
    efficiencyMultiplier: 1.0,
    recommendedPreset: 'P6: Slower (Better Quality)',
    recommendedTuning: 'High Quality',
    bFrames: 2
  },
  nvenc_av1: {
    name: 'NVIDIA NVENC AV1 (RTX 40 Series)',
    type: 'GPU Hardware (Next-Gen)',
    efficiencyMultiplier: 0.72,
    recommendedPreset: 'P6: Slower (Better Quality)',
    recommendedTuning: 'High Quality',
    bFrames: 4
  },
  amd_amf: {
    name: 'AMD AMF H.264 / AV1 (Radeon RX)',
    type: 'GPU Hardware',
    efficiencyMultiplier: 1.05,
    recommendedPreset: 'Quality / High Quality',
    recommendedTuning: 'Two Pass (Quarter Resolution)',
    bFrames: 2
  },
  quicksync: {
    name: 'Intel QuickSync Video (Arc / Core GPU)',
    type: 'GPU Hardware',
    efficiencyMultiplier: 0.95,
    recommendedPreset: 'Quality',
    recommendedTuning: 'High Quality',
    bFrames: 2
  },
  x264_medium: {
    name: 'x264 CPU Encoder (Medium / Fast)',
    type: 'CPU Software',
    efficiencyMultiplier: 0.92,
    recommendedPreset: 'medium (CPU Intensive) / fast',
    recommendedTuning: 'None / Film',
    bFrames: 2
  }
};

export const STREAMING_GEAR: GearPreset[] = [
  {
    name: 'Elgato HD60 X Capture Card',
    category: 'Capture Card',
    description: '4K60 HDR Pass-through, 1080p60 zero-latency capture for PS5, Xbox, Switch & Dual-PC.',
    affiliateLink: 'https://www.amazon.co.uk/s?k=elgato+hd60x+capture+card&tag=nichetools-21'
  },
  {
    name: 'Shure SM7B Dynamic Studio Mic',
    category: 'Microphone',
    description: 'The industry-standard broadcast vocal microphone for streamers & podcasters.',
    affiliateLink: 'https://www.amazon.co.uk/s?k=shure+sm7b+microphone&tag=nichetools-21'
  },
  {
    name: 'Logitech Brio 4K Webcam',
    category: 'Webcam',
    description: '4K Ultra HD webcam with HDR and auto-light balance for streaming setups.',
    affiliateLink: 'https://www.amazon.co.uk/s?k=logitech+brio+4k+webcam&tag=nichetools-21'
  },
  {
    name: 'Elgato Stream Deck MK.2',
    category: 'Studio Control',
    description: '15 tactile macro keys to control OBS scenes, mute audio, and trigger stream alerts.',
    affiliateLink: 'https://www.amazon.co.uk/s?k=elgato+stream+deck+mk2&tag=nichetools-21'
  }
];

export interface CalculationResult {
  recommendedBitrateKbps: number;
  maxBitrateKbps: number;
  audioBitrateKbps: number;
  totalBitrateKbps: number;
  totalBitrateMbps: number;
  requiredUploadMbps: number;
  networkHeadroomPct: number;
  stabilityStatus: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  stabilityMessage: string;
  obsSettings: {
    rateControl: string;
    keyframeInterval: string;
    encoderPreset: string;
    tuning: string;
    bFrames: number;
    profile: string;
  };
}

export function calculateOBSBitrate(
  platformKey: string,
  resolutionKey: string,
  encoderKey: string,
  audioQualityKbps: number,
  uploadMbps: number
): CalculationResult {
  const platform = PLATFORM_PRESETS[platformKey] || PLATFORM_PRESETS.twitch;
  const resolution = RESOLUTION_PRESETS[resolutionKey] || RESOLUTION_PRESETS['1080p60'];
  const encoder = ENCODER_PRESETS[encoderKey] || ENCODER_PRESETS.nvenc_h264;

  // Calculate ideal video bitrate based on encoder efficiency
  const baseBitrate = encoderKey.includes('av1') ? resolution.baseBitrateAV1 : resolution.baseBitrateH264;
  let targetBitrate = Math.round(baseBitrate * encoder.efficiencyMultiplier);

  // Cap at platform max bitrate
  if (targetBitrate > platform.maxBitrateKbps) {
    targetBitrate = platform.maxBitrateKbps;
  }

  const maxBitrate = Math.min(Math.round(targetBitrate * 1.1), platform.maxBitrateKbps);
  const totalBitrateKbps = targetBitrate + audioQualityKbps;
  const totalBitrateMbps = totalBitrateKbps / 1000;

  // OBS recommended 35% safety headroom for upload speed (to prevent frame drops during traffic spikes)
  const requiredUploadMbps = parseFloat((totalBitrateMbps * 1.35).toFixed(1));
  const headroomPct = Math.round(((uploadMbps - requiredUploadMbps) / Math.max(uploadMbps, 0.1)) * 100);

  let stabilityStatus: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' = 'EXCELLENT';
  let stabilityMessage = 'Your internet connection has plenty of headroom for smooth 0-frame-drop streaming.';

  if (uploadMbps < totalBitrateMbps) {
    stabilityStatus = 'CRITICAL';
    stabilityMessage = `Severe Bitrate Overload! Your upload speed (${uploadMbps} Mbps) is lower than your total stream bitrate (${totalBitrateMbps.toFixed(1)} Mbps). Expect massive dropped frames and stream disconnects. Lower resolution to 720p60 or reduce bitrate.`;
  } else if (uploadMbps < requiredUploadMbps) {
    stabilityStatus = 'WARNING';
    stabilityMessage = `Low Network Headroom! You have less than 35% safety buffer. Any background uploads or family Wi-Fi usage will cause dropped frames in OBS. Recommended upload speed: ${requiredUploadMbps} Mbps.`;
  } else if (headroomPct < 50) {
    stabilityStatus = 'GOOD';
    stabilityMessage = 'Good stability. Connection is solid, but avoid large background game downloads while live.';
  }

  return {
    recommendedBitrateKbps: targetBitrate,
    maxBitrateKbps: maxBitrate,
    audioBitrateKbps: audioQualityKbps,
    totalBitrateKbps,
    totalBitrateMbps,
    requiredUploadMbps,
    networkHeadroomPct: headroomPct,
    stabilityStatus,
    stabilityMessage,
    obsSettings: {
      rateControl: 'CBR (Constant Bitrate)',
      keyframeInterval: '2s (2 Seconds)',
      encoderPreset: encoder.recommendedPreset,
      tuning: encoder.recommendedTuning,
      bFrames: encoder.bFrames,
      profile: 'high'
    }
  };
}
