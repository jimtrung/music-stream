import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { setCurrentTrack, setIsPlaying } from '../../store/playerSlice';
import { toggleLike, openContextMenu } from '../../store/uiSlice';
import { formatDuration } from '../../utils/format';
import { Icon } from '../Icons/Icons';
import CachedImage from './CachedImage';
import { getCoverUrl } from '../../utils/urlUtil';
import type { Track } from '../../types';
import styles from './TrackRow.module.css';

interface TrackRowProps {
  track: Track;
  index: number;
  showCover?: boolean;
}

const TrackRow = ({ track, index, showCover = true }: TrackRowProps) => {
  const dispatch = useDispatch();
  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const likedSongIds = useSelector((state: RootState) => state.ui.likedSongIds);

  const isPlaying = currentTrack?.id === track.id;
  const isLiked = likedSongIds.includes(track.id);

  const handlePlay = () => {
    dispatch(setCurrentTrack(track));
    dispatch(setIsPlaying(true));
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    dispatch(openContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'track',
      targetId: track.id
    }));
  };

  return (
    <div
      className={`${styles.trackRow} ${isPlaying ? styles.playing : ''}`}
      onClick={handlePlay}
      onContextMenu={handleContextMenu}
    >
      <div className={styles.index}>
        <span className={styles.indexNumber}>{index}</span>
        <button className={styles.playIcon} onClick={handlePlay}>
          <Icon name="Play" size={16} />
        </button>
      </div>

      <div className={styles.info}>
        {showCover && (
          <div className={styles.cover}>
            <CachedImage 
              src={track.coverUrl ? getCoverUrl(track.coverUrl) : undefined} 
              alt={track.title} 
              fallbackIcon="Music" 
              iconSize={18} 
            />
          </div>
        )}
        <div className={styles.details}>
          <div className={styles.title}>{track.title}</div>
          <div className={styles.artist}>{track.artistName || 'Unknown Artist'}</div>
        </div>
      </div>

      <div className={styles.actions}>
        {/* Temporarily disabled
        <button
          className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
          onClick={() => dispatch(toggleLike(track.id))}
        >
          <Icon name={isLiked ? 'Heart' : 'HeartOutline'} size={18} />
        </button>
        */}
        <span className={styles.duration}>{formatDuration(track.duration || 0)}</span>
        <button className={styles.moreBtn}>
          <Icon name="More" size={18} />
        </button>
      </div>
    </div>
  );
};

export default TrackRow;
