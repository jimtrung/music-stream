import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { Icon } from '../../components/Icons/Icons';
import PlaylistCard from '../../components/Shared/PlaylistCard';
import TrackRow from '../../components/Shared/TrackRow';
import type { Track, Playlist } from '../../types';
import styles from './LibraryPage.module.css';

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'liked', label: 'Liked Songs' },
];

const LibraryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('playlists');
  const userPlaylists = useSelector((state: RootState) => state.ui.userPlaylists);
  const likedSongIds = useSelector((state: RootState) => state.ui.likedSongIds);

  const likedSongs: Track[] = [];

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Your Library</h1>
        <div className={styles.actions}>
          <button className={styles.actionBtn}>
            <Icon name="Search" size={20} />
          </button>
          <button className={styles.actionBtn}>
            <Icon name="Plus" size={20} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'playlists' && (
        <div className={styles.playlistGrid}>
          {/* Temporarily disabled
          <div
            className={styles.likedCard}
            onClick={() => setActiveTab('liked')}
          >
            <div className={styles.likedCardIcon}>
              <Icon name="Heart" size={32} />
            </div>
            <h3 className={styles.likedCardTitle}>Liked Songs</h3>
            <p className={styles.likedCardMeta}>{likedSongIds.length} songs</p>
          </div>
          */}

          {/* User Playlists */}
          {userPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={{
                ...playlist,
                cover: 'var(--color-bg-highlight)',
                description: `${playlist.trackIds.length} songs`,
                owner: 'You',
                ownerId: 'u1',
                followers: 0,
              } as Playlist}
            />
          ))}
        </div>
      )}

      {activeTab === 'liked' && (
        <>
          {/* Liked Songs Banner */}
          <div className={styles.likedBanner}>
            <div className={styles.likedIcon}>
              <Icon name="Heart" size={48} />
            </div>
            <div className={styles.likedInfo}>
              <div className={styles.likedLabel}>Playlist</div>
              <h2 className={styles.likedTitle}>Liked Songs</h2>
              <p className={styles.likedMeta}>{likedSongs.length} songs</p>
            </div>
          </div>

          {/* Track List */}
          {likedSongs.length > 0 ? (
            <div className={styles.trackList}>
              <div className={styles.trackListHeader}>
                <span>#</span>
                <span>Title</span>
                <span>
                  <Icon name="Clock" size={16} />
                </span>
              </div>
              {likedSongs.map((track, index) => (
                <TrackRow key={track.id} track={track} index={index + 1} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <h3 className={styles.emptyTitle}>Songs you like will appear here</h3>
              <p>Save songs by tapping the heart icon.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LibraryPage;
