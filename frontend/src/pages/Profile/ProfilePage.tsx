import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { artistApi } from '../../api/artist.api';
import { MINIO_BASE_URL } from '../../constants/env';
import { Icon } from '../../components/Icons/Icons';
import PlaylistCard from '../../components/Shared/PlaylistCard';
import Button from '../../components/Shared/Button';
import Modal from '../../components/Shared/Modal';
import type { Playlist, Track } from '../../types';
import styles from './ProfilePage.module.css';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { username } = useParams<{ username: string }>();
  const { getProfile, profile: authProfile, user, logout } = useAuth();
  const navigate = useNavigate();
  const [displayedProfile, setDisplayedProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState('playlists');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    name: '',
    bio: '',
    avatar: null as File | null
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        if (!username || username === 'me' || username === authProfile?.username) {
          setDisplayedProfile(authProfile);
        } else {
          const fetchedProfile = await authApi.getProfileByUsername(username);
          if (fetchedProfile.avatarUrl && !fetchedProfile.avatarUrl.startsWith('http')) {
            fetchedProfile.avatarUrl = MINIO_BASE_URL + fetchedProfile.avatarUrl;
          }
          setDisplayedProfile(fetchedProfile);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setDisplayedProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [username, authProfile]);

  const profile = displayedProfile;
  const isCurrentUser = profile && authProfile && (
    (authProfile.userId && profile.userId && authProfile.userId === profile.userId) ||
    (authProfile.userId && profile.id && authProfile.userId === profile.id) ||
    (authProfile.username && profile.username && authProfile.username === profile.username)
  );

  useEffect(() => {
    if (profile && !isCurrentUser) {
      artistApi.checkFollowStatus(profile.userId || profile.id).then(status => {
        setIsFollowing(status);
      }).catch(err => console.error("Could not check follow status", err));
    }
  }, [profile, isCurrentUser]);

  if (loadingProfile) {
    return (
      <div className={styles.notFound}>
        <h2>{t('profile.loading')}</h2>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.notFound}>
        <Icon name="User" size={64} />
        <h2>{t('profile.notFound')}</h2>
        <Button onClick={() => navigate('/')}>{t('profile.backHome')}</Button>
      </div>
    );
  }


  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await artistApi.unfollowArtist(profile.userId || profile.id);
        setIsFollowing(false);
        setDisplayedProfile((prev: any) => ({ ...prev, followers: Math.max((prev.followers || 0) - 1, 0) }));
      } else {
        await artistApi.followArtist(profile.userId || profile.id);
        setIsFollowing(true);
        setDisplayedProfile((prev: any) => ({ ...prev, followers: (prev.followers || 0) + 1 }));
      }
    } catch (err) {
      console.error("Failed to toggle follow status", err);
      alert("Failed to follow/unfollow. Please try again.");
    }
  };

  const handleMessage = () => {
    navigate('/messages', {
      state: {
        userId: profile.userId || profile.id,
        name: profile.name || profile.username,
        avatarUrl: profile.avatarUrl
      }
    });
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/signin');
  };

  const handleEditProfile = () => {
    setEditingProfile({
      name: profile.name || '',
      bio: profile.bio || '',
      avatar: null
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      if (editingProfile.name) formData.append('name', editingProfile.name);
      if (editingProfile.bio) formData.append('bio', editingProfile.bio);
      if (editingProfile.avatar) formData.append('avatar', editingProfile.avatar);

      await authApi.updateProfile(formData as any);
      await getProfile();
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get user's playlists
  const userPlaylists: Playlist[] = [];

  // Get recently played tracks
  const recentlyPlayed: Track[] = [];

  const tabs = [
    { id: 'playlists', label: t('common.playlists'), count: userPlaylists.length },
    { id: 'recent', label: t('profile.noRecent').replace('No ', '').replace('Chưa có ', ''), count: recentlyPlayed.length }
  ];

  return (
    <div className={styles.page}>
      {/* Profile Header */}
      <header className={styles.header}>
        <div className={styles.avatarLarge}>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} className={styles.avatarImg} alt={profile.name} />
          ) : (
            profile.name?.charAt(0) || '?'
          )}
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.profileLabel}>{t('profile.title')}</span>
          <h1 className={styles.displayName}>{profile.name}</h1>
          <p className={styles.username}>{profile.username}</p>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{profile.followers || 0}</span>
              <span className={styles.statLabel}>{t('profile.followers')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{profile.following || 0}</span>
              <span className={styles.statLabel}>{t('profile.following')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{userPlaylists.length}</span>
              <span className={styles.statLabel}>{t('common.playlists')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {isCurrentUser ? (
              <>
                <Button variant="outline" onClick={handleEditProfile}>
                  {t('profile.editProfile')}
                </Button>
                <Button variant="secondary" onClick={() => setShowLogoutModal(true)}>
                  {t('profile.logout')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={isFollowing ? 'outline' : 'primary'}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Followed' : t('profile.follow')}
                </Button>
                <button className={styles.moreBtn}>
                  <Icon name="MoreHorizontal" size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className={styles.tabCount}>{tab.count}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === 'playlists' && (
          <div className={styles.playlistGrid}>
            {userPlaylists.length > 0 ? (
              userPlaylists.map(playlist => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))
            ) : (
              <div className={styles.empty}>
                <Icon name="Playlist" size={48} />
                <p>{t('profile.noPlaylists')}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className={styles.trackList}>
            {recentlyPlayed.length > 0 ? (
              recentlyPlayed.map((track, index) => (
                <div key={track.id} className={styles.trackItem}>
                  <span className={styles.trackIndex}>{index + 1}</span>
                  <div className={styles.trackCover}>
                    <Icon name="Music" size={20} />
                  </div>
                  <div className={styles.trackInfo}>
                    <span className={styles.trackTitle}>{track.title}</span>
                    <span className={styles.trackArtist}>{track.artistName || 'Unknown Artist'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>
                <Icon name="Clock" size={48} />
                <p>{t('profile.noRecent')}</p>
              </div>
            )}
          </div>
        )}



      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t('profile.editTitle')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>
              {t('profile.cancel')}
            </Button>
            <Button onClick={handleSaveProfile} disabled={isUpdating}>
              {t('profile.saveChanges')}
            </Button>
          </>
        }
      >
        <div className={styles.editForm}>
          <div className={styles.formGroup}>
            <label>{t('profile.displayName')}</label>
            <input
              type="text"
              value={editingProfile.name}
              onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
              placeholder={t('profile.namePlaceholder')}
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t('profile.bio')}</label>
            <textarea
              value={editingProfile.bio}
              onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
              placeholder={t('profile.bioPlaceholder')}
              rows={3}
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t('profile.avatar')}</label>
            <div className={styles.avatarUpload}>
              <div className={styles.avatarPreview}>
                {editingProfile.avatar ? (
                  <img src={URL.createObjectURL(editingProfile.avatar)} alt="Preview" />
                ) : profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Current" />
                ) : (
                  <Icon name="User" size={32} />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setEditingProfile({ ...editingProfile, avatar: file });
                }}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={t('profile.logoutTitle')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowLogoutModal(false)}>
              {t('profile.cancel')}
            </Button>
            <Button onClick={handleLogout}>{t('profile.logoutTitle')}</Button>
          </>
        }
      >
        <p>{t('profile.logoutConfirm')}</p>
      </Modal>
    </div>
  );
};

export default ProfilePage;
