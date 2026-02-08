import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Завершаем вход...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Получаем сессию
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setStatus('Ошибка. Перенаправление...');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (!session) {
          console.log('No session');
          setStatus('Сессия не найдена. Перенаправление...');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Проверяем профиль
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        // Создаем профиль если не существует
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

        setStatus('Успешно! Перенаправление...');
        
        // Перенаправляем на feed
        setTimeout(() => navigate('/feed', { replace: true }), 500);
        
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('Ошибка. Перенаправление...');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-4xl font-pixel bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            СКВАД
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          
          <div>
            <p className="text-white text-xl font-semibold">{status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
