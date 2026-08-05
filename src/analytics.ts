export interface AnalyticsData {
  firstVisitTimestamp: number;
  totalVisits: number;
  totalCalculations: number;
  totalPdfExports: number;
  isReturningUser: boolean;
  referrer: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  sessionStartTime: number;
}

const STORAGE_KEY = 'niche_analytics_v1';

export function getAnalyticsData(): AnalyticsData {
  if (typeof window === 'undefined') {
    return {
      firstVisitTimestamp: Date.now(),
      totalVisits: 1,
      totalCalculations: 0,
      totalPdfExports: 0,
      isReturningUser: false,
      referrer: 'Direct',
      deviceType: 'desktop',
      sessionStartTime: Date.now()
    };
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  let data: AnalyticsData;

  const width = window.innerWidth;
  const deviceType = width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
  const referrer = document.referrer ? new URL(document.referrer).hostname : 'Direct / Organic';

  if (!raw) {
    data = {
      firstVisitTimestamp: Date.now(),
      totalVisits: 1,
      totalCalculations: 0,
      totalPdfExports: 0,
      isReturningUser: false,
      referrer,
      deviceType,
      sessionStartTime: Date.now()
    };
  } else {
    try {
      const parsed = JSON.parse(raw);
      data = {
        ...parsed,
        totalVisits: parsed.totalVisits + 1,
        isReturningUser: true,
        deviceType,
        referrer: parsed.referrer || referrer
      };
    } catch {
      data = {
        firstVisitTimestamp: Date.now(),
        totalVisits: 1,
        totalCalculations: 0,
        totalPdfExports: 0,
        isReturningUser: false,
        referrer,
        deviceType,
        sessionStartTime: Date.now()
      };
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function logCalculationEvent() {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      parsed.totalCalculations = (parsed.totalCalculations || 0) + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.error('Analytics log calculation error:', e);
    }
  }
}

export function logPdfExportEvent() {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      parsed.totalPdfExports = (parsed.totalPdfExports || 0) + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.error('Analytics log PDF export error:', e);
    }
  }
}
