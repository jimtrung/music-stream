import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';
import {
  togglePlay,
  nextTrack,
  previousTrack,
  setProgress,
  setVolume,
  toggleShuffle,
  toggleRepeat,
  toggleExpanded
} from '../../store/playerSlice';
import { toggleLike } from '../../store/uiSlice';
import { formatDuration } from '../../utils/format';
import { getCoverUrl } from '../../utils/urlUtil';
import { Icon, type IconName } from '../Icons/Icons';
import styles from './PlayerBar.module.css';

const PlayerBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentTrack, isPlaying, progress, volume, shuffle, repeat, isLoading } = useSelector(
    (state: RootState) => state.player
  );
  const likedSongIds = useSelector((state: RootState) => state.ui.likedSongIds);

  const isLiked = currentTrack && likedSongIds.includes(currentTrack.id);

  const currentTime = currentTrack ? Math.floor((progress / 100) * (currentTrack.duration || 0)) : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    dispatch(setProgress(Math.min(100, Math.max(0, percentage))));
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    dispatch(setVolume(Math.min(100, Math.max(0, percentage))));
  };

  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);

  // Dragging logic for progress
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const handleProgressMouseDown = (e: React.MouseEvent) => {
    setIsDraggingProgress(true);
    handleProgressClick(e as any);
  };

  // Dragging logic for volume
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const handleVolumeMouseDown = (e: React.MouseEvent) => {
    setIsDraggingVolume(true);
    handleVolumeClick(e as any);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingProgress && progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        dispatch(setProgress(Math.min(100, Math.max(0, percentage))));
      } else if (isDraggingVolume && volumeSliderRef.current) {
        const rect = volumeSliderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        dispatch(setVolume(Math.min(100, Math.max(0, percentage))));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    if (isDraggingProgress || isDraggingVolume) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingProgress, isDraggingVolume, dispatch]);

  // Mute logic
  const prevVolume = useRef(volume || 50);
  const handleToggleMute = () => {
    if (volume > 0) {
      prevVolume.current = volume;
      dispatch(setVolume(0));
    } else {
      dispatch(setVolume(prevVolume.current));
    }
  };



  const getVolumeIcon = (): IconName => {
    if (volume === 0) return 'VolumeMute';
    if (volume < 50) return 'VolumeLow';
    return 'VolumeHigh';
  };

  if (!currentTrack) {
    return (
      <div className={styles.playerBar}>
        <div className={styles.emptyPlayer}>
          Select a song to start playing
        </div>
      </div>
    );
  }

  return (
    <div className={styles.playerBar}>
      {/* Left - Track Info */}
      <div className={styles.trackInfo}>
        <div
          className={styles.cover}
          onClick={() => dispatch(toggleExpanded())}
        >
          {currentTrack.coverUrl ? (
            <img src={getCoverUrl(currentTrack.coverUrl)} alt={currentTrack.title} />
          ) : (
            <Icon name="Music" size={24} />
          )}
        </div>
        <div className={styles.trackDetails}>
          <div className={styles.trackTitle}>{currentTrack.title}</div>
          <div className={styles.trackArtist}>{currentTrack.artistName || 'Unknown Artist'}</div>
        </div>
        {/* Temporarily disabled
        <button
          className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
          onClick={() => dispatch(toggleLike(currentTrack.id))}
        >
          <Icon name={isLiked ? 'Heart' : 'HeartOutline'} size={20} />
        </button>
        */}
      </div>

      {/* Center - Controls */}
      <div className={styles.controls}>
        <div className={styles.controlButtons}>
          <button
            className={`${styles.controlBtn} ${shuffle ? styles.active : ''}`}
            onClick={() => dispatch(toggleShuffle())}
            title="Shuffle"
          >
            <Icon name="Shuffle" size={20} />
          </button>
          <button
            className={styles.controlBtn}
            onClick={() => dispatch(previousTrack())}
            title="Previous"
          >
            <Icon name="SkipPrev" size={20} />
          </button>
          <button
            className={styles.playButton}
            onClick={() => dispatch(togglePlay())}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className={styles.spinner}></div>
            ) : (
              <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
            )}
          </button>
          <button
            className={styles.controlBtn}
            onClick={() => dispatch(nextTrack())}
            title="Next"
          >
            <Icon name="SkipNext" size={20} />
          </button>
          <button
            className={`${styles.controlBtn} ${repeat !== 'off' ? styles.active : ''}`}
            onClick={() => dispatch(toggleRepeat())}
            title={`Repeat: ${repeat}`}
          >
            <Icon name={repeat === 'one' ? 'RepeatOne' : 'Repeat'} size={20} />
          </button>
        </div>

        <div className={styles.progressContainer}>
          <span className={styles.time}>{formatDuration(currentTime)}</span>
          <div 
            className={styles.progressBar} 
            onMouseDown={handleProgressMouseDown}
            ref={progressBarRef}
          >
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.time}>{formatDuration(currentTrack.duration || 0)}</span>
        </div>
      </div>

      {/* Right - Volume & Extra */}
      <div className={styles.extraControls}>


        <div className={styles.volumeContainer}>
          <button className={styles.volumeIcon} onClick={handleToggleMute}>
            <Icon name={getVolumeIcon()} size={20} />
          </button>
          <div 
            className={styles.volumeSlider} 
            onMouseDown={handleVolumeMouseDown}
            ref={volumeSliderRef}
          >
            <div className={styles.volumeFill} style={{ width: `${volume}%` }} />
          </div>
        </div>

        <button
          className={styles.expandBtn}
          onClick={() => dispatch(toggleExpanded())}
          title="Expand"
        >
          <Icon name="Expand" size={20} />
        </button>
      </div>
    </div>
  );
};

export default PlayerBar;
