export type LogoQualityLevel = 'high' | 'medium' | 'low';

export interface LogoRenderProfile {
  quality: LogoQualityLevel;
  particles: number;
  travellers: number;
  arcs: number;
  stars: number;
  maxDpr: number;
  antialias: boolean;
}

export interface LogoProfileInputs {
  width: number;
  coarsePointer: boolean;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  saveData?: boolean;
}

export const LOGO_RENDER_PROFILES: Record<LogoQualityLevel, LogoRenderProfile> =
  {
    high: {
      quality: 'high',
      particles: 300,
      travellers: 55,
      arcs: 14,
      stars: 900,
      maxDpr: 1.75,
      antialias: true,
    },
    medium: {
      quality: 'medium',
      particles: 180,
      travellers: 28,
      arcs: 8,
      stars: 520,
      maxDpr: 1.25,
      antialias: false,
    },
    low: {
      quality: 'low',
      particles: 96,
      travellers: 14,
      arcs: 4,
      stars: 280,
      maxDpr: 1,
      antialias: false,
    },
  };

export function getLogoRenderProfile({
  width,
  coarsePointer,
  hardwareConcurrency = 8,
  deviceMemory = 8,
  saveData = false,
}: LogoProfileInputs): LogoRenderProfile {
  if (
    saveData ||
    width < 640 ||
    hardwareConcurrency <= 4 ||
    deviceMemory <= 4
  ) {
    return LOGO_RENDER_PROFILES.low;
  }

  if (coarsePointer || width < 1024 || hardwareConcurrency <= 6) {
    return LOGO_RENDER_PROFILES.medium;
  }

  return LOGO_RENDER_PROFILES.high;
}
