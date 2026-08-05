import { useState, useEffect, useMemo } from 'react';
import {
  Tv,
  Video,
  Cpu,
  Wifi,
  Download,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  Copy,
  Check,
  Info
} from 'lucide-react';
import {
  PLATFORM_PRESETS,
  RESOLUTION_PRESETS,
  ENCODER_PRESETS,
  STREAMING_GEAR,
  calculateOBSBitrate,
  CalculationResult
} from './calculator';

// Adsterra Isolated Iframe Banner Component
function AdsterraBanner() {
  const [adBlocked, setAdBlocked] = useState(false);

  // Check if developer mode is enabled via URL param ?dev=true or localStorage flag
  const isDevMode = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.search.includes('dev=true') ||
    localStorage.getItem('dev_admin_mode') === 'true'
  );

  if (isDevMode) {
    return (
      <div className="my-2 border border-purple-500/30 bg-purple-500/5 rounded-xl p-3 shadow-xs flex flex-col items-center justify-center w-[300px] h-[250px] text-center">
        <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">🛠️ DEV ADMIN MODE</span>
        <span className="text-[11px] text-muted-foreground">Adsterra Script Disabled to Protect Your CPM Account Stats.</span>
      </div>
    );
  }

  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '026a1c8c1120203db72f9619075e4cb1',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/026a1c8c1120203db72f9619075e4cb1/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="my-2 border border-border bg-card rounded-xl p-2 shadow-sm flex flex-col items-center justify-center w-[300px] min-h-[250px] overflow-hidden text-center relative">
      <div className="w-full flex justify-between items-center text-[10px] text-muted-foreground mb-1 px-1 font-sans border-b border-border pb-1">
        <span>DISPLAY AD</span>
        <span>AdChoices ℹ️</span>
      </div>

      {!adBlocked ? (
        <iframe
          srcDoc={iframeContent}
          width="300"
          height="250"
          title="Adsterra Display Ad"
          className="border-0 overflow-hidden w-[300px] h-[250px]"
          onError={() => setAdBlocked(true)}
        />
      ) : (
        <a
          href="https://www.amazon.co.uk/s?k=elgato+hd60x+capture+card&tag=nichetools-21"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-full bg-purple-500/10 border border-purple-500/30 p-4 rounded text-left flex flex-col justify-between gap-2 text-xs hover:bg-purple-500/20 transition-all"
        >
          <div>
            <span className="font-bold text-purple-600 dark:text-purple-400 block text-xs">Featured Streaming Deal</span>
            <span className="text-muted-foreground text-[11px]">Elgato HD60X & Audio Capture Cards</span>
          </div>
          <span className="bg-purple-600 text-white font-bold px-3 py-1.5 rounded text-xs text-center">Shop Stream Gear &rarr;</span>
        </a>
      )}
    </div>
  );
}

