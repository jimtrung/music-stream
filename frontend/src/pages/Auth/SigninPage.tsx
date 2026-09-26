import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Icon } from '../../components/Icons/Icons';
import styles from './SigninPage.module.css';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const SigninPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (!username.trim()) {
      setError('Tên đăng nhập không được để trống');
      setIsLoading(false);
      return;
    }
    if (!password.trim()) {
      setError('Mật khẩu không được để trống');
      setIsLoading(false);
      return;
    }

    try {
      const profileData = await signin(username, password);
      if (profileData?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const status = err.status || err.response?.status;
      const message = err.response?.data?.message || '';

      if (status === 401) {
        setError('Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.');
      } else if (status === 404) {
        setError('Dịch vụ không khả dụng. Vui lòng liên hệ hỗ trợ.');
      } else {
        setError(message || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Icon name="Music" size={48} />
          </div>
          <div className={styles.logoText}>MusicStream</div>
        </div>

        <h1 className={styles.title}>{t('auth.signinDesc')}</h1>

        {/* Social Login */}
        <div className={styles.socialBtns}>
          <button
            className={styles.socialBtn}
            onClick={() => handleSocialLogin('google')}
          >
            Tiếp tục với Google
          </button>
        </div>

        <div className={styles.divider}>{t('auth.noAccount').includes('?') ? 'or' : 'hoặc'}</div>

        {error && <div className={styles.error}>{error}</div>}

        {/* Sign in Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('auth.username')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={t('auth.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>{t('auth.password')}</label>
            <input
              type="password"
              className={styles.input}
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? t('auth.signingIn') : t('auth.signin')}
          </button>
        </form>

        <div className={styles.footer}>
          <p>{t('auth.noAccount')} <Link to="/signup">{t('auth.signup')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
