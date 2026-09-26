import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { setTheme } from '../../store/uiSlice';
import { Icon } from '../../components/Icons/Icons';
import Button from '../../components/Shared/Button';
import Modal from '../../components/Shared/Modal';
import styles from './SettingsPage.module.css';
import { useTranslation } from 'react-i18next';

interface Settings {
  autoplay: boolean;
  explicitContent: boolean;
  allowMessages: boolean;
  showActivity: boolean;
  messageNotifications: boolean;
  roomInvites: boolean;
}

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentTheme = useSelector((state: RootState) => state.ui.theme);

  // Settings state
  const [settings, setSettings] = useState<Settings>({
    autoplay: true,
    explicitContent: false,
    allowMessages: true,
    showActivity: true,
    messageNotifications: true,
    roomInvites: true,
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const handleToggle = (key: keyof Settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeChange = (theme: 'dark' | 'light') => {
    dispatch(setTheme(theme));
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 500);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate('/signin');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('common.settings')}</h1>
        <Button onClick={handleSave} disabled={saveStatus === 'saving'}>
          {saveStatus === 'saving' ? t('settings.saving') : saveStatus === 'saved' ? t('settings.saved') : t('settings.save')}
        </Button>
      </header>

      {/* Appearance Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.appearance')}</h2>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>{t('settings.theme')}</span>
              <span className={styles.settingDesc}>{t('settings.themeDesc')}</span>
            </div>
            <div className={styles.themeOptions}>
              <button
                className={`${styles.themeBtn} ${currentTheme === 'dark' ? styles.active : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                <Icon name="Music" size={16} />
                {t('settings.dark')}
              </button>
              <button
                className={`${styles.themeBtn} ${currentTheme === 'light' ? styles.active : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                <Icon name="Music" size={16} />
                {t('settings.light')}
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Language / Ngôn ngữ</span>
              <span className={styles.settingDesc}>Choose your language / Chọn ngôn ngữ của bạn</span>
            </div>
            <div className={styles.themeOptions}>
              <button
                className={`${styles.themeBtn} ${i18n.language === 'vi' ? styles.active : ''}`}
                onClick={() => handleLanguageChange('vi')}
              >
                Tiếng Việt
              </button>
              <button
                className={`${styles.themeBtn} ${i18n.language === 'en' ? styles.active : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Playback Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.playback')}</h2>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>{t('settings.autoplay')}</span>
              <span className={styles.settingDesc}>{t('settings.autoplayDesc')}</span>
            </div>
            <button
              className={`${styles.toggle} ${settings.autoplay ? styles.on : ''}`}
              onClick={() => handleToggle('autoplay')}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>{t('settings.explicit')}</span>
              <span className={styles.settingDesc}>{t('settings.explicitDesc')}</span>
            </div>
            <button
              className={`${styles.toggle} ${settings.explicitContent ? styles.on : ''}`}
              onClick={() => handleToggle('explicitContent')}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
        </div>
      </section>

      {/* Social Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.social')}</h2>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>{t('settings.allowMessages')}</span>
              <span className={styles.settingDesc}>{t('settings.allowMessagesDesc')}</span>
            </div>
            <button
              className={`${styles.toggle} ${settings.allowMessages ? styles.on : ''}`}
              onClick={() => handleToggle('allowMessages')}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>{t('settings.showActivity')}</span>
              <span className={styles.settingDesc}>{t('settings.showActivityDesc')}</span>
            </div>
            <button
              className={`${styles.toggle} ${settings.showActivity ? styles.on : ''}`}
              onClick={() => handleToggle('showActivity')}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.notifications')}</h2>
        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>{t('settings.messageNotif')}</span>
              <span className={styles.settingDesc}>{t('settings.messageNotifDesc')}</span>
            </div>
            <button
              className={`${styles.toggle} ${settings.messageNotifications ? styles.on : ''}`}
              onClick={() => handleToggle('messageNotifications')}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>{t('settings.roomInvites')}</span>
              <span className={styles.settingDesc}>{t('settings.roomInvitesDesc')}</span>
            </div>
            <button
              className={`${styles.toggle} ${settings.roomInvites ? styles.on : ''}`}
              onClick={() => handleToggle('roomInvites')}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
