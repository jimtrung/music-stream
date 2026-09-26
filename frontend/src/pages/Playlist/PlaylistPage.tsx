import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { setQueue, setIsPlaying, toggleShuffle } from '../../store/playerSlice';
import { getCoverUrl } from '../../utils/urlUtil';
import { Icon } from '../../components/Icons/Icons';
import TrackRow from '../../components/Shared/TrackRow';
import type { Track, Playlist } from '../../types';
import styles from './PlaylistPage.module.css';
import { useEffect, useState } from 'react';
import { playlistApi, mapPlaylistDTOToPlaylist } from '../../api/playlist.api';

const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userPlaylists = useSelector((state: RootState) => state.ui.userPlaylists);
  const shuffle = useSelector((state: RootState) => state.player.shuffle);

  const [dbPlaylist, setDbPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    // Try to fetch specific playlist first
    playlistApi.getById(id)
      .then(dto => {
        console.log('Playlist loaded from DB:', dto);
        setDbPlaylist(mapPlaylistDTOToPlaylist(dto));
      })
      .catch(err => {
        console.error('Error loading playlist by ID:', err);
        console.error('Attempted to fetch: /playlist/' + id);
        console.error('Error details:', err.response?.status, err.response?.data);
        
        // Fallback: try to fetch all playlists and find it
        console.log('Falling back to getAll()...');
        return playlistApi.getAll()
          .then(dtos => {
            const found = dtos.find(d => d.id === id);
            if (found) {
              console.log('Found playlist in getAll():', found);
              setDbPlaylist(mapPlaylistDTOToPlaylist(found));
            } else {
              console.warn('Playlist not found in any playlists');
              setError('Playlist not found');
            }
          })
          .catch(err2 => {
            console.error('Error fetching all playlists:', err2);
            setError('Failed to load playlist');
          });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  let playlist: Playlist | undefined = dbPlaylist || undefined;
  
  if (!playlist) {
    const userPlaylist = userPlaylists.find((p) => p.id === id);
    if (userPlaylist) {
      playlist = {
        ...userPlaylist,
        description: `${userPlaylist.trackIds.length} songs`,
        owner: 'You',
        ownerId: 'u1',
        cover: 'var(--color-bg-highlight)',
        followers: 0,
      };
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '2rem' }}>Loading playlist...</div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '2rem' }}>
          <h1>Playlist not found</h1>
          <p>{error || 'The playlist could not be loaded. Please try again.'}</p>
        </div>
      </div>
    );
  }

  const tracks: Track[] = (playlist as any)?.tracksData || [];

  // Use playlist cover from database (which is first track's cover), or calculate from first track
  const coverUrl = playlist.cover && playlist.cover.startsWith('http') 
    ? playlist.cover 
    : (playlist.cover ? getCoverUrl(playlist.cover) : (tracks.length > 0 ? getCoverUrl(tracks[0]?.coverUrl) : undefined));
  
  const coverStyle = coverUrl 
    ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      dispatch(setQueue({ tracks, startIndex: 0 }));
      dispatch(setIsPlaying(true));
    }
  };


  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const formatTotalDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.cover} style={coverStyle}>
          {!coverUrl && <Icon name="Playlist" size={72} />}
        </div>
        <div className={styles.info}>
          <span className={styles.type}>Playlist</span>
          <h1 className={styles.title}>{playlist.name}</h1>
          <p className={styles.description}>{playlist.description}</p>
          <div className={styles.meta}>
            <span>{playlist.owner}</span>
            <span className={styles.dot} />
            <span>{tracks.length} songs</span>
            <span className={styles.dot} />
            <span>{formatTotalDuration(totalDuration)}</span>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className={styles.controls}>
        <button className={styles.playBtn} onClick={handlePlayAll}>
          <Icon name="Play" size={24} />
        </button>
        <button
          className={`${styles.shuffleBtn} ${shuffle ? styles.active : ''}`}
          onClick={() => dispatch(toggleShuffle())}
        >
          <Icon name="Shuffle" size={22} />
        </button>
        {/* Temporarily disabled
        <button className={styles.likeBtn}>
          <Icon name="HeartOutline" size={22} />
        </button>
        */}
        <button className={styles.moreBtn}>
          <Icon name="More" size={22} />
        </button>

      </div>

      {/* Track List */}
      <div className={styles.trackList}>
        <div className={styles.trackListHeader}>
          <span>#</span>
          <span>Title</span>
          <span>
            <Icon name="Clock" size={16} />
          </span>
        </div>
        {tracks.map((track, index) => (
          <TrackRow key={track.id} track={track} index={index + 1} />
        ))}
      </div>
    </div>
  );
};

export default PlaylistPage;
