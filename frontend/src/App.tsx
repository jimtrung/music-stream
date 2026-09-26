import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import Layout from './components/Layout/Layout';
import HomePage from './pages/Home/HomePage';
import SearchPage from './pages/Search/SearchPage';
import LibraryPage from './pages/Library/LibraryPage';
import PlaylistPage from './pages/Playlist/PlaylistPage';
import SigninPage from './pages/Auth/SigninPage';
import MessagesPage from './pages/Messages/MessagesPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';
import SignupPage from './pages/Auth/SignupPage';
import AdminPage from './pages/Admin/AdminPage';
import './index.css';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminProtectedRoute from './components/Auth/AdminProtectedRoute';

/**
 * Main App Component
 * 
 * Route Structure:
 * - / (Home) - Featured playlists, recently played, recommendations
 * - /search - Search with filters and categories
 * - /library - User playlists and liked songs
 * - /playlist/:id - Playlist detail with tracks
 * - /karaoke/:trackId - Sing Together karaoke mode
 * - /messages - Direct messages
 * - /profile/:id - User profile
 * - /settings - App settings
 * - /login - Login page (standalone, no layout)
 * - /signup - Signup page (standalone, no layout)
 */
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Standalone routes (no layout) */}
          <Route path="/signin" element={<SigninPage />} /> 
          <Route path="/signup" element={<SignupPage />} />

          {/* Routes with main layout (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/library/liked" element={<LibraryPage />} />
              <Route path="/playlist/:id" element={<PlaylistPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            {/* Admin routes with specialized protection */}
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
