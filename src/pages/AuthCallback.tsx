import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Проверяем профиль
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

          // Создаем если не существует
          if (!profile) {
            const username = session.user.email?.split('@')[0] || `user${Date.now()}`;
            
            await supabase.from('profiles').insert({
              id: session.user.id,
              email: session.user.email,
              username: username,
              display_name: 'НоуНейм',
              avatar_url: session.user.user_metadata?.avatar_url || '',
              bio: ''
            });
          }

          navigate('/feed', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error(error);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-4xl font-pixel bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            СКВАД
          </div>
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto"></div>
        <p className="text-white text-xl mt-6">Завершаем вход...</p>
      </div>
    </div>
  );
}
