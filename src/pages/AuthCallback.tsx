import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Получаем сессию после OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          navigate('/login');
          return;
        }

        if (session) {
          // Проверяем, есть ли профиль
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // Если профиля нет - создаём с дефолтными данными
          if (!profile) {
            const username = session.user.email?.split('@')[0] || `user_${Date.now()}`;
            
            await supabase.from('profiles').insert({
              id: session.user.id,
              email: session.user.email,
              username: username,
              display_name: 'НоуНейм',
              avatar_url: session.user.user_metadata?.avatar_url || '',
              bio: ''
            });
          }

          // Успешно - на feed
          navigate('/feed');
        } else {
          // Нет сессии - на login
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-6">
          <div className="text-3xl font-pixel bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            СКВАД
          </div>
        </div>
        <div className="space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 text-lg">Завершаем вход...</p>
        </div>
      </div>
    </div>
  );
}
