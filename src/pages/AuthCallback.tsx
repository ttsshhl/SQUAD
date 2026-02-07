import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Получаем токены из URL после редиректа от Google
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Если открыто в popup - закрыть и обновить родительское окно
        if (window.opener) {
          window.opener.postMessage({ type: 'auth-success' }, window.location.origin);
          window.close();
        } else {
          // Если не popup (например, прямой переход) - редирект на feed
          navigate('/feed');
        }
      } else {
        // Если сессии нет - возможно ошибка
        if (window.opener) {
          window.opener.postMessage({ type: 'auth-error' }, window.location.origin);
          window.close();
        } else {
          navigate('/login');
        }
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-pulse mb-4">
          <div className="text-2xl font-pixel bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            СКВАД
          </div>
        </div>
        <p className="text-gray-400">Авторизация через Google...</p>
      </div>
    </div>
  );
}
