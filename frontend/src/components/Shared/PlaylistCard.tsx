import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setQueue, setIsPlaying } from '../../store/playerSlice';
import { getCoverUrl, DEFAULT_PLAYLIST_COVER } from '../../utils/urlUtil';
import { Icon } from '../Icons/Icons';
import CachedImage from './CachedImage';
import type { Playlist } from '../../types';
import styles from './PlaylistCard.module.css';

interface PlaylistCardProps {
  playlist: Playlist;
}

const PlaylistCard = ({ playlist }: PlaylistCardProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePlay = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const tracks = (playlist as any).tracksData || [];
    if (tracks.length > 0) {
      dispatch(setQueue({ tracks, startIndex: 0 }));
      dispatch(setIsPlaying(true));
    }
  };

  const handleClick = () => {
    navigate(`/playlist/${playlist.id}`);
  };

  // Get first track for cover image - prefer playlist.cover if available
  const getPlaylistCover = (): string | undefined => {
    // First, check if playlist already has a cover (from database)
    if (playlist.cover && playlist.cover.startsWith('http')) {
      return playlist.cover; // Already a full URL from database
    }
    if (playlist.cover) {
      return getCoverUrl(playlist.cover); // Relative path, build full URL
    }
    return undefined;
  };

  const coverUrl = getPlaylistCover() || DEFAULT_PLAYLIST_COVER;

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.cover}>
        <CachedImage src={coverUrl} alt={playlist.name} fallbackIcon="Playlist" iconSize={48} />
        <button
          className={styles.playButton}
          onClick={handlePlay}
          aria-label={`Play ${playlist.name}`}
        >
          <Icon name="Play" size={24} />
        </button>
      </div>
      <h3 className={styles.title}>{playlist.name}</h3>
      <p className={styles.subtitle}>{playlist.description}</p>
    </div>
  );
};

export default PlaylistCard;
