import { Content } from '@/types';
import { getProgress } from './storage';






const VIDKING_DOMAINS = [
  'www.vidking.net',
  'vidking1.net',
  'vidking2.net',
  'vidking3.net',
  'vidking.net',
];




export const getStreamingProvider = (): 'vidking' | 'vidsrc' => {
  const saved = localStorage.getItem('streaming_provider');
  if (saved === 'vidking' || saved === 'vidsrc') return saved;
  return 'vidsrc'; 
};




export const setStreamingProvider = (provider: 'vidking' | 'vidsrc'): void => {
  localStorage.setItem('streaming_provider', provider);
};





export const getVidkingDomain = (): string => {
  const saved = localStorage.getItem('vidking_domain');
  if (saved && VIDKING_DOMAINS.includes(saved)) {
    return saved;
  }
  return VIDKING_DOMAINS[0];
};




export const setVidkingDomain = (domain: string): void => {
  if (VIDKING_DOMAINS.includes(domain)) {
    localStorage.setItem('vidking_domain', domain);
  }
};




export const getVidkingDomains = (): string[] => {
  return [...VIDKING_DOMAINS];
};







export const buildVidkingUrl = (content: Content, forceSeason?: number, forceEpisode?: number, domainOverride?: string): string => {
  
  const legacyMap: Record<string, number> = {
    'tv:2288': 1398, 
  };
  const mappedId = legacyMap[`${content.type}:${content.id}`] ?? content.id;

  const domain = domainOverride || getVidkingDomain();
  let url = `https://${domain}/embed/${content.type}/${mappedId}`;
  
  if (import.meta.env.DEV) {
    console.log(`[Vidking] Building URL for ${content.type}/${mappedId} on ${domain}:`, url);
  }
  
  
  if (content.type === 'tv') {
    
    
    const season = forceSeason ?? (content.season ?? getProgress(mappedId, content.type)?.season ?? 1);
    const episode = forceEpisode ?? (content.episode ?? getProgress(mappedId, content.type)?.episode ?? 1);

    url += `/${season}/${episode}`;
  }
  
  const params = new URLSearchParams({
    color: 'e50914', 
    autoPlay: 'true',
    subtitle: 'en', 
    subtitleLang: 'en', 
    cc: 'true', 
    captions: 'true', 
  });
  
  if (content.type === 'tv') {
    params.append('nextEpisode', 'true');
    params.append('episodeSelector', 'true');
  }
  
  
  const progress = getProgress(mappedId, content.type);
  if (progress) {
    
    const minimumResumeSeconds = 60;
    let resumeAt = Math.floor(progress.currentTime || 0);

    
    if (progress.duration && progress.progress > 95) {
      resumeAt = Math.max(0, Math.floor(progress.duration - 60));
    }

    if (resumeAt >= minimumResumeSeconds) {
      
      
      
      if (resumeAt > 300) { 
        
        
      } else {
        
        params.append('progress', resumeAt.toString());
      }
    }
  }
  
  return `${url}?${params.toString()}`;
};


export const buildVidkingPreviewUrl = (content: Content, domainOverride?: string): string => {
  const legacyMap: Record<string, number> = {
    'tv:2288': 1398,
  };
  const mappedId = legacyMap[`${content.type}:${content.id}`] ?? content.id;

  const domain = domainOverride || getVidkingDomain();
  let url = `https://${domain}/embed/${content.type}/${mappedId}`;

  if (content.type === 'tv') {
    
    const progress = getProgress(mappedId, content.type);
    const season = (progress?.season ?? content.season ?? 1);
    const episode = (progress?.episode ?? content.episode ?? 1);
    url += `/${season}/${episode}`;
  }

  const params = new URLSearchParams({
    color: 'e50914',
    autoPlay: 'true',
    muted: '1',
  });
  
  return `${url}?${params.toString()}`;
};

