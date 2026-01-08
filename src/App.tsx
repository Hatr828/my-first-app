import { useState, useMemo, useEffect, useRef } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/layout/Hero';
import { ContentGrid } from './components/content/ContentGrid';
import { ContentSquareGrid } from './components/content/ContentSquareGrid';
import { Top10Grid } from './components/content/Top10Grid';
import { PlayerModal } from './components/player/PlayerModal';
import { SectionSkeleton } from './components/common/SectionSkeleton';
import { StreamCard } from './components/content/StreamCard';
import { Content, Category, Stream } from './types';
import { trendingMovies, popularTV, actionMovies } from './data/content';
import { buildVidkingUrl } from './utils/vidking';
import { addToContinueWatching, getContinueWatching, migrateKnownFixes, getMyList } from './utils/storage';
import { usePlayerTracking } from './hooks/usePlayerTracking';
import { useTVNavigation } from './hooks/useTVNavigation';
import { searchTMDB, getTrendingMovies, getTopRatedMovies, getTopRatedTV, getTop10, getByGenre, getTrendingTV, getRecommendations, getUpcomingMovies, getCriticallyAcclaimed, getHiddenGems, getTrendingToday, getMoviesByActor, findCollectionByMovie, getRecentlyAdded } from './utils/tmdb';
import { getForYouContent } from './utils/recommendations';
import { getLiveStreams } from './utils/streams';
import { MoodSelector } from './components/content/MoodSelector';
import { ApiKeyWarning } from './components/common/ApiKeyWarning';
import './App.css';

