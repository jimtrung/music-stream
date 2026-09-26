import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Icon } from '../../components/Icons/Icons';
import Button from '../../components/Shared/Button';
import styles from './SignupPage.module.css';
import { useTranslation } from 'react-i18next';

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    gender: '',
    marketing: false,
    shareData: false,
  });

  type FormErrors = Partial<Record<string, string>>;

  const [step, setStep] = useState<number>(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: FormErrors = {};
    if (!formData.username) {
      newErrors.username = 'Vui lòng nhập tên người dùng';
    }
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: FormErrors = {};
    if (!formData.displayName) {
      newErrors.displayName = 'Vui lòng nhập tên hiển thị của bạn';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);

    if (step === 2 && validateStep2()) { 
      setIsLoading(true);
      try {
        await signup(formData.username, formData.email, formData.password);
        navigate('/signin');
      } catch (err: any) {
        const status = err.response?.status;
        const message = err.response?.data?.message || '';

        if (status === 400 && (message.toLowerCase().includes('password') || message.toLowerCase().includes('weak'))) {
          setGeneralError('Mật khẩu đăng ký quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.');
        } else if (status === 409) {
          setGeneralError('Tên người dùng hoặc email đã tồn tại.');
        } else if (status >= 500) {
          setGeneralError('Lỗi hệ thống. Vui lòng thử lại sau.');
        } else {
          setGeneralError(message || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Icon name="Headphones" size={48} />
          </div>
          <span className={styles.logoText}>MusicStream</span>
        </div>

        <h1 className={styles.title}>{t('auth.signupFree')}</h1>

        {/* Progress Steps */}
        <div className={styles.steps}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>{t('auth.step1')}</span>
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>{t('auth.step2')}</span>
          </div>
        </div>

        {generalError && <div className={styles.generalError}>{generalError}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {step === 1 && (
            <>
              {/* Username */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('auth.usernameQ')}</label>
                <input
                  type="text"
                  name="username"
                  className={`${styles.input} ${errors.username ? styles.error : ''}`}
                  placeholder={t('auth.username')}
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete='off'
                />
                {errors.username && <span className={styles.errorText}>{errors.username}</span>}
              </div>

              {/* Email */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('auth.emailQ')}</label>
                <input
                  type="email"
                  name="email"
                  className={`${styles.input} ${errors.email ? styles.error : ''}`}
                  placeholder={t('auth.email')}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              {/* Password */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('auth.passwordCreate')}</label>
                <input
                  type="password"
                  name="password"
                  className={`${styles.input} ${errors.password ? styles.error : ''}`}
                  placeholder={t('auth.password')}
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                <span className={styles.hint}>{t('auth.passwordHint')}</span>
              </div>

              <Button type="button" onClick={handleNextStep} fullWidth size="lg">
                {t('auth.next')}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Display Name */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>{t('auth.nameQ')}</label>
                <input
                  type="text"
                  name="displayName"
                  className={`${styles.input} ${errors.displayName ? styles.error : ''}`}
                  placeholder={t('auth.fullName')}
                  value={formData.displayName}
                  onChange={handleChange}
                />
                {errors.displayName && <span className={styles.errorText}>{errors.displayName}</span>}
                <span className={styles.hint}>{t('auth.displayNameHint')}</span>
              </div>

              {/* Checkboxes */}
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="marketing"
                    checked={formData.marketing}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <span>{t('auth.marketing')}</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="shareData"
                    checked={formData.shareData}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <span>{t('auth.shareData')}</span>
                </label>
              </div>

              {/* Terms */}
              <p className={styles.terms}>
                {t('auth.terms')}
              </p>

              <div className={styles.formActions}>
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                  {t('auth.back')}
                </Button>
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? t('auth.creatingAccount') : t('auth.signup')}
                </Button>
              </div>
            </>
          )}
        </form>

        <div className={styles.divider}>
          <span>Bạn đã có tài khoản?</span>
        </div>

        <Link to="/signin" className={styles.loginLink}>
          {t('auth.hasAccountLogin')}
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
