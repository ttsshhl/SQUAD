import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useStore();
  const navigate = useNavigate();

  // ✅ Если пользователь уже залогинен — сразу на feed
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/feed');
      }
    });
  }, [navigate]);

  // ✅ Слушаем сообщения от popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Проверяем, что сообщение от нашего домена
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'auth-success') {
        // Успешная авторизация - переходим на feed
        navigate('/feed');
      } else if (event.data.type === 'auth-error') {
        setError('Ошибка авторизации через Google');
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = login(email, password);
    if (user) {
      navigate('/feed');
    } else {
      setError('Неверный email или пароль');
    }
  };

  // ✅ ФИНАЛЬНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ - только popup, без редиректа основного окна
  const handleGoogleLogin = () => {
    setError('');

    // 1. СНАЧАЛА открываем popup
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      'about:blank',
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      setError('Браузер заблокировал popup. Разрешите всплывающие окна для этого сайта.');
      return;
    }

    // Показываем загрузку в popup
    popup.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #000;
              color: #fff;
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .loading {
              text-align: center;
            }
            .spinner {
              border: 3px solid rgba(255, 255, 255, 0.1);
              border-top: 3px solid #a855f7;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="loading">
            <div class="spinner"></div>
            <p>Подключение к Google...</p>
          </div>
        </body>
      </html>
    `);

    // 2. Делаем запрос с skipBrowserRedirect: true (чтобы основное окно НЕ редиректилось)
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true, // ✅ ВОТ ЭТО ВАЖНО! Отключаем автоматический редирект
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    }).then(({ data, error }) => {
      if (error) {
        popup.close();
        setError('Ошибка входа через Google: ' + error.message);
        return;
      }

      if (!data?.url) {
        popup.close();
        setError('Не удалось получить URL авторизации');
        return;
      }

      // 3. Перенаправляем ТОЛЬКО popup на Google
      popup.location.href = data.url;
    });

    // Проверяем, не закрыл ли пользователь popup вручную
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
      }
    }, 500);
  };

  const handleDemoLogin = () => {
    const user = login('anna@demo.ru', 'demo');
    if (user) {
      navigate('/feed');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-pixel bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent mb-4 tracking-wider">
            СКВАД
          </h1>
          <p className="text-gray-400">Социальная сеть нового поколения</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Войти
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-500">или</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white text-black rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
          >
            Войти через Google
          </button>

          <button
            onClick={handleDemoLogin}
            className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Демо-вход
          </button>

          <p className="text-center text-gray-400">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-purple-400 hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
