import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const handleCallback = async () => {
      const logs: string[] = [];
      
      try {
        logs.push('🔄 Начинаем обработку callback...');
        setDebugInfo([...logs]);

        // Проверяем URL параметры
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        logs.push(`📍 URL: ${window.location.href}`);
        logs.push(`🔑 Query params: ${window.location.search}`);
        logs.push(`#️⃣ Hash params: ${window.location.hash}`);
        setDebugInfo([...logs]);

        // Проверяем наличие токенов в URL
        const accessToken = params.get('access_token') || hashParams.get('access_token');
        const code = params.get('code');
        
        logs.push(`🎫 Access token in URL: ${accessToken ? 'YES' : 'NO'}`);
        logs.push(`🎟️ Code in URL: ${code ? 'YES' : 'NO'}`);
        setDebugInfo([...logs]);

        // Если есть код или токен, обрабатываем через Supabase
        if (code || accessToken) {
          logs.push('✅ Найдены параметры авторизации');
          setDebugInfo([...logs]);
        } else {
          logs.push('❌ НЕТ параметров авторизации в URL!');
          setDebugInfo([...logs]);
        }

        // Получаем сессию
        logs.push('🔍 Получаем сессию из Supabase...');
        setDebugInfo([...logs]);
        
        const { data, error } = await supabase.auth.getSession();
        
        logs.push(`📊 Session data: ${JSON.stringify(data, null, 2)}`);
        setDebugInfo([...logs]);
        
        if (error) {
          logs.push(`❌ Ошибка: ${error.message}`);
          console.error('Auth error:', error);
          setDebugInfo([...logs]);
          
          // Ждём 5 секунд перед редиректом, чтобы показать ошибку
          setTimeout(() => navigate('/login'), 5000);
          return;
        }

        if (data.session) {
          logs.push('✅ Сессия получена успешно!');
          logs.push(`👤 User: ${data.session.user.email}`);
          logs.push('🚀 Редирект на /feed через 2 секунды...');
          setDebugInfo([...logs]);
          
          console.log('Auth successful, session:', data.session);
          
          // Задержка, чтобы увидеть логи
          setTimeout(() => {
            navigate('/feed');
          }, 2000);
        } else {
          logs.push('❌ Сессия НЕ найдена!');
          logs.push('🔄 Редирект на /login через 5 секунд...');
          setDebugInfo([...logs]);
          
          console.log('No session found');
          
          setTimeout(() => navigate('/login'), 5000);
        }
      } catch (err) {
        logs.push(`💥 Непредвиденная ошибка: ${err}`);
        console.error('Callback error:', err);
        setDebugInfo([...logs]);
        
        setTimeout(() => navigate('/login'), 5000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-white text-center mb-8">
          <div className="mb-6">
            <div className="text-3xl font-pixel bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              СКВАД
            </div>
          </div>
          <div className="space-y-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 text-lg">Обработка авторизации...</p>
          </div>
        </div>

        {/* Debug panel */}
        <div className="bg-gray-900 rounded-xl p-6 mt-8">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>🔍</span> Диагностика
          </h3>
          <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400 max-h-96 overflow-y-auto space-y-1">
            {debugInfo.length === 0 ? (
              <div>Загрузка...</div>
            ) : (
              debugInfo.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap break-all">
                  {log}
                </div>
              ))
            )}
          </div>
          <p className="text-gray-500 text-sm mt-4">
            💡 Сделайте скриншот этого окна и отправьте его
          </p>
        </div>
      </div>
    </div>
  );
}
