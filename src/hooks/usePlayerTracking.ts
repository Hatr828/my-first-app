import { useEffect, useRef } from 'react';
import { WatchProgress } from '@/types';
import { saveProgress } from '@/utils/storage';

export const usePlayerTracking = () => {
  const lastSavedAtRef = useRef(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      
      if (!event.origin.includes('vidking')) return;

      try {
        
        const raw = event.data as unknown;
        const parsed: any =
          typeof raw === 'string' ? JSON.parse(raw) : (raw && typeof raw === 'object' ? raw : null);
        if (!parsed || parsed.type !== 'PLAYER_EVENT') return;

        const eventData = parsed.data;

        
        if (eventData.event === 'timeupdate' || eventData.event === 'pause' || eventData.event === 'ended') {
          let currentTime = Number(eventData.currentTime) || 0;
          const duration = Number(eventData.duration) || 0;
          let progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

          
          const watchedSeconds = Math.floor(currentTime);
          if (eventData.event === 'timeupdate' && watchedSeconds < 60) return;

          
          const now = Date.now();
          const isTerminal = eventData.event === 'pause' || eventData.event === 'ended' || eventData.event === 'seeked';
          if (!isTerminal && now - lastSavedAtRef.current < 5000) return;

          
          if (eventData.event === 'ended' || progressPercent > 95) {
            currentTime = Math.max(0, Math.floor(duration - 60));
            progressPercent = duration > 0 ? (currentTime / duration) * 100 : 95;
          }

          const progress: WatchProgress = {
            id: parseInt(eventData.id),
            mediaType: eventData.mediaType,
            currentTime,
            duration,
            progress: progressPercent,
            lastWatched: now,
            ...(eventData.season && { season: eventData.season }),
            ...(eventData.episode && { episode: eventData.episode }),
          };

          saveProgress(progress);
          lastSavedAtRef.current = now;

          
          
        }
      } catch (error) {
        
        
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
};

