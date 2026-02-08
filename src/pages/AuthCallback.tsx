import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase автоматически обрабатывает hash-фрагмент из URL
        const { data, error: authError } = await supabase.auth.getSession()

        if (authError) {
          console.error('Auth callback error:', authError)
          setError(authError.message)
          return
        }

        if (data?.session) {
          console.log('✅ User authenticated:', data.session.user.email)

          // Проверяем, открыто ли это в popup
          if (window.opener) {
            // Это popup — закрываем его, родительское окно обнаружит закрытие
            window.close()
            return
          }

          // Обычный redirect — идём на /feed
          navigate('/feed', { replace: true })
        } else {
          // Попробуем обработать hash вручную
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1)
          )
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')

          if (accessToken && refreshToken) {
            const { data: sessionData, error: setError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })

            if (setError) {
              console.error('Set session error:', setError)
            }

            if (sessionData?.session) {
              if (window.opener) {
                window.close()
                return
              }
              navigate('/feed', { replace: true })
              return
            }
          }

          // Нет сессии и нет токенов
          console.warn('No session found after callback')

          if (window.opener) {
            window.close()
            return
          }

          navigate('/register', { replace: true })
        }
      } catch (err) {
        console.error('Callback processing error:', err)
        setError('Failed to process authentication')

        if (window.opener) {
          window.close()
          return
        }
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'sans-serif'
      }}>
        <h2>Authentication Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/register')}>
          Back to Register
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40,
          height: 40,
          border: '4px solid #ccc',
          borderTopColor: '#333',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p>Completing sign in...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
