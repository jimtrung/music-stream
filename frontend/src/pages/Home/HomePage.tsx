import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setQueue, setIsPlaying } from '../../store/playerSlice';
import { setHomeData } from '../../store/homeDataSlice';
import type { RootState } from '../../store/store';
import { Icon } from '../../components/Icons/Icons';
import PlaylistCard from '../../components/Shared/PlaylistCard';
import CachedImage from '../../components/Shared/CachedImage';
import type { Playlist, Track, UserProfile } from '../../types';
import styles from './HomePage.module.css';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';
import { playlistApi, mapPlaylistDTOToPlaylist } from '../../api/playlist.api';
import { trackApi } from '../../api/track.api';
import { artistApi } from '../../api/artist.api';
import TrackRow from '../../components/Shared/TrackRow';
import { DEFAULT_PLAYLIST_COVER, getCoverUrl } from '../../utils/urlUtil';
import { setActiveSearchFilter } from '../../store/uiSlice';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, profile } = useAuth();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greetingMorning');
    if (hour < 18) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  };

  const { playlists: dbPlaylists, tracks: dbTracks, artists: dbArtists, hasLoaded } = useSelector((state: RootState) => state.homeData);

  useEffect(() => {
    if (hasLoaded) return;

    Promise.all([
      playlistApi.getAll(),
      trackApi.getAll(),
      artistApi.getArtists()
    ]).then(([playlistDtos, trackDtos, artistDtos]) => {
      const mappedPlaylists = playlistDtos.map(mapPlaylistDTOToPlaylist);
      const mappedTracks = trackDtos as any;
      const mappedArtists = artistDtos.map(a => ({
        id: a.id,
        username: a.username || a.name.toLowerCase().replace(/\s+/g, ''),
        name: a.name,
        avatar: a.avatarUrl,
        role: 'artist' as const
      }));

      dispatch(setHomeData({
        playlists: mappedPlaylists,
        tracks: mappedTracks,
        artists: mappedArtists
      }));
    }).catch(console.error);
  }, [dispatch, hasLoaded]);



  return (
    <div className={styles.page}>
      {/* Header with Profile */}
      <header className={styles.header}>
        <h1 className={styles.greeting}>{getGreeting()}</h1>
        <div className={styles.headerActions}>
          {/* Temporarily disabled
          <button
            className={styles.notificationBtn}
            onClick={() => navigate('/messages')}
            title="Messages"
          >
            <Icon name="Message" size={20} />
          </button>
          */}
          <button
            className={styles.notificationBtn}
            onClick={() => navigate('/settings')}
            title="Settings"
          >
            <Icon name="Settings" size={20} />
          </button>
          {isAuthenticated ?
            <button
              className={styles.profileBtn}
              onClick={() => {
                if (!profile) return;
                navigate('/profile/' + profile.username)
              }
              }
              title="Profile"
            >
              {profile?.avatarUrl ? (
                <CachedImage src={profile.avatarUrl} className={styles.avatar} alt="Profile" fallbackIcon="User" />
              ) : (
                <Icon name="User" size={20} />
              )}
            </button>
            :
            <button
              className={styles.profileBtn}
              onClick={() => navigate('/signin')}
              title="Sign In"
            >
              <Icon name="User" size={20} />
            </button>
          }
        </div>
      </header>

      {/* Playlists Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('common.playlists')}</h2>
          <button
            className={styles.seeAll}
            onClick={() => {
              dispatch(setActiveSearchFilter('playlists'));
              navigate('/search');
            }}
          >
            {t('common.showAll')}
          </button>
        </div>
        <div className={styles.playlistGrid}>
          {dbPlaylists.slice(0, 6).map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </section>

      {/* Tracks Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('common.songs')}</h2>
          <button
            className={styles.seeAll}
            onClick={() => {
              dispatch(setActiveSearchFilter('tracks'));
              navigate('/search');
            }}
          >
            {t('common.showAll')}
          </button>
        </div>
        <div className={styles.trackList}>
          <div className={styles.trackListHeader}>
            <span>#</span>
            <span>Title</span>
            <span>
              <Icon name="Clock" size={16} />
            </span>
          </div>
          {dbTracks.slice(0, 6).map((track, index) => (
            <TrackRow key={track.id} track={track} index={index + 1} />
          ))}
        </div>
      </section>

      {/* Artists Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('common.artists')}</h2>
          <button
            className={styles.seeAll}
            onClick={() => {
              dispatch(setActiveSearchFilter('artists'));
              navigate('/search');
            }}
          >
            {t('common.showAll')}
          </button>
        </div>
        <div className={styles.userGrid}>
          {dbArtists.slice(0, 7).map(user => (
            <div
              key={user.id}
              className={styles.userCard}
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              <div className={styles.userAvatar}>
                {user.avatar && !user.avatar.startsWith('http') && user.avatar.length === 1 && !user.avatar.includes('/') ? (
                  <span className={styles.avatarInitial}>{user.avatar}</span>
                ) : (
                  <CachedImage src={user.avatar ? getCoverUrl(user.avatar) : DEFAULT_PLAYLIST_COVER} alt={user.name} fallbackIcon="User" />
                )}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userHandle}>Artist</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
