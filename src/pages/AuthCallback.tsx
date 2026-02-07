import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Обработка авторизации...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Получаем данные авторизации...');
        
        // Получаем сессию после OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('Ошибка получения сессии. Перенаправление...');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (!session) {
          console.log('No session found');
          setStatus('Сессия не найдена. Перенаправление...');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        setStatus('Проверяем профиль...');
        
        // Проверяем, есть ли профиль
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Если ошибка и это не "профиль не найден"
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile check error:', profileError);
        }

        // Если профиля нет - создаём с дефолтными данными
        if (!profile) {
          setStatus('Создаем профиль...');
          
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
            // Продолжаем даже если есть ошибка создания профиля
            // возможно профиль уже существует
          }
        }

        setStatus('Успешно! Перенаправление...');
        
        // Небольшая задержка для показа статуса
        setTimeout(() => {
          navigate('/feed');
        }, 500);
        
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('Произошла ошибка. Перенаправление...');
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
          
          <div className="space-y-2">
            <p className="text-white text-xl font-semibold">{status}</p>
            <p className="text-gray-500 text-sm">Пожалуйста, подождите</p>
          </div>
        </div>
      </div>
    </div>
  );
}
