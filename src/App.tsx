import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { FeedPage } from './pages/FeedPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { ExplorePage } from './pages/ExplorePage';
import { MessagesPage } from './pages/MessagesPage';
import AuthPage from './pages/AuthPage';
import GoogleCallback from './pages/GoogleCallback';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  
  if (currentUser) {
    return <Navigate to="/feed" replace />;
  }
  
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/feed" replace />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="profile/:id" element={<ProfilePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="/auth" element={<AuthPage />} />
<Route path="/auth/callback" element={<GoogleCallback />} />
        </Route>
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
