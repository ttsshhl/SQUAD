import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  // Проверяем, залогинен ли пользователь
  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          console.log('User already logged in, redirecting...');
          navigate('/feed', { replace: true });
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }
    };
    
    checkUser();

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user.email);
        
        try {
          // Проверяем профиль
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching profile:', fetchError);
          }

          // Создаем профиль если его нет
          if (!existingProfile) {
            console.log('Creating new profile...');
            
            const username = session.user.email?.split('@')[0] || `user_${Date.now()}`;
            
            const { error: insertError } = await supabase.from('profiles').insert({
              id: session.user.id,
              email: session.user.email,
              username: username,
              display_name: 'НоуНейм',
              avatar_url: session.user.user_metadata?.avatar_url || '',
              bio: ''
            });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              // Продолжаем даже если ошибка - возможно профиль уже создан
            } else {
              console.log('Profile created successfully');
            }
          } else {
            console.log('Profile already exists');
          }

          // Перенаправляем
          console.log('Redirecting to /feed...');
          if (isMounted) {
            navigate('/feed', { replace: true });
          }
          
        } catch (err) {
          console.error('Error in auth state change:', err);
          if (isMounted) {
            navigate('/feed', { replace: true });
          }
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
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

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);

      console.log('Initiating Google OAuth...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
          skipBrowserRedirect: false
        }
      });

      if (error) {
        console.error('OAuth error:', error);
        setError('Ошибка входа через Google: ' + error.message);
        setLoading(false);
        return;
      }

      if (data?.url) {
        console.log('Redirecting to Google...');
        // Используем window.location для редиректа
        window.location.href = data.url;
      } else {
        console.error('No redirect URL received');
        setError('Не удалось получить URL авторизации');
        setLoading(false);
      }
      
    } catch (err) {
      console.error('Google login exception:', err);
      setError('Произошла ошибка: ' + (err as Error).message);
      setLoading(false);
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
              <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-lg text-sm border border-red-500/20">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:opacity-90 transition-opacity text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={loading}
            className="w-full py-3 bg-white text-black rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                <span>Перенаправление на Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Войти через Google</span>
              </>
            )}
          </button>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Демо-вход
          </button>

          <p className="text-center text-gray-400 text-sm">
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
