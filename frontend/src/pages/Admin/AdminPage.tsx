import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../components/Icons/Icons';
import Button from '../../components/Shared/Button';
import { adminApi, DashboardStats } from '../../api/admin.api';
import styles from './AdminPage.module.css';

type AdminTab = 'dashboard' | 'users' | 'artists' | 'music';

const AdminPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search States
  const [userSearch, setUserSearch] = useState('');
  const [artistSearch, setArtistSearch] = useState('');
  const [trackSearch, setTrackSearch] = useState('');

  // Sort States
  const [userSort, setUserSort] = useState<{key: string, dir: 'asc'|'desc'} | null>(null);
  const [artistSort, setArtistSort] = useState<{key: string, dir: 'asc'|'desc'} | null>(null);
  const [trackSort, setTrackSort] = useState<{key: string, dir: 'asc'|'desc'} | null>(null);

  // Filter and Modal States
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [artistVerificationFilter, setArtistVerificationFilter] = useState('all');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, type: 'user'|'artist'|'track', id: string, name: string}>({isOpen: false, type: 'user', id: '', name: ''});
  const [editUserModal, setEditUserModal] = useState<{isOpen: boolean, user: any}>({isOpen: false, user: null});
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, artistsData, tracksData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getArtists(),
        adminApi.getTracks()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setArtists(artistsData);
      setTracks(tracksData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setError('Failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSort = (type: 'user'|'artist'|'track', key: string) => {
    if (type === 'user') {
      setUserSort(prev => prev?.key === key && prev.dir === 'asc' ? {key, dir: 'desc'} : {key, dir: 'asc'});
    } else if (type === 'artist') {
      setArtistSort(prev => prev?.key === key && prev.dir === 'asc' ? {key, dir: 'desc'} : {key, dir: 'asc'});
    } else {
      setTrackSort(prev => prev?.key === key && prev.dir === 'asc' ? {key, dir: 'desc'} : {key, dir: 'asc'});
    }
  };

  const getSortedData = (data: any[], sortConfig: {key: string, dir: 'asc'|'desc'} | null) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'artist_name') {
        aVal = a.artist_name || a.artistName || a.artist?.name || '';
        bVal = b.artist_name || b.artistName || b.artist?.name || '';
      }
      
      if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredUsers = getSortedData(users.filter(u => 
    ((u.username || '').toLowerCase().includes(userSearch.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase())) &&
    (userRoleFilter === 'all' || u.role === userRoleFilter || (!u.role && userRoleFilter === 'listener'))
  ), userSort);

  const filteredArtists = getSortedData(artists.map(a => ({...a, followers: a.followersCount || a.followers_count || a.followers || 0})).filter(a => 
    ((a.name || '').toLowerCase().includes(artistSearch.toLowerCase())) &&
    (artistVerificationFilter === 'all' || (artistVerificationFilter === 'verified' ? (a.is_verified || a.isVerified) : !(a.is_verified || a.isVerified)))
  ), artistSort);

  const filteredTracks = getSortedData(tracks.filter(t => 
    (t.title || '').toLowerCase().includes(trackSearch.toLowerCase())
  ), trackSort);

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      if (deleteModal.type === 'user') {
        await adminApi.deleteUser(deleteModal.id);
      } else if (deleteModal.type === 'artist') {
        await adminApi.deleteArtist(deleteModal.id);
      } else {
        await adminApi.deleteTrack(deleteModal.id);
      }
      setDeleteModal({isOpen: false, type: 'user', id: '', name: ''});
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete item.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await adminApi.updateUserRole(editUserModal.user.id, editUserModal.user.role, editUserModal.user.isVerified);
      setEditUserModal({isOpen: false, user: null});
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update user.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Admin Data...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className={styles.errorContainer}>
        <Icon name="AlertTriangle" size={48} color="#ff4444" />
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  
  const renderDashboard = () => (
    <div className={styles.dashboard}>
      <header className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>{t('common.reports')}</h2>
      </header>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#1DB954' }}>
            <Icon name="Users" size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t('common.totalUsers')}</span>
            <span className={styles.statValue}>{stats?.totalUsers?.toLocaleString() ?? 0}</span>
            <span className={styles.statTrend} style={{ color: '#1DB954' }}>
              ↑ {stats?.userGrowth ?? 0}% {t('common.growth')}
            </span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#8D67AB' }}>
            <Icon name="Mic" size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t('common.totalArtists')}</span>
            <span className={styles.statValue}>{stats?.totalArtists?.toLocaleString() ?? 0}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#E13300' }}>
            <Icon name="Music" size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t('common.totalTracks')}</span>
            <span className={styles.statValue}>{stats?.totalTracks?.toLocaleString() ?? 0}</span>
          </div>
        </div>
      </div>
      
      <section className={styles.chartSection}>
        <h3 className={styles.sectionTitle}>Platform Activity (Last 6 Months)</h3>
        <div className={styles.barChart}>
          {stats?.monthlyRevenue?.map((item, index) => (
            <div key={item.month} className={styles.barGroup}>
              <div 
                className={styles.bar} 
                style={{ height: `${((item.amount || 0) / 120000000) * 100}%` }}
                title={`${Math.floor((item.amount || 0) / 1000).toLocaleString()} interactions`}
              />
              <span className={styles.barLabel}>{item.month}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderUsers = () => (
    <div className={styles.management}>
      <header className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>{t('common.manageUsers')}</h2>
        <div className={styles.headerActions} style={{display: 'flex', gap: '12px'}}>
          <select className={styles.searchBox} value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} style={{width: 'auto'}}>
            <option value="all">All Roles</option>
            <option value="listener">Listener</option>
            <option value="artist">Artist</option>
            <option value="admin">Admin</option>
          </select>
          <input type="text" placeholder="Search users by name or email..." className={styles.searchBox} value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
        </div>
      </header>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thSortable} onClick={() => handleSort('user', 'username')}>
              User {userSort?.key === 'username' && (userSort.dir === 'asc' ? '↑' : '↓')}
            </th>
            <th className={styles.thSortable} onClick={() => handleSort('user', 'email')}>
              Email {userSort?.key === 'email' && (userSort.dir === 'asc' ? '↑' : '↓')}
            </th>
            <th className={styles.thSortable} onClick={() => handleSort('user', 'role')}>
              Role {userSort?.key === 'role' && (userSort.dir === 'asc' ? '↑' : '↓')}
            </th>
            <th className={styles.thSortable} onClick={() => handleSort('user', 'is_verified')}>
              Status {userSort?.key === 'is_verified' && (userSort.dir === 'asc' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>
                <div className={styles.userCell}>
                  <div className={styles.avatarMini}>{user.username?.charAt(0).toUpperCase()}</div>
                  <div className={styles.userInfoMini}>
                    <span className={styles.userNameMini}>{user.username}</span>
                    <span className={styles.userHandleMini}>@{user.username}</span>
                  </div>
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <span className={`${styles.badge} ${user.role === 'admin' ? styles.adminBadge : ''}`}>
                  {user.role || 'user'}
                </span>
              </td>
              <td><span className={styles.statusActive}>{user.is_verified || user.isVerified ? 'Verified' : 'Pending'}</span></td>
              <td>
                <div className={styles.tableActions}>
                  <button className={styles.iconBtn} title="Edit" onClick={() => setEditUserModal({isOpen: true, user: {id: user.id, username: user.username, role: user.role || 'listener', isVerified: user.is_verified || user.isVerified || false}})}><Icon name="Settings" size={16} /></button>
                  <button className={styles.iconBtn} title="Delete" style={{ color: '#ff4444' }} onClick={() => setDeleteModal({isOpen: true, type: 'user', id: user.id, name: user.username})}><Icon name="Close" size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderArtists = () => (
    <div className={styles.management}>
      <header className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>{t('common.manageArtists')}</h2>
        <div className={styles.headerActions} style={{display: 'flex', gap: '12px'}}>
          <select className={styles.searchBox} value={artistVerificationFilter} onChange={(e) => setArtistVerificationFilter(e.target.value)} style={{width: 'auto'}}>
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
          <input type="text" placeholder="Search artists..." className={styles.searchBox} value={artistSearch} onChange={(e) => setArtistSearch(e.target.value)} />
        </div>
      </header>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thSortable} onClick={() => handleSort('artist', 'name')}>
              Artist {artistSort?.key === 'name' && (artistSort.dir === 'asc' ? '↑' : '↓')}
            </th>
            <th className={styles.thSortable} onClick={() => handleSort('artist', 'followers')}>
              Followers {artistSort?.key === 'followers' && (artistSort.dir === 'asc' ? '↑' : '↓')}
            </th>
            <th className={styles.thSortable} onClick={() => handleSort('artist', 'is_verified')}>
              Verification {artistSort?.key === 'is_verified' && (artistSort.dir === 'asc' ? '↑' : '↓')}
            </th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredArtists.map(artist => (
            <tr key={artist.id}>
              <td>
                <div className={styles.userCell}>
                  <div className={styles.avatarMini}>{artist.name?.charAt(0).toUpperCase()}</div>
                  <div className={styles.userInfoMini}>
                    <span className={styles.userNameMini}>{artist.name}</span>
                  </div>
                </div>
              </td>
              <td>{artist.followers}</td>
              <td><span className={artist.is_verified || artist.isVerified ? styles.statusVerified : styles.statusActive}>{artist.is_verified || artist.isVerified ? 'Verified' : 'Pending'}</span></td>
              <td><span className={styles.statusActive}>Active</span></td>
              <td>
                <div className={styles.tableActions}>
                  <button className={styles.iconBtn} title="View"><Icon name="Music" size={16} /></button>
                  <button className={styles.iconBtn} title="Delete" style={{ color: '#ff4444' }} onClick={() => setDeleteModal({isOpen: true, type: 'artist', id: artist.id, name: artist.name})}><Icon name="Close" size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTracks = () => (
    <div className={styles.management}>
      <header className={styles.viewHeader}>
        <h2 className={styles.viewTitle}>{t('common.manageMusic')}</h2>
        <div className={styles.headerActions}>
          <input type="text" placeholder="Search tracks..." className={styles.searchBox} value={trackSearch} onChange={(e) => setTrackSearch(e.target.value)} />
        </div>
      </header>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thSortable} onClick={() => handleSort('track', 'title')}>
              Track {trackSort?.key === 'title' && (trackSort.dir === 'asc' ? '↑' : '↓')}
            </th>
            <th className={styles.thSortable} onClick={() => handleSort('track', 'artist_name')}>
              Artist {trackSort?.key === 'artist_name' && (trackSort.dir === 'asc' ? '↑' : '↓')}
            </th>
            <th className={styles.thSortable} onClick={() => handleSort('track', 'duration')}>
              Duration {trackSort?.key === 'duration' && (trackSort.dir === 'asc' ? '↑' : '↓')}
            </th>
            <th className={styles.thSortable} onClick={() => handleSort('track', 'created_at')}>
              Upload Date {trackSort?.key === 'created_at' && (trackSort.dir === 'asc' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTracks.map(track => (
            <tr key={track.id}>
              <td>
                <div className={styles.trackCell}>
                  <div className={styles.trackCoverMini}>
                    {(track.cover_url || track.coverUrl) && !imgErrors[track.id] ? (
                      <img 
                        src={track.cover_url || track.coverUrl} 
                        alt={track.title} 
                        style={{ width: '100%', height: '100%', borderRadius: 4, objectFit: 'cover' }} 
                        onError={() => setImgErrors(prev => ({...prev, [track.id]: true}))}
                      />
                    ) : (
                      <Icon name="Music" size={16} />
                    )}
                  </div>
                  <span className={styles.trackNameMini}>{track.title}</span>
                </div>
              </td>
              <td>{track.artist_name || track.artistName || track.artist?.name || 'Unknown'}</td>
              <td>{Math.floor((track.duration || 0) / 60)}:{((track.duration || 0) % 60).toString().padStart(2, '0')}</td>
              <td>{new Date(track.created_at || track.createdAt).toLocaleDateString()}</td>
              <td>
                <div className={styles.tableActions}>
                  <button className={styles.iconBtn} title="Delete" style={{ color: '#ff4444' }} onClick={() => setDeleteModal({isOpen: true, type: 'track', id: track.id, name: track.title})}><Icon name="Close" size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.adminIcon}>
            <Icon name="Music" size={32} />
          </div>
          <h1 className={styles.adminTitle}>Admin Panel</h1>
        </div>
        
        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Icon name="Home" size={20} />
            <span>{t('common.dashboard')}</span>
          </button>
          
          <button 
            className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Icon name="Users" size={20} />
            <span>{t('common.manageUsers')}</span>
          </button>
          
          <button 
            className={`${styles.navItem} ${activeTab === 'artists' ? styles.active : ''}`}
            onClick={() => setActiveTab('artists')}
          >
            <Icon name="Mic" size={20} />
            <span>{t('common.manageArtists')}</span>
          </button>
          
          <button 
            className={`${styles.navItem} ${activeTab === 'music' ? styles.active : ''}`}
            onClick={() => setActiveTab('music')}
          >
            <Icon name="Music" size={20} />
            <span>{t('common.manageMusic')}</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.navItem} onClick={() => navigate('/')}>
            <Icon name="Home" size={20} />
            <span>{t('common.backToSite')}</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'artists' && renderArtists()}
          {activeTab === 'music' && renderTracks()}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Confirm Delete</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete the {deleteModal.type} "{deleteModal.name}"? 
              This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <Button variant="outline" onClick={() => setDeleteModal({isOpen: false, type: 'user', id: '', name: ''})}>
                Cancel
              </Button>
              <Button onClick={handleDelete} disabled={isProcessing}>
                {isProcessing ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModal.isOpen && editUserModal.user && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Edit User: {editUserModal.user.username}</h3>
            <form onSubmit={handleEditUser}>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select 
                  className={styles.input} 
                  value={editUserModal.user.role} 
                  onChange={(e) => setEditUserModal({...editUserModal, user: {...editUserModal.user, role: e.target.value}})}
                >
                  <option value="listener">Listener</option>
                  <option value="artist">Artist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px'}}>
                <input 
                  type="checkbox" 
                  id="isVerified" 
                  checked={editUserModal.user.isVerified}
                  onChange={(e) => setEditUserModal({...editUserModal, user: {...editUserModal.user, isVerified: e.target.checked}})}
                />
                <label htmlFor="isVerified" style={{margin: 0}}>Verified Account</label>
              </div>
              <div className={styles.modalActions}>
                <Button variant="outline" type="button" onClick={() => setEditUserModal({isOpen: false, user: null})}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
