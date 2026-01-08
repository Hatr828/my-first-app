import { Content } from '@/types';
import { getProgress } from './storage';






const VIDSRC_DOMAINS = [
  'vidsrc-embed.ru',
  'vidsrc-embed.su',
  'vidsrcme.su',
  'vsrc.su',
];




export const getVidSrcDomain = (): string => {
  const saved = localStorage.getItem('vidsrc_domain');
  if (saved && VIDSRC_DOMAINS.includes(saved)) {
    return saved;
  }
  return VIDSRC_DOMAINS[0];
};




export const setVidSrcDomain = (domain: string): void => {
  if (VIDSRC_DOMAINS.includes(domain)) {
    localStorage.setItem('vidsrc_domain', domain);
  }
};




export const getVidSrcDomains = (): string[] => {
  return [...VIDSRC_DOMAINS];
};




export const buildVidSrcUrl = (content: Content, forceSeason?: number, forceEpisode?: number, domainOverride?: string): string => {
  const domain = domainOverride || getVidSrcDomain();
  const tmdbId = content.id;
  
  if (content.type === 'movie') {
    const url = `https://${domain}/embed/movie?tmdb=${tmdbId}&autoplay=1`;
    
    if (import.meta.env.DEV) {
      console.log(`[VidSrc] Building movie URL for tmdb/${tmdbId} on ${domain}:`, url);
    }
    
    return url;
  } else {
    
    const progress = getProgress(tmdbId, 'tv');
    const season = forceSeason ?? (content.season ?? progress?.season ?? 1);
    const episode = forceEpisode ?? (content.episode ?? progress?.episode ?? 1);
    
    const url = `https://${domain}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1&autonext=1`;
    
    if (import.meta.env.DEV) {
      console.log(`[VidSrc] Building TV URL for tmdb/${tmdbId} S${season}E${episode} on ${domain}:`, url);
    }
    
    return url;
  }
};

