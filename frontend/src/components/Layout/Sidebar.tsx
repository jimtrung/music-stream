import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { Icon } from '../Icons/Icons';
import { getCoverUrl, DEFAULT_PLAYLIST_COVER } from '../../utils/urlUtil';
import styles from './Sidebar.module.css';
import { useEffect, useState } from 'react';
import { playlistApi, mapPlaylistDTOToPlaylist } from '../../api/playlist.api';
import type { Playlist } from '../../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const userPlaylists = useSelector((state: RootState) => state.ui.userPlaylists);
  const likedSongIds = useSelector((state: RootState) => state.ui.likedSongIds);
  const [dbPlaylists, setDbPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    playlistApi.getAll()
      .then(dtos => setDbPlaylists(dtos.map(mapPlaylistDTOToPlaylist)))
      .catch(console.error);
  }, []);



  return (
    <aside className={styles.sidebar}>
      {/* Main Navigation */}
      <nav className={styles.navBox}>
        <ul className={styles.navList}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon name="Home" size={24} />
              <span>{t('common.home')}</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/search"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon name="Search" size={24} />
              <span>{t('common.search')}</span>
            </NavLink>
          </li>
          {profile?.role === 'admin' && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon name="Settings" size={24} />
                <span>{t('common.adminPanel')}</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* Library Section */}
      <div className={styles.libraryBox}>
        <header className={styles.libraryHeader}>
          <NavLink
            to="/library"
            className={styles.libraryTitle}
          >
            <Icon name="Library" size={24} />
            <span>{t('common.library')}</span>
          </NavLink>
          <button className={styles.addButton} title="Create playlist">
            <Icon name="Plus" size={20} />
          </button>
        </header>

        {/* Playlists */}
        <div className={styles.playlistList}>
          {/* Temporarily disabled
          <div
            className={styles.playlistItem}
            onClick={() => navigate('/library/liked')}
          >
            <div className={`${styles.playlistCover} ${styles.likedSongsCover}`}>
              <Icon name="Heart" size={20} />
            </div>
            <div className={styles.playlistInfo}>
              <div className={styles.playlistName}>{t('common.likedSongs')}</div>
              <div className={styles.playlistMeta}>{t('common.playlists')} • {likedSongIds.length} {t('common.songs')}</div>
            </div>
          </div>
          */}

          {/* User Playlists */}
          {userPlaylists.map((playlist) => {
            const coverUrl = DEFAULT_PLAYLIST_COVER;

            return (
              <div
                key={playlist.id}
                className={styles.playlistItem}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              >
                <div
                  className={styles.playlistCover}
                  style={{ backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover' }}
                >
                  {!coverUrl && <Icon name="Music" size={20} />}
                </div>
                <div className={styles.playlistInfo}>
                  <div className={styles.playlistName}>{playlist.name}</div>
                  <div className={styles.playlistMeta}>Playlist • {playlist.trackIds.length} songs</div>
                </div>
              </div>
            );
          })}

          {/* Featured Playlists */}
          {dbPlaylists.slice(0, 3).map((playlist) => {
            const coverUrl = playlist.cover || DEFAULT_PLAYLIST_COVER;

            return (
              <div
                key={playlist.id}
                className={styles.playlistItem}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              >
                <div
                  className={styles.playlistCover}
                  style={{ backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover' }}
                >
                  {!coverUrl && <Icon name="Playlist" size={20} />}
                </div>
                <div className={styles.playlistInfo}>
                  <div className={styles.playlistName}>{playlist.name}</div>
                  <div className={styles.playlistMeta}>Playlist • {playlist.owner}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
