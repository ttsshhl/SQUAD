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
          
          // Если открыто в popup - сообщаем родителю об ошибке
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              { type: 'auth-error', error: error.message },
              window.location.origin
            );
            window.close();
          } else {
            // Если не popup - редирект на страницу входа
            navigate('/login');
          }
          return;
        }

        if (data.session) {
          console.log('Auth successful, session:', data.session);
          
          // Если открыто в popup - сообщаем родителю об успехе
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              { type: 'auth-success' },
              window.location.origin
            );
            
            // Закрываем popup через небольшую задержку
            setTimeout(() => {
              window.close();
            }, 100);
          } else {
            // Если не popup (прямой переход) - редирект на feed
            navigate('/feed');
          }
        } else {
          // Сессии нет - что-то пошло не так
          console.log('No session found');
          
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              { type: 'auth-error', error: 'No session' },
              window.location.origin
            );
            window.close();
          } else {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Callback error:', err);
        
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: 'auth-error', error: 'Unknown error' },
            window.location.origin
          );
          window.close();
        } else {
          navigate('/login');
        }
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-pulse mb-4">
          <div className="text-2xl font-pixel bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            СКВАД
          </div>
        </div>
        <div className="space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="text-gray-400">Завершение авторизации...</p>
        </div>
      </div>
    </div>
  );
}