export function App() {
  // Read initial query params for Programmatic SEO
  const queryParams = new URLSearchParams(window.location.search);
  const initialPlatform = queryParams.get('platform') || 'twitch';
  const initialResolution = queryParams.get('resolution') || '1080p60';

  const [platformKey, setPlatformKey] = useState<string>(initialPlatform);
  const [resolutionKey, setResolutionKey] = useState<string>(initialResolution);
  const [encoderKey, setEncoderKey] = useState<string>('nvenc_h264');
  const [audioKbps, setAudioKbps] = useState<number>(160);
  const [uploadMbps, setUploadMbps] = useState<number>(20.0);
  const [isTestingSpeed, setIsTestingSpeed] = useState<boolean>(false);
  const [copiedSettings, setCopiedSettings] = useState<boolean>(false);

  // Auto-detect speed test function
  const runAutoSpeedTest = async () => {
    setIsTestingSpeed(true);
    const startTime = performance.now();
    try {
      // Download 1.5MB test payload to measure connection throughput
      const res = await fetch('https://cachefly.cachefly.net/1mb.test?t=' + Date.now());
      const blob = await res.blob();
      const endTime = performance.now();
      const durationSeconds = (endTime - startTime) / 1000;
      const bitsLoaded = blob.size * 8;
      const speedMbps = parseFloat(((bitsLoaded / durationSeconds) / 1000000).toFixed(1));
      
      // Upload speeds are typically ~25-40% of download speed on standard home fiber/broadband
      const estimatedUpload = Math.max(parseFloat((speedMbps * 0.4).toFixed(1)), 2.0);
      setUploadMbps(Math.min(estimatedUpload, 100.0));
    } catch (e) {
      console.error('Speed test error:', e);
    } finally {
      setIsTestingSpeed(false);
    }
  };

  // Sync state to URL params for Programmatic SEO without page reload
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('platform', platformKey);
    url.searchParams.set('resolution', resolutionKey);
    window.history.replaceState({}, '', url.toString());
  }, [platformKey, resolutionKey]);

  // Calculate live OBS settings
  const result: CalculationResult = useMemo(() => {
    return calculateOBSBitrate(platformKey, resolutionKey, encoderKey, audioKbps, uploadMbps);
  }, [platformKey, resolutionKey, encoderKey, audioKbps, uploadMbps]);

  const selectedPlatform = PLATFORM_PRESETS[platformKey] || PLATFORM_PRESETS.twitch;

  const handleCopySettings = () => {
    const text = `=== OBS STUDIO RECOMMENDED SETTINGS ===
Platform: ${selectedPlatform.name}
Resolution: ${RESOLUTION_PRESETS[resolutionKey]?.name}
Video Bitrate: ${result.recommendedBitrateKbps} Kbps
Rate Control: CBR (Constant Bitrate)
Keyframe Interval: 2s
Encoder: ${ENCODER_PRESETS[encoderKey]?.name}
Preset: ${result.obsSettings.encoderPreset}
Audio Bitrate: ${result.audioBitrateKbps} Kbps
Required Upload Headroom: ${result.requiredUploadMbps} Mbps (Your Upload: ${uploadMbps} Mbps)
=====================================`;
    navigator.clipboard.writeText(text);
    setCopiedSettings(true);
    setTimeout(() => setCopiedSettings(false), 2500);
  };

  const handlePrintExport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Tv className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">StreamBit Studio</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              🟢 100% Free
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.amazon.co.uk/s?k=elgato+stream+deck&tag=nichetools-21"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-purple-600/20 flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Stream Gear Deals</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="max-w-2xl mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
              100% Free &bull; No Signup Required
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            OBS Bitrate & Encoding Calculator
          </h1>
          <p className="text-muted-foreground text-base">
            Calculate exact OBS Studio video bitrate, encoder presets, audio rates, and network upload headroom for {selectedPlatform.name}.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Select Platform */}
            <div className="border border-border bg-card rounded-2xl p-6 shadow-xs relative">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                <Tv className="w-4 h-4 text-purple-500" />
                <span>01 // Select Platform</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                {Object.entries(PLATFORM_PRESETS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setPlatformKey(key)}
                    className={`h-11 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      platformKey === key
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-xs'
                        : 'border-border bg-background/50 text-muted-foreground hover:bg-card'
                    }`}
                  >
                    <span>{item.name}</span>
                    {platformKey === key && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-purple-500/5 border border-purple-500/15 rounded-xl text-xs text-muted-foreground flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{selectedPlatform.notes}</span>
              </div>
            </div>

            {/* Step 2: Resolution & Framerate */}
            <div className="border border-border bg-card rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                <Video className="w-4 h-4 text-purple-500" />
                <span>02 // Stream Resolution & FPS</span>
              </div>

              <select
                value={resolutionKey}
                onChange={(e) => setResolutionKey(e.target.value)}
                className="w-full h-12 px-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:border-purple-500 text-sm font-medium cursor-pointer"
              >
                {Object.entries(RESOLUTION_PRESETS).map(([key, item]) => (
                  <option key={key} value={key} className="bg-card text-foreground">
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Video Encoder */}
            <div className="border border-border bg-card rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                <Cpu className="w-4 h-4 text-purple-500" />
                <span>03 // Video Hardware Encoder</span>
              </div>

              <select
                value={encoderKey}
                onChange={(e) => setEncoderKey(e.target.value)}
                className="w-full h-12 px-3 border border-border bg-background text-foreground rounded-xl focus:outline-none focus:border-purple-500 text-sm font-medium cursor-pointer mb-3"
              >
                {Object.entries(ENCODER_PRESETS).map(([key, item]) => (
                  <option key={key} value={key} className="bg-card text-foreground">
                    {item.name} ({item.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 4: Upload Speed & Safety Buffer */}
            <div className="border border-border bg-card rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider mb-1">
                <Wifi className="w-4 h-4 text-purple-500" />
                <span>04 // Upload Speed & Safety Buffer</span>
              </div>

              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <label className="font-medium text-muted-foreground">Your Internet Upload Speed</label>
                    <button
                      onClick={runAutoSpeedTest}
                      disabled={isTestingSpeed}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>⚡ {isTestingSpeed ? 'Testing Speed...' : 'Auto-Detect Speed'}</span>
                    </button>
                  </div>
                  <span className="font-mono font-bold text-purple-400 text-base">{uploadMbps} Mbps</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="100.0"
                  step="0.5"
                  value={uploadMbps}
                  onChange={(e) => setUploadMbps(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-2 bg-secondary rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-mono">
                  <span className="text-muted-foreground">Bandwidth Allocated for Stream:</span>
                  <span className="text-emerald-400 font-bold">75% (25% reserved for gaming ping)</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden flex">
                  <div className="h-full bg-purple-500" style={{ width: '75%' }}></div>
                  <div className="h-full bg-emerald-500/30" style={{ width: '25%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Audio Bitrate</label>
                  <select
                    value={audioKbps}
                    onChange={(e) => setAudioKbps(parseInt(e.target.value))}
                    className="w-full h-11 px-3 border border-border bg-background text-foreground rounded-xl text-sm font-medium"
                  >
                    <option value={128}>128 Kbps (Standard)</option>
                    <option value={160}>160 Kbps (Twitch Recommended)</option>
                    <option value={320}>320 Kbps (Studio HD)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* High-Visibility Ad Slot #2 (100% Viewability in Main Form) */}
            <div className="mt-6 flex justify-center">
              <AdsterraBanner />
            </div>
          </div>

          {/* Right Column: Results & OBS Settings Cheat Sheet */}
          <div className="lg:col-span-5 sticky top-20 space-y-6">
            
            {/* Main Bitrate Result Card */}
            <div className="border border-purple-500/40 bg-card p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                  Recommended OBS Video Bitrate
                </span>
                <span className="text-xs font-mono bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded font-bold">
                  {selectedPlatform.name}
                </span>
              </div>

              <div className="font-mono text-5xl font-extrabold tracking-tight text-foreground my-2 flex items-baseline gap-2">
                <span>{result.recommendedBitrateKbps}</span>
                <span className="text-lg text-muted-foreground font-normal">Kbps</span>
              </div>

              <div className="text-sm text-muted-foreground mb-4">
                Total Bandwidth: <span className="font-mono font-bold text-foreground">{result.totalBitrateMbps.toFixed(2)} Mbps</span> (Video + {result.audioBitrateKbps}k Audio)
              </div>

              {/* Network Stability Indicator */}
              <div
                className={`p-3.5 rounded-xl border mb-5 flex items-start gap-2.5 text-xs ${
                  result.stabilityStatus === 'EXCELLENT'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : result.stabilityStatus === 'GOOD'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : result.stabilityStatus === 'WARNING'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                }`}
              >
                {result.stabilityStatus === 'EXCELLENT' || result.stabilityStatus === 'GOOD' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-xs mb-0.5">{result.stabilityStatus} NETWORK HEADROOM</span>
                  <span>{result.stabilityMessage}</span>
                </div>
              </div>

              {/* OBS Output Settings Table */}
              <div className="space-y-2.5 pt-4 border-t border-border text-xs font-mono">
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Rate Control</span>
                  <span className="font-bold text-purple-400">{result.obsSettings.rateControl}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Keyframe Interval</span>
                  <span className="font-bold text-foreground">{result.obsSettings.keyframeInterval}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Encoder Preset</span>
                  <span className="font-bold text-foreground">{result.obsSettings.encoderPreset}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Tuning</span>
                  <span className="font-bold text-foreground">{result.obsSettings.tuning}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Max B-Frames</span>
                  <span className="font-bold text-foreground">{result.obsSettings.bFrames}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-5">
                <button
                  onClick={handleCopySettings}
                  className="h-10 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-purple-600/20"
                >
                  {copiedSettings ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSettings ? 'Copied!' : 'Copy OBS Settings'}</span>
                </button>

                <button
                  onClick={handlePrintExport}
                  className="h-10 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-border"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF Export</span>
                </button>
              </div>
            </div>

            {/* Amazon Streaming Gear Partner Card */}
            <div className="border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                Recommended Streaming Hardware
              </h4>
              <div className="space-y-3">
                {STREAMING_GEAR.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-card/60 hover:bg-card border border-border rounded-xl flex items-center justify-between text-xs transition-all group"
                  >
                    <div>
                      <span className="font-bold block text-foreground group-hover:text-purple-400 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{item.description}</span>
                    </div>
                    <ShoppingCart className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>

            {/* Sidebar Ad Slot #1 */}
            <div className="flex justify-center pt-1">
              <AdsterraBanner />
            </div>
          </div>
        </div>

        {/* More Free Creator & Engineering Tools Network */}
        <div className="mt-16 pt-8 border-t border-border no-print">
          <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">More Free Creator & Engineering Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="https://3d-print-calc.pages.dev" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-card border border-border hover:border-purple-500/50 transition-all flex items-center justify-between text-xs font-semibold group">
              <span className="group-hover:text-purple-400">3D Printing Cost Calculator</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">LIVE</span>
            </a>
            <a href="https://obs-bitrate-calc.pages.dev" className="p-3 rounded-xl bg-card border border-purple-500/40 text-purple-400 transition-all flex items-center justify-between text-xs font-semibold">
              <span>OBS Bitrate & Encoder Tool</span>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">ACTIVE</span>
            </a>
            <a href="https://video-filesize-calc.pages.dev" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-card border border-border hover:border-purple-500/50 transition-all flex items-center justify-between text-xs font-semibold group">
              <span className="group-hover:text-purple-400">Video File Size & Storage Tool</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">LIVE</span>
            </a>
            <a href="https://aspect-ratio-calc-6f5.pages.dev" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-card border border-border hover:border-purple-500/50 transition-all flex items-center justify-between text-xs font-semibold group">
              <span className="group-hover:text-purple-400">Aspect Ratio Converter</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">LIVE</span>
            </a>
            <div className="p-3 rounded-xl bg-card/40 border border-border/50 text-muted-foreground flex items-center justify-between text-xs font-medium opacity-60">
              <span>Audio Gear & Mic Estimator</span>
              <span className="text-[10px] text-zinc-500 font-mono">SOON</span>
            </div>
            <div className="p-3 rounded-xl bg-card/40 border border-border/50 text-muted-foreground flex items-center justify-between text-xs font-medium opacity-60">
              <span>NDI Bandwidth Calculator</span>
              <span className="text-[10px] text-zinc-500 font-mono">SOON</span>
            </div>
            <div className="p-3 rounded-xl bg-card/40 border border-border/50 text-muted-foreground flex items-center justify-between text-xs font-medium opacity-60">
              <span>CNC & Laser Cutting Cost Tool</span>
              <span className="text-[10px] text-zinc-500 font-mono">SOON</span>
            </div>
            <div className="p-3 rounded-xl bg-card/40 border border-border/50 text-muted-foreground flex items-center justify-between text-xs font-medium opacity-60">
              <span>SDI & HDMI Cable Length Tool</span>
              <span className="text-[10px] text-zinc-500 font-mono">SOON</span>
            </div>
          </div>
        </div>

        {/* 3-Column Cheeky Bottom Ad Section */}
        <div className="mt-12 pt-6 text-center no-print">
          <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 inline-block mb-4">
            please look at these for 1 sec so I can keep this site 100% free 🙏
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-items-center">
            <AdsterraBanner />
            <AdsterraBanner />
            <AdsterraBanner />
          </div>
        </div>
      </main>

      {/* Dedicated Printable OBS Settings Cheat Sheet (Visible only during Print / PDF Export) */}
      <div className="hidden print:block p-8 font-sans text-black bg-white">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">OBS Studio Broadcast Cheat Sheet</h1>
            <p className="text-xs text-gray-600">Generated via StreamBit Studio &bull; Broadcast Configuration Spec Sheet</p>
          </div>
          <div className="text-right font-mono text-xs">
            <div>Date: {new Date().toLocaleDateString()}</div>
            <div>Platform: {selectedPlatform.name}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 text-xs font-mono">
          <div className="space-y-2 border border-gray-300 p-4 rounded-xl">
            <h3 className="font-bold text-xs uppercase text-gray-500 mb-2 font-sans border-b pb-1">Video & Output Encoding</h3>
            <div><span className="text-gray-600">Target Resolution:</span> <strong>{RESOLUTION_PRESETS[resolutionKey]?.name}</strong></div>
            <div><span className="text-gray-600">Encoder Hardware:</span> <strong>{ENCODER_PRESETS[encoderKey]?.name}</strong></div>
            <div><span className="text-gray-600">Recommended Bitrate:</span> <strong className="text-sm text-purple-700">{result.recommendedBitrateKbps} Kbps CBR</strong></div>
            <div><span className="text-gray-600">Max Peak Bitrate:</span> <strong>{result.maxBitrateKbps} Kbps</strong></div>
          </div>

          <div className="space-y-2 border border-gray-300 p-4 rounded-xl">
            <h3 className="font-bold text-xs uppercase text-gray-500 mb-2 font-sans border-b pb-1">OBS Advanced Controls</h3>
            <div><span className="text-gray-600">Rate Control:</span> <strong>{result.obsSettings.rateControl}</strong></div>
            <div><span className="text-gray-600">Keyframe Interval:</span> <strong>{result.obsSettings.keyframeInterval}</strong></div>
            <div><span className="text-gray-600">Encoder Preset:</span> <strong>{result.obsSettings.encoderPreset}</strong></div>
            <div><span className="text-gray-600">Max B-Frames:</span> <strong>{result.obsSettings.bFrames}</strong></div>
            <div><span className="text-gray-600">Audio Quality:</span> <strong>{result.audioBitrateKbps} Kbps</strong></div>
          </div>
        </div>

        <div className="border border-gray-300 p-4 rounded-xl text-xs mb-6 font-mono">
          <span className="font-bold block mb-1">Network Headroom & Stability Check:</span>
          <p className="text-gray-700">{result.stabilityMessage}</p>
          <div className="mt-2 text-[11px] text-gray-500">
            Upload Speed: {uploadMbps} Mbps | Required Headroom: {result.requiredUploadMbps} Mbps
          </div>
        </div>

        <div className="text-[10px] text-gray-400 text-center border-t pt-4 font-mono">
          StreamBit Studio &bull; Free Broadcast Engineering &bull; https://obs-bitrate-calc.pages.dev
        </div>
      </div>
    </div>
  );
}

export default App;
