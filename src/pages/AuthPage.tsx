import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Получаем функции из вашего Zustand store
  const login = useStore((state) => state.login);
  const register = useStore((state) => state.register);
  const demoLogin = useStore((state) => state.demoLogin);

  // Google OAuth конфигурация
  const handleGoogleAuth = () => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 
      window.location.origin + '/auth/callback';
    
    if (!GOOGLE_CLIENT_ID) {
      alert('Google Client ID не настроен. Добавьте VITE_GOOGLE_CLIENT_ID в .env файл');
      return;
    }
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=email profile&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = googleAuthUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        // Логика входа через ваш store
        await login(email, password);
        navigate('/feed');
      } else {
        // Логика регистрации
        if (password !== confirmPassword) {
          alert('Пароли не совпадают!');
          return;
        }
        await register(email, password);
        navigate('/feed');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(error.message || 'Произошла ошибка');
    }
  };

  const handleDemoLogin = async () => {
    try {
      if (demoLogin) {
        await demoLogin();
        navigate('/feed');
      } else {
        alert('Демо-вход не настроен');
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка демо-входа');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="logo">СКВАТ</h1>
          <p className="tagline">Социальная сеть нового поколения</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>

          <div className="divider">
            <span>или</span>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleAuth}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Войти через Google
          </button>

          {isLogin && demoLogin && (
            <button
              type="button"
              className="demo-btn"
              onClick={handleDemoLogin}
            >
              Демо-вход
            </button>
          )}

          <div className="toggle-form">
            <p>
              {isLogin ? 'Нет аккаунта?' : 'Уже зарегистрированы?'}
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
