import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { setSearchQuery, setActiveSearchFilter } from '../../store/uiSlice';
import { Icon } from '../../components/Icons/Icons';
import type { Track, Playlist, UserProfile } from '../../types';
import TrackRow from '../../components/Shared/TrackRow';
import PlaylistCard from '../../components/Shared/PlaylistCard';
import styles from './SearchPage.module.css';
import { useTranslation } from 'react-i18next';

interface Filter {
  id: string;
  label: string;
}

const filters: Filter[] = [
  { id: 'all', label: 'common.all' },
  { id: 'tracks', label: 'common.songs' },
  { id: 'playlists', label: 'common.playlists' },
  { id: 'artists', label: 'common.artists' },
];

const SearchPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchQuery = useSelector((state: RootState) => state.ui.searchQuery);
  const activeFilter = useSelector((state: RootState) => state.ui.activeSearchFilter);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
    dispatch(setSearchQuery(e.target.value));
  };

  const handleClear = () => {
    setLocalQuery('');
    dispatch(setSearchQuery(''));
  };

  const results = useMemo(() => {
    return {
      tracks: [] as Track[],
      playlists: [] as Playlist[],
      users: [] as UserProfile[]
    };
  }, [localQuery]);

  const topResult = useMemo(() => {
    const trimmedQuery = localQuery.trim();
    if (!trimmedQuery) return null;
    
    const query = trimmedQuery.toLowerCase();
    
    // 1. Exact matches (highest priority)
    // Check for exact user/profile match first (often what people search for specifically)
    const exactUser = results.users.find(u => 
      u.name.toLowerCase() === query || 
      u.username.toLowerCase() === query || 
      u.username.toLowerCase() === `@${query}`
    );
    if (exactUser) return { ...exactUser, type: 'profile' };

    const exactTrack = results.tracks.find(t => t.title.toLowerCase() === query);
    if (exactTrack) return { ...exactTrack, type: 'track' };

    const exactPlaylist = results.playlists.find(p => p.name.toLowerCase() === query);
    if (exactPlaylist) return { ...exactPlaylist, type: 'playlist' };
    
    // 2. Starts with matches
    const startsWithUser = results.users.find(u => u.name.toLowerCase().startsWith(query));
    if (startsWithUser) return { ...startsWithUser, type: 'profile' };

    const startsWithTrack = results.tracks.find(t => t.title.toLowerCase().startsWith(query));
    if (startsWithTrack) return { ...startsWithTrack, type: 'track' };

    // 3. Fallback to first result
    if (results.users.length > 0) return { ...results.users[0], type: 'profile' };
    if (results.tracks.length > 0) return { ...results.tracks[0], type: 'track' };
    if (results.playlists.length > 0) return { ...results.playlists[0], type: 'playlist' };
    
    return null;
  }, [results, localQuery]);

  const showCategories = !localQuery.trim();
  const hasResults = results.tracks.length > 0 || results.playlists.length > 0 || results.users.length > 0;

  const handleFilterClick = (filterId: string) => {
    dispatch(setActiveSearchFilter(filterId));
  };

  return (
    <div className={styles.page}>
      <header className={styles.searchHeader}>
        <div className={styles.searchInput}>
          <span className={styles.searchIcon}>
            <Icon name="Search" size={20} />
          </span>
          <input
            type="text"
            className={styles.input}
            placeholder={t('search.placeholder')}
            value={localQuery}
            onChange={handleSearch}
            autoFocus
          />
          {localQuery && (
            <button className={styles.clearBtn} onClick={handleClear}>
              <Icon name="Close" size={18} />
            </button>
          )}
        </div>

        <div className={styles.filters}>
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`${styles.filterBtn} ${activeFilter === filter.id ? styles.active : ''}`}
              onClick={() => handleFilterClick(filter.id)}
            >
              {filter.id === 'all' ? t('common.all') : 
               filter.id === 'tracks' ? t('common.songs') :
               filter.id === 'playlists' ? t('common.playlists') :
               t('common.artists')}
            </button>
          ))}
        </div>
      </header>

      {showCategories && (
        <div className={styles.categoriesGrid}>
          {[]}
        </div>
      )}

      {!showCategories && (
        <div className={styles.results}>
          {hasResults ? (
            <div className={styles.resultsContainer}>
              
              {/* All Results View */}
              {activeFilter === 'all' && (
                <>
                  <div className={styles.topResultsLayout}>
                    {/* Top Result Section */}
                    {topResult && (
                      <section className={styles.resultSection}>
                        <h2 className={styles.sectionTitle}>{t('common.topResult')}</h2>
                        <div 
                          className={styles.topResultCard}
                          onClick={() => {
                            if ((topResult as any).type === 'track') {
                              // Play track logic or navigate
                            } else if ((topResult as any).type === 'profile') {
                              navigate(`/profile/${(topResult as any).username}`);
                            } else {
                              navigate(`/playlist/${topResult.id}`);
                            }
                          }}
                        >
                          <div className={`${styles.topResultImage} ${(topResult as any).type === 'profile' ? styles.circular : ''}`}>
                            <img 
                              src={(topResult as any).coverUrl || (topResult as any).avatar || (topResult as any).cover} 
                              alt={(topResult as any).title || (topResult as any).name} 
                            />
                          </div>
                          <div className={styles.topResultInfo}>
                            <h3 className={styles.topResultTitle}>{(topResult as any).title || (topResult as any).name}</h3>
                            <div className={styles.topResultMeta}>
                              <span className={styles.topResultCategory}>{(topResult as any).type}</span>
                              {(topResult as any).artistName && <span className={styles.topResultArtist}>• {(topResult as any).artistName}</span>}
                            </div>
                          </div>
                          <button className={styles.playButtonOverlay}>
                            <Icon name="Play" size={24} />
                          </button>
                        </div>
                      </section>
                    )}

                    {/* Top Songs */}
                    {results.tracks.length > 0 && (
                      <section className={styles.resultSection}>
                        <div className={styles.sectionHeader}>
                          <h2 className={styles.sectionTitle}>{t('common.songs')}</h2>
                          {results.tracks.length > 6 && (
                            <button className={styles.seeAll} onClick={() => handleFilterClick('tracks')}>
                              {t('common.showAll')}
                            </button>
                          )}
                        </div>
                        <div className={styles.trackList}>
                          {results.tracks.slice(0, 6).map((track, index) => (
                            <TrackRow key={track.id} track={track} index={index + 1} />
                          ))}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Playlists Section in All */}
                  {results.playlists.length > 0 && (
                    <section className={styles.resultSection}>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('common.playlists')}</h2>
                        {results.playlists.length > 6 && (
                          <button className={styles.seeAll} onClick={() => handleFilterClick('playlists')}>
                            {t('common.showAll')}
                          </button>
                        )}
                      </div>
                      <div className={styles.playlistGrid}>
                        {results.playlists.slice(0, 6).map(playlist => (
                          <PlaylistCard key={playlist.id} playlist={playlist} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Profiles Section in All */}
                  {results.users.length > 0 && (
                    <section className={styles.resultSection}>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('common.profiles')}</h2>
                        {results.users.length > 6 && (
                          <button className={styles.seeAll} onClick={() => handleFilterClick('artists')}>
                            {t('common.showAll')}
                          </button>
                        )}
                      </div>
                      <div className={styles.userGrid}>
                        {results.users.slice(0, 6).map(user => (
                          <div 
                            key={user.id} 
                            className={styles.userCard}
                            onClick={() => navigate(`/profile/${user.username}`)}
                          >
                            <div className={styles.userAvatar}>
                              {user.avatar && !user.avatar.startsWith('http') && user.avatar.length === 1 ? (
                                <span className={styles.avatarInitial}>{user.avatar}</span>
                              ) : (
                                <img src={user.avatar} alt={user.name} />
                              )}
                            </div>
                            <div className={styles.userInfo}>
                              <span className={styles.userName}>{user.name}</span>
                              <span className={styles.userHandle}>Profile</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* Filtered Views */}
              {activeFilter === 'tracks' && (
                <section className={styles.resultSection}>
                  <h2 className={styles.sectionTitle}>All Songs</h2>
                  <div className={styles.trackList}>
                    {results.tracks.map((track, index) => (
                      <TrackRow key={track.id} track={track} index={index + 1} />
                    ))}
                  </div>
                </section>
              )}

              {activeFilter === 'playlists' && (
                <section className={styles.resultSection}>
                  <h2 className={styles.sectionTitle}>All Playlists</h2>
                  <div className={styles.playlistGrid}>
                    {results.playlists.map(playlist => (
                      <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                  </div>
                </section>
              )}

              {(activeFilter === 'artists' || activeFilter === 'users') && (
                <section className={styles.resultSection}>
                  <h2 className={styles.sectionTitle}>All Profiles</h2>
                  <div className={styles.userGrid}>
                    {results.users.map(user => (
                      <div 
                        key={user.id} 
                        className={styles.userCard}
                        onClick={() => navigate(`/profile/${user.username.replace('@', '')}`)}
                      >
                        <div className={styles.userAvatar}>
                          {user.avatar && !user.avatar.startsWith('http') && user.avatar.length === 1 ? (
                            <span className={styles.avatarInitial}>{user.avatar}</span>
                          ) : (
                            <img src={user.avatar} alt={user.name} />
                          )}
                        </div>
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{user.name}</span>
                          <span className={styles.userHandle}>Profile</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          ) : (
            <div className={styles.noResults}>
              <Icon name="Search" size={64} />
              <h3 className={styles.noResultsTitle}>{t('common.noResults', { query: localQuery })}</h3>
              <p>{t('common.checkSpelling')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
