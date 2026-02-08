import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const GoogleCallback = () => {
  const navigate = useNavigate();
  
  // Если у вас есть функция loginWithGoogle в store, используйте её
  const loginWithGoogle = useStore((state) => (state as any).loginWithGoogle);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('Google OAuth error:', error);
        alert('Ошибка при входе через Google');
        navigate('/auth');
        return;
      }

      if (code) {
        try {
          if (loginWithGoogle) {
            // Используем вашу функцию из store
            await loginWithGoogle(code);
          } else {
            // Альтернативный вариант - прямой запрос к API
            const response = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (response.ok) {
              // Сохраняем токен
              localStorage.setItem('authToken', data.token);
              
              // Обновляем состояние store (адаптируйте под ваш store)
              useStore.setState({ 
                currentUser: data.user,
                isAuthenticated: true 
              });
            } else {
              throw new Error(data.message || 'Ошибка авторизации');
            }
          }
          
          navigate('/feed');
        } catch (error: any) {
          console.error('Error processing Google auth:', error);
          alert('Не удалось войти через Google');
          navigate('/auth');
        }
      }
    };

    handleCallback();
  }, [navigate, loginWithGoogle]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#000000',
      color: '#ffffff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #d946ef',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p>Авторизация через Google...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default GoogleCallback;
