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
  setExpanded
} from '../../store/playerSlice';
import { toggleLike } from '../../store/uiSlice';
import { formatDuration } from '../../utils/format';
import { getCoverUrl } from '../../utils/urlUtil';
import { Icon, type IconName } from '../Icons/Icons';
import styles from './ExpandedPlayer.module.css';

const ExpandedPlayer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentTrack, isPlaying, progress, volume, shuffle, repeat, isLoading } = useSelector(
    (state: RootState) => state.player
  );
  const likedSongIds = useSelector((state: RootState) => state.ui.likedSongIds);

  const isLiked = currentTrack && likedSongIds.includes(currentTrack.id);
  const progressPercent = currentTrack ? (progress / (currentTrack.duration || 1)) * 100 : 0;
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

  const handleClose = () => {
    dispatch(setExpanded(false));
  };



  if (!currentTrack) return null;

  const getVolumeIcon = (): IconName => {
    if (volume === 0) return 'VolumeMute';
    if (volume < 50) return 'VolumeLow';
    return 'VolumeHigh';
  };

  return (
    <div className={styles.overlay}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.collapseBtn} onClick={handleClose}>
          <Icon name="ChevronDown" size={24} />
        </button>
        <div className={styles.nowPlaying}>
          <span className={styles.nowPlayingLabel}>Now Playing</span>
          <span className={styles.nowPlayingSource}>Music Streaming</span>
        </div>
        <button className={styles.moreBtn}>
          <Icon name="More" size={24} />
        </button>
      </header>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Album Art */}
        <div className={styles.artwork}>
          {currentTrack.coverUrl ? (
            <img src={getCoverUrl(currentTrack.coverUrl)} alt={currentTrack.title} />
          ) : (
            <Icon name="Music" size={80} />
          )}
        </div>

        {/* Track Info */}
        <div className={styles.trackInfo}>
          <h1 className={styles.title}>{currentTrack.title}</h1>
          <p className={styles.artist}>{currentTrack.artistName || 'Unknown Artist'}</p>
        </div>

        {/* Progress Bar */}
        <div className={styles.progress}>
          <div 
            className={styles.progressBar} 
            onMouseDown={handleProgressMouseDown}
            ref={progressBarRef}
          >
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.times}>
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(currentTrack.duration || 0)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className={styles.controls}>
          <button
            className={`${styles.controlBtn} ${shuffle ? styles.active : ''}`}
            onClick={() => dispatch(toggleShuffle())}
          >
            <Icon name="Shuffle" size={24} />
          </button>
          <button className={styles.controlBtn} onClick={() => dispatch(previousTrack())}>
            <Icon name="SkipPrev" size={28} />
          </button>
          <button className={styles.playButton} onClick={() => dispatch(togglePlay())}>
            {isLoading ? (
              <div className={styles.spinner}></div>
            ) : (
              <Icon name={isPlaying ? 'Pause' : 'Play'} size={32} />
            )}
          </button>
          <button className={styles.controlBtn} onClick={() => dispatch(nextTrack())}>
            <Icon name="SkipNext" size={28} />
          </button>
          <button
            className={`${styles.controlBtn} ${repeat !== 'off' ? styles.active : ''}`}
            onClick={() => dispatch(toggleRepeat())}
          >
            <Icon name={repeat === 'one' ? 'RepeatOne' : 'Repeat'} size={24} />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className={styles.bottomActions}>
          {/* Temporarily disabled
          <button
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
            onClick={() => dispatch(toggleLike(currentTrack.id))}
          >
            <Icon name={isLiked ? 'Heart' : 'HeartOutline'} size={20} />
            <span>Like</span>
          </button>
          */}



          <div className={styles.volume}>
            <button className={styles.volumeBtn} onClick={handleToggleMute}>
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
        </div>
      </div>
    </div>
  );
};

export default ExpandedPlayer;
