import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { closeContextMenu, addToPlaylist, toggleLike } from '../../store/uiSlice';
import { setQueue, setIsPlaying } from '../../store/playerSlice';

import { useNavigate } from 'react-router-dom';
import styles from './ContextMenu.module.css';

const ContextMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const { x, y, type, targetId } = useSelector((state: RootState) => state.ui.contextMenu);
  const userPlaylists = useSelector((state: RootState) => state.ui.userPlaylists);
  const likedSongIds = useSelector((state: RootState) => state.ui.likedSongIds);

  // We can't look up track without API, context menu should ideally receive track object in state.
  // For now, track operations in context menu might not work for 'track' type without object.
  const track: any = null;
  const isLiked = track && likedSongIds.includes(track.id);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        dispatch(closeContextMenu());
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [dispatch]);

  // Adjust position to stay in viewport
  const adjustedPosition = {
    left: Math.min(x, window.innerWidth - 220),
    top: Math.min(y, window.innerHeight - 300)
  };

  const handleAddToQueue = () => {
    if (track) {
      // In a real app, this would add to queue
      dispatch(setQueue({ tracks: [track], startIndex: 0 }));
      dispatch(setIsPlaying(true));
    }
    dispatch(closeContextMenu());
  };

  const handleToggleLike = () => {
    if (track) {
      dispatch(toggleLike(track.id));
    }
    dispatch(closeContextMenu());
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (track) {
      dispatch(addToPlaylist({ playlistId, trackId: track.id }));
    }
    dispatch(closeContextMenu());
  };



  if (type !== 'track') return null;

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={adjustedPosition}
    >
      <button className={styles.menuItem} onClick={handleAddToQueue}>
        <span className={styles.menuIcon}>▶</span>
        Play Now
      </button>

      <button className={styles.menuItem} onClick={handleAddToQueue}>
        <span className={styles.menuIcon}>📋</span>
        Add to Queue
      </button>

      <div className={styles.divider} />

      <button className={styles.menuItem} onClick={handleToggleLike}>
        <span className={styles.menuIcon}>{isLiked ? '💔' : '❤️'}</span>
        {isLiked ? 'Remove from Liked' : 'Add to Liked Songs'}
      </button>

      <div className={styles.submenu}>
        <button className={styles.menuItem}>
          <span className={styles.menuIcon}>➕</span>
          Add to Playlist
        </button>
        <div className={styles.submenuItems}>
          {userPlaylists.map((playlist) => (
            <button
              key={playlist.id}
              className={styles.menuItem}
              onClick={() => handleAddToPlaylist(playlist.id)}
            >
              {playlist.name}
            </button>
          ))}
        </div>
      </div>



      <button className={styles.menuItem}>
        <span className={styles.menuIcon}>📤</span>
        Share
      </button>
    </div>
  );
};

export default ContextMenu;
