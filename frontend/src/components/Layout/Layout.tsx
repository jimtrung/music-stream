import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { useAudioPlayer } from '../../hooks';
import { togglePlay, setProgress } from '../../store/playerSlice';
import Sidebar from './Sidebar';
import PlayerBar from '../Player/PlayerBar';
import ExpandedPlayer from '../Player/ExpandedPlayer';
import ContextMenu from '../Shared/ContextMenu';
import styles from './Layout.module.css';

const Layout = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const location = useLocation();
  // Initialize audio player with the ref
  useAudioPlayer(audioRef);

  const isExpanded = useSelector((state: RootState) => state.player.isExpanded);
  const contextMenu = useSelector((state: RootState) => state.ui.contextMenu);
  const { isPlaying, currentTrack, progress } = useSelector((state: RootState) => state.player);
  const dispatch = useDispatch();

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!currentTrack) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          dispatch(togglePlay());
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentTrack?.duration) {
            const skipAmount = (5 / currentTrack.duration) * 100;
            const newProgress = Math.min(progressRef.current + skipAmount, 100);
            dispatch(setProgress(newProgress));
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentTrack?.duration) {
            const skipAmount = (5 / currentTrack.duration) * 100;
            const newProgress = Math.max(progressRef.current - skipAmount, 0);
            dispatch(setProgress(newProgress));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, dispatch]); // Removed progress dependency

  return (
    <div className={styles.appLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebarArea}>
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className={styles.mainArea}>
        {location.pathname.startsWith('/messages') ? (
          <Outlet />
        ) : (
          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        )}
      </main>

      {/* Player Bar */}
      <footer className={styles.playerArea}>
        <PlayerBar />
      </footer>

      {isExpanded && <ExpandedPlayer />}

      {/* Context Menu */}
      {contextMenu.isOpen && <ContextMenu />}

      {/* Global Audio Element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Layout;
