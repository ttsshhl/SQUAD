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

  // ✅ Проверяем сессию при загрузке страницы
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/feed');
      }
    });
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

  // ✅ НОРМАЛЬНЫЙ Google OAuth (redirect)
  const handleGoogleLogin = async () => {
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/feed',
      },
    });

    if (error) {
      setError('Ошибка входа через Google: ' + error.message);
    }
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
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold"
            >
              Войти
            </button>
          </form>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white text-black rounded-xl font-semibold"
          >
            Войти через Google
          </button>

          <button
            onClick={handleDemoLogin}
            className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold"
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