function App() {
  const [currentCategory, setCurrentCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [continueWatching, setContinueWatching] = useState<Content[]>(getContinueWatching());
  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [heroContent, setHeroContent] = useState<Content | null>(null);
  const [isLoadingHero, setIsLoadingHero] = useState(false);
  const [rowAction, setRowAction] = useState<Content[]>([]);
  const [rowComedy, setRowComedy] = useState<Content[]>([]);
  const [rowDarkMoody, setRowDarkMoody] = useState<Content[]>([]);
  const [rowFamily, setRowFamily] = useState<Content[]>([]);
  const [rowBecause, setRowBecause] = useState<{title:string; items: Content[]}>({title:'', items: []});
  const [rowMyList, setRowMyList] = useState<Content[]>(getMyList());
  const [rowComingSoon, setRowComingSoon] = useState<Content[]>([]);
  const [rowCriticallyAcclaimed, setRowCriticallyAcclaimed] = useState<Content[]>([]);
  const [rowHiddenGems, setRowHiddenGems] = useState<Content[]>([]);
  const [rowTrendingToday, setRowTrendingToday] = useState<Content[]>([]);
  const [rowMoodContent, setRowMoodContent] = useState<{title: string; items: Content[]} | null>(null);
  const [actorCollections, setActorCollections] = useState<Array<{actor: string; content: Content[]; profilePath: string | null}>>([]);
  const [franchiseCollections, setFranchiseCollections] = useState<Array<{name: string; content: Content[]}>>([]);
  const [rowForYou, setRowForYou] = useState<Content[]>([]);
  const [isLoadingForYou, setIsLoadingForYou] = useState(false);
  const [top10Content, setTop10Content] = useState<Content[]>([]);
  const [isLoadingTop10, setIsLoadingTop10] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState<Content[]>([]);
  const [isLoadingRecentlyAdded, setIsLoadingRecentlyAdded] = useState(false);
  const [liveSportsStreams, setLiveSportsStreams] = useState<Stream[]>([]);
  const [isLoadingLiveSports, setIsLoadingLiveSports] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  
  useEffect(() => {
    migrateKnownFixes();
  }, []);

  
  usePlayerTracking();
  
  
  useTVNavigation();

  
  useEffect(() => {
    const loadTop10 = async () => {
      setIsLoadingTop10(true);
      try {
        const top10 = await getTop10();
        setTop10Content(top10);
      } catch (error) {
        console.error('Error loading top 10:', error);
      } finally {
        setIsLoadingTop10(false);
      }
    };

    loadTop10();
  }, []);

  
  useEffect(() => {
    const loadLiveSports = async () => {
      
      if (currentCategory !== 'all' || searchQuery.trim()) {
        setLiveSportsStreams([]);
        return;
      }

      setIsLoadingLiveSports(true);
      try {
        const liveStreams = await getLiveStreams();
        
        setLiveSportsStreams(liveStreams.slice(0, 10));
      } catch (error) {
        
        console.error('Error loading live sports:', error);
        setLiveSportsStreams([]);
      } finally {
        setIsLoadingLiveSports(false);
      }
    };

    loadLiveSports();
    
    
    const interval = setInterval(loadLiveSports, 60000);
    return () => clearInterval(interval);
  }, [currentCategory, searchQuery]);

  
  useEffect(() => {
    const loadForYou = async () => {
      setIsLoadingForYou(true);
      try {
        const forYou = await getForYouContent();
        setRowForYou(forYou);
      } catch (error) {
        console.error('Error loading For You:', error);
      } finally {
        setIsLoadingForYou(false);
      }
    };

    loadForYou();
  }, [continueWatching]);
  
  useEffect(() => {
    const onListChange = () => setRowMyList(getMyList());
    window.addEventListener('flux:list:changed', onListChange);
    return () => window.removeEventListener('flux:list:changed', onListChange);
  }, []);

  
  useEffect(() => {
    const buildBecause = async () => {
      if (continueWatching.length === 0) { setRowBecause({title:'', items: []}); return; }
      const anchor = continueWatching[0];
      try {
        const recs = await getRecommendations(anchor.type, anchor.id);
        setRowBecause({ title: `Because you watched ${anchor.title}`, items: recs.slice(0, 40) });
      } catch {
        setRowBecause({title:'', items: []});
      }
    };
    buildBecause();
  }, [continueWatching]);

  
  useEffect(() => {
    const loadRows = async () => {
      try {
        
        const [actionMovies, actionTV] = await Promise.all([
          getByGenre('movie', 28, 40),
          getByGenre('tv', 10759, 40),
        ]);
        setRowAction([...actionMovies.slice(0, 30), ...actionTV.slice(0, 30)]);

        
        const [comedyMovies, comedyTV] = await Promise.all([
          getByGenre('movie', 35, 40),
          getByGenre('tv', 35, 40),
        ]);
        setRowComedy([...comedyMovies.slice(0, 30), ...comedyTV.slice(0, 30)]);

        
        const [thrillerMovies, horrorMovies, thrillerTV] = await Promise.all([
          getByGenre('movie', 53, 30),
          getByGenre('movie', 27, 30),
          getByGenre('tv', 80, 30), 
        ]);
        const darkMix = [...thrillerMovies.slice(0, 20), ...horrorMovies.slice(0, 20), ...thrillerTV.slice(0, 20)];
        setRowDarkMoody(darkMix);

        
        const [familyMovies, animationMovies, familyTV] = await Promise.all([
          getByGenre('movie', 10751, 30),
          getByGenre('movie', 16, 30),
          getByGenre('tv', 10762, 30), 
        ]);
        setRowFamily([...familyMovies.slice(0, 20), ...animationMovies.slice(0, 20), ...familyTV.slice(0, 20)]);

        
        const upcoming = await getUpcomingMovies();
        setRowComingSoon(upcoming.slice(0, 40));

        
        const acclaimed = await getCriticallyAcclaimed();
        setRowCriticallyAcclaimed(acclaimed);

        
        const hiddenGems = await getHiddenGems();
        setRowHiddenGems(hiddenGems);

        
        const trendingToday = await getTrendingToday();
        setRowTrendingToday(trendingToday);

        
        setIsLoadingRecentlyAdded(true);
        try {
          const recentlyAddedContent = await getRecentlyAdded();
          setRecentlyAdded(recentlyAddedContent);
        } catch (error) {
          console.error('Error loading recently added:', error);
        } finally {
          setIsLoadingRecentlyAdded(false);
        }

        
        const popularActors = ['Adam Sandler', 'Tom Hanks', 'Leonardo DiCaprio', 'Ryan Reynolds'];
        const actorResults = await Promise.all(
          popularActors.map(actor => getMoviesByActor(actor))
        );
        setActorCollections(
          actorResults
            .filter((r): r is { actor: string; content: Content[]; profilePath: string | null } => r !== null && r.content && r.content.length > 0)
            .slice(0, 3)
        );

        
        
        const franchiseMovies = [
          { movieId: 671, name: 'Harry Potter Collection' }, 
          { movieId: 181808, name: 'Star Wars Collection' }, 
          { movieId: 299536, name: 'Avengers Collection' }, 
        ];
        const franchiseResults = await Promise.all(
          franchiseMovies.map(f => findCollectionByMovie(f.movieId))
        );
        setFranchiseCollections(
          franchiseResults
            .filter((r): r is { name: string; content: Content[] } => r !== null && r.content.length > 0)
            .slice(0, 3)
        );
      } catch (e) {
        
        console.error('Error loading dynamic rows:', e);
      }
    };

    loadRows();
  }, []);

  const handleMoodSelect = (moodTitle: string, content: Content[]) => {
    setRowMoodContent({ title: moodTitle, items: content });
    
    setTimeout(() => {
      const element = document.querySelector('.mood-content-section');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  
  useEffect(() => {
    const loadHeroContent = async () => {
      setIsLoadingHero(true);
      try {
        let content: Content[] = [];
        
        if (currentCategory === 'movies') {
          
          content = await getTopRatedMovies();
        } else if (currentCategory === 'tv') {
          
          content = await getTopRatedTV();
        } else {
          
          content = await getTrendingMovies();
        }
        
        if (content.length > 0) {
          
          const randomIndex = Math.floor(Math.random() * Math.min(5, content.length));
          setHeroContent(content[randomIndex]);
        }
      } catch (error) {
        console.error('Error loading hero content:', error);
      } finally {
        setIsLoadingHero(false);
      }
    };

    loadHeroContent();
  }, [currentCategory]);

  
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchTMDB(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); 

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  
  const filteredContent = useMemo(() => {
      const filterByCategory = (items: Content[]) => {
        if (currentCategory === 'movies') return items.filter(i => i.type === 'movie');
        if (currentCategory === 'tv') return items.filter(i => i.type === 'tv');
        return items;
      };

    
    if (searchQuery.trim() && searchResults.length > 0) {
      return {
        trending: filterByCategory(searchResults),
        tv: [],
        action: [],
        continue: filterByCategory(continueWatching),
      };
    }

    
    return {
      trending: filterByCategory(trendingMovies),
      tv: currentCategory !== 'movies' ? filterByCategory(popularTV) : [],
      action: filterByCategory(actionMovies),
      continue: filterByCategory(continueWatching),
    };
  }, [currentCategory, searchQuery, searchResults, continueWatching]);

  
  const filteredRowMyList = useMemo(() => {
    if (currentCategory === 'movies') return rowMyList.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return rowMyList.filter(i => i.type === 'tv');
    return rowMyList;
  }, [currentCategory, rowMyList]);

  const filteredRowForYou = useMemo(() => {
    if (currentCategory === 'movies') return rowForYou.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return rowForYou.filter(i => i.type === 'tv');
    return rowForYou;
  }, [currentCategory, rowForYou]);

  const filteredRowBecause = useMemo(() => {
    if (currentCategory === 'movies') {
      return {
        title: rowBecause.title,
        items: rowBecause.items.filter(i => i.type === 'movie'),
      };
    }
    if (currentCategory === 'tv') {
      return {
        title: rowBecause.title,
        items: rowBecause.items.filter(i => i.type === 'tv'),
      };
    }
    return rowBecause;
  }, [currentCategory, rowBecause]);

  const filteredRowAction = useMemo(() => {
    if (currentCategory === 'movies') return rowAction.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return rowAction.filter(i => i.type === 'tv');
    return rowAction;
  }, [currentCategory, rowAction]);

  const filteredRowComedy = useMemo(() => {
    if (currentCategory === 'movies') return rowComedy.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return rowComedy.filter(i => i.type === 'tv');
    return rowComedy;
  }, [currentCategory, rowComedy]);

  const filteredRowDarkMoody = useMemo(() => {
    if (currentCategory === 'movies') return rowDarkMoody.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return rowDarkMoody.filter(i => i.type === 'tv');
    return rowDarkMoody;
  }, [currentCategory, rowDarkMoody]);

  const filteredRowFamily = useMemo(() => {
    if (currentCategory === 'movies') return rowFamily.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return rowFamily.filter(i => i.type === 'tv');
    return rowFamily;
  }, [currentCategory, rowFamily]);

  const filteredRowTrendingToday = useMemo(() => {
    if (currentCategory === 'movies') return rowTrendingToday.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return rowTrendingToday.filter(i => i.type === 'tv');
    return rowTrendingToday;
  }, [currentCategory, rowTrendingToday]);

  const filteredRowMoodContent = useMemo(() => {
    if (!rowMoodContent) return null;
    if (currentCategory === 'movies') {
      return {
        title: rowMoodContent.title,
        items: rowMoodContent.items.filter(i => i.type === 'movie'),
      };
    }
    if (currentCategory === 'tv') {
      return {
        title: rowMoodContent.title,
        items: rowMoodContent.items.filter(i => i.type === 'tv'),
      };
    }
    return rowMoodContent;
  }, [currentCategory, rowMoodContent]);

  const filteredRowComingSoon = useMemo(() => {
    if (currentCategory === 'movies') return rowComingSoon.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return rowComingSoon.filter(i => i.type === 'tv');
    return rowComingSoon;
  }, [currentCategory, rowComingSoon]);

  const filteredRowCriticallyAcclaimed = useMemo(() => {
    if (currentCategory === 'movies') return rowCriticallyAcclaimed.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return rowCriticallyAcclaimed.filter(i => i.type === 'tv');
    return rowCriticallyAcclaimed;
  }, [currentCategory, rowCriticallyAcclaimed]);

  const filteredRowHiddenGems = useMemo(() => {
    if (currentCategory === 'movies') return rowHiddenGems.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return rowHiddenGems.filter(i => i.type === 'tv');
    return rowHiddenGems;
  }, [currentCategory, rowHiddenGems]);

  const filteredTop10Content = useMemo(() => {
    if (currentCategory === 'movies') return top10Content.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return top10Content.filter(i => i.type === 'tv');
    return top10Content;
  }, [currentCategory, top10Content]);

  const filteredRecentlyAdded = useMemo(() => {
    if (currentCategory === 'movies') return recentlyAdded.filter(i => i.type === 'movie');
    if (currentCategory === 'tv') return recentlyAdded.filter(i => i.type === 'tv');
    return recentlyAdded;
  }, [currentCategory, recentlyAdded]);

  const handlePlayContent = (content: Content) => {
    setSelectedContent(content);
    addToContinueWatching(content);
    setContinueWatching(getContinueWatching());
  };

  const handleClosePlayer = () => {
    setSelectedContent(null);
    setContinueWatching(getContinueWatching());
  };

  const handleInfo = (content: Content) => {
    alert(`${content.title}\n\n${content.description}\n\nYear: ${content.year}\nType: ${content.type === 'movie' ? 'Movie' : 'TV Show'}`);
  };

  const handlePlayStream = (stream: Stream) => {
    
    window.location.href = `/sports?stream=${encodeURIComponent(stream.id)}`;
  };

  const handleShuffle = async () => {
    try {
      
      const [movies, tv] = await Promise.all([
        getTrendingMovies(),
        getTrendingTV(),
      ]);
      const allContent = [...movies, ...tv].filter(c => c.poster);
      if (allContent.length === 0) return;
      
      
      const random = allContent[Math.floor(Math.random() * allContent.length)];
      handlePlayContent(random);
    } catch (error) {
      console.error('Error shuffling:', error);
    }
  };

  const handleHelp = () => {
    alert('Keyboard Shortcuts:\n\n' +
          'In Player:\n' +
          '  Space - Play/Pause\n' +
          '  ← → - Seek backward/forward 10s\n' +
          '  M - Mute/Unmute\n' +
          '  F - Fullscreen\n' +
          '  ESC - Close player'
    );
  };

  
  const displayedHeroContent = useMemo(() => {
    if (heroContent && heroContent.backdrop) {
      
      const heroItems: Content[] = [heroContent];
      
      
      if (currentCategory === 'all' && trendingMovies.length > 0) {
        const additional = trendingMovies
          .filter(m => m.id !== heroContent.id && m.backdrop && m.backdrop.trim())
          .slice(0, 4);
        heroItems.push(...additional);
      } else if (currentCategory === 'movies' && rowAction.length > 0) {
        const additional = rowAction
          .filter(m => m.id !== heroContent.id && m.backdrop && m.backdrop.trim())
          .slice(0, 4);
        heroItems.push(...additional);
      } else if (currentCategory === 'tv' && rowComedy.length > 0) {
        const additional = rowComedy
          .filter(m => m.id !== heroContent.id && m.backdrop && m.backdrop.trim())
          .slice(0, 4);
        heroItems.push(...additional);
      }
      
      return heroItems.filter(item => item.backdrop && item.backdrop.trim());
    }
    
    
    if (searchQuery.trim() && searchResults.length > 0) {
      return searchResults.slice(0, 5).filter(c => c.backdrop && c.backdrop.trim());
    }
    
    return trendingMovies.slice(1, 6).filter(c => c.backdrop && c.backdrop.trim());
  }, [heroContent, currentCategory, trendingMovies, rowAction, rowComedy, searchQuery, searchResults]);

  return (
    <div className="app">
      <ApiKeyWarning />
      <Navbar
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(val)=>{
          
          window.location.href = `/search?q=${encodeURIComponent(val)}`;
        }}
        onShuffle={handleShuffle}
        onHelp={handleHelp}
      />

      {displayedHeroContent.length > 0 && !isLoadingHero && (
        <Hero
          content={displayedHeroContent}
          onPlay={(content) => handlePlayContent(content)}
          onInfo={(content) => handleInfo(content)}
        />
      )}

      <main className="content">
        
        {isSearching && searchQuery.trim() && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#b3b3b3' }}>
            <div style={{ fontSize: '1.1rem' }}>🔍 Searching {searchQuery}...</div>
          </div>
        )}

        
        {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#b3b3b3' }}>
            <div style={{ fontSize: '1.1rem' }}>No results found for "{searchQuery}"</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try a different search term</div>
          </div>
        )}

        
        
        {!searchQuery.trim() && currentCategory === 'all' && (
          <>
            {isLoadingLiveSports ? (
              <SectionSkeleton />
            ) : liveSportsStreams.length > 0 && (
              <section className="content-row live-sports-section">
                <div className="row-header live-sports-header">
                  <div className="live-sports-title-wrapper">
                    <div className="live-pulse-indicator">
                      <span className="pulse-dot"></span>
                      <span className="pulse-ring"></span>
                    </div>
                    <h2 className="row-title">Live Sports</h2>
                  </div>
                  <div className="row-badge live-badge">
                    <span className="live-badge-dot"></span>
                    <span className="badge-text">{liveSportsStreams.length} LIVE NOW</span>
                  </div>
                </div>
                <div className="content-grid live-sports-grid">
                  {liveSportsStreams.map((stream) => (
                    <div key={`live-${stream.id}`} className="grid-item">
                      <StreamCard
                        stream={stream}
                        onClick={handlePlayStream}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        
        
        {!searchQuery.trim() && currentCategory === 'all' && (
          <>
            {isLoadingRecentlyAdded ? (
              <SectionSkeleton />
            ) : filteredRecentlyAdded.length > 0 && (
              <ContentGrid
                title="Recently Added"
                items={filteredRecentlyAdded}
                onCardClick={handlePlayContent}
              />
            )}
          </>
        )}

        
        
        {!searchQuery.trim() && currentCategory === 'all' && (
          <>
            {isLoadingTop10 ? (
              <SectionSkeleton />
            ) : filteredTop10Content.length > 0 && (
              <Top10Grid
                items={filteredTop10Content}
                onCardClick={handlePlayContent}
              />
            )}
          </>
        )}

        
        
        {filteredContent.continue.length > 0 && (
          <ContentGrid
            title="Continue Watching"
            items={filteredContent.continue}
            onCardClick={handlePlayContent}
            featured={true}
          />
        )}

        
        {!isSearching && filteredRowMyList.length > 0 && (
          <ContentGrid
            title="My List"
            items={filteredRowMyList}
            onCardClick={handlePlayContent}
          />
        )}

        
        {!isSearching && (
          <>
            {isLoadingForYou ? (
              <SectionSkeleton />
            ) : filteredRowForYou.length > 0 && (
              <ContentGrid
                title="For You"
                items={filteredRowForYou}
                onCardClick={handlePlayContent}
              />
            )}
          </>
        )}

        
        {!isSearching && filteredRowBecause.items.length > 0 && (
          <ContentGrid
            title={filteredRowBecause.title}
            items={filteredRowBecause.items}
            onCardClick={handlePlayContent}
          />
        )}

        
        {!searchQuery.trim() && currentCategory === 'all' && !rowMoodContent && (
          <MoodSelector onSelect={handleMoodSelect} />
        )}

        
        {!isSearching && filteredRowMoodContent && (
          <div className="mood-content-section">
            <ContentGrid
              title={filteredRowMoodContent.title}
              items={filteredRowMoodContent.items}
              onCardClick={handlePlayContent}
            />
            <button 
              className="clear-mood-btn"
              onClick={() => setRowMoodContent(null)}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
            >
              Clear & Browse More
            </button>
          </div>
        )}

        

        
        {!isSearching && filteredRowTrendingToday.length > 0 && (
          <ContentGrid
            title="Trending Right Now"
            items={filteredRowTrendingToday}
            onCardClick={handlePlayContent}
          />
        )}

        {filteredContent.trending.length > 0 && !searchQuery.trim() && (
          <ContentGrid
            title="Trending This Week"
            items={filteredContent.trending}
            onCardClick={handlePlayContent}
          />
        )}

        
        {filteredContent.tv.length > 0 && currentCategory !== 'movies' && (
          <ContentGrid
            title="Popular TV Shows"
            items={filteredContent.tv}
            onCardClick={handlePlayContent}
          />
        )}

        
        {currentCategory !== 'tv' && filteredContent.action.length > 0 && (
          <ContentGrid
            title="Popular Movies"
            items={filteredContent.action}
            onCardClick={handlePlayContent}
          />
        )}

        
        
        {!isSearching && filteredRowAction.length > 0 && (
          <ContentGrid
            title="Action & Adventure"
            items={filteredRowAction}
            onCardClick={handlePlayContent}
          />
        )}

        
        {!isSearching && filteredRowComedy.length > 0 && (
          <ContentGrid
            title="Comedy"
            items={filteredRowComedy}
            onCardClick={handlePlayContent}
          />
        )}

        
        {!isSearching && filteredRowDarkMoody.length > 0 && (
          <ContentGrid
            title="Thriller & Horror"
            items={filteredRowDarkMoody}
            onCardClick={handlePlayContent}
          />
        )}

        
        {!isSearching && filteredRowFamily.length > 0 && (
          <ContentGrid
            title="Family & Animation"
            items={filteredRowFamily}
            onCardClick={handlePlayContent}
          />
        )}

        
        
        {!isSearching && filteredRowCriticallyAcclaimed.length > 0 && (
          <ContentGrid
            title="Critically Acclaimed"
            items={filteredRowCriticallyAcclaimed}
            onCardClick={handlePlayContent}
          />
        )}

        
        {!isSearching && filteredRowHiddenGems.length > 0 && (
          <ContentSquareGrid
            title="Hidden Gems"
            items={filteredRowHiddenGems}
            onCardClick={handlePlayContent}
          />
        )}

        
        
        {!isSearching && franchiseCollections.map((collection, idx) => {
          const filteredCollection = currentCategory === 'movies'
            ? collection.content.filter(i => i.type === 'movie')
            : currentCategory === 'tv'
            ? collection.content.filter(i => i.type === 'tv')
            : collection.content;
          
          return filteredCollection.length > 0 && (
            <ContentSquareGrid
              key={`franchise-${idx}`}
              title={`${collection.name}`}
              items={filteredCollection}
              onCardClick={handlePlayContent}
            />
          );
        })}

        
        {!isSearching && actorCollections.map((collection, idx) => {
          const filteredCollection = currentCategory === 'movies'
            ? collection.content.filter(i => i.type === 'movie')
            : currentCategory === 'tv'
            ? collection.content.filter(i => i.type === 'tv')
            : collection.content;
          
          return filteredCollection.length > 0 && (
            <ContentSquareGrid
              key={`actor-${idx}`}
              title={`Movies with ${collection.actor}`}
              items={filteredCollection}
              onCardClick={handlePlayContent}
              actorPhoto={collection.profilePath}
            />
          );
        })}

        
        
        {!isSearching && filteredRowComingSoon.length > 0 && (
          <ContentGrid
            title="Coming Soon"
            items={filteredRowComingSoon}
            onCardClick={handlePlayContent}
          />
        )}

        
        {searchQuery.trim() && filteredContent.trending.length > 0 && (
          <ContentGrid
            title={`Search Results for "${searchQuery}"`}
            items={filteredContent.trending}
            onCardClick={handlePlayContent}
          />
        )}
      </main>

      <PlayerModal
        content={selectedContent}
        playerUrl={selectedContent ? buildVidkingUrl(selectedContent) : ''}
        onClose={handleClosePlayer}
      />
    </div>
  );
}

export default App;

