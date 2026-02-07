import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Получаем сессию после редиректа от Google
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          navigate('/login');
          return;
        }

        if (data.session) {
          console.log('Auth successful, redirecting to /feed');
          // Успешная авторизация - переходим на feed
          navigate('/feed');
        } else {
          console.log('No session found, redirecting to /login');
          navigate('/login');
        }
      } catch (err) {
        console.error('Callback error:', err);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="mb-6">
          <div className="text-3xl font-pixel bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            СКВАД
          </div>
        </div>
        <div className="space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 text-lg">Завершение авторизации...</p>
          <p className="text-gray-600 text-sm">Пожалуйста, подождите</p>
        </div>
      </div>
    </div>
  );
}
