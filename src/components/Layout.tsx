import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, MessageCircle, Compass, User, LogOut, PlusCircle, TrendingUp, Users, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState } from 'react';
import { CreatePostModal } from './CreatePostModal';

export function Layout() {
  const { currentUser, logout, users, posts, getFriends } = useStore();
  const navigate = useNavigate();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Trending hashtags
  const hashtagCounts: Record<string, number> = {};
  posts.forEach(post => {
    if (post.hashtag) {
      hashtagCounts[post.hashtag] = (hashtagCounts[post.hashtag] || 0) + 1;
    }
  });
  const trendingHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Online friends
  const friends = currentUser ? getFriends(currentUser.id) : [];
  const onlineFriends = friends.filter(f => f.isOnline);

  // Users with "now" status
  const usersWithStatus = users.filter(u => u.nowStatus);

  const navLinks = [
    { to: '/feed', icon: Home, label: 'Главная' },
    { to: '/explore', icon: Compass, label: 'Обзор' },
    { to: '/search', icon: Search, label: 'Поиск' },
    { to: '/messages', icon: MessageCircle, label: 'Сообщения' },
    { to: `/profile/${currentUser?.id}`, icon: User, label: 'Профиль' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <aside className="w-64 fixed h-screen border-r border-gray-800 p-4 flex flex-col">
          <div className="mb-8">
            <h1 className="text-xl font-pixel bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent tracking-wider">
              СКВАД
            </h1>
          </div>

          <nav className="flex-1 space-y-2">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => setShowCreatePost(true)}
            className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <PlusCircle size={20} />
            Опубликовать
          </button>

          <div className="mt-4 pt-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors w-full"
            >
              <LogOut size={20} />
              <span>Выйти</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 min-h-screen border-r border-gray-800">
          <Outlet />
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 p-4 hidden lg:block">
          {/* Trending */}
          <div className="bg-gray-900 rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <TrendingUp size={20} className="text-pink-500" />
              В тренде
            </h3>
            <div className="space-y-2">
              {trendingHashtags.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/search?q=${tag}`)}
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <span className="text-purple-400">#{tag}</span>
                  <span className="text-gray-500 text-sm ml-2">{count} постов</span>
                </button>
              ))}
              {trendingHashtags.length === 0 && (
                <p className="text-gray-500 text-sm">Пока нет трендов</p>
              )}
            </div>
          </div>

          {/* Online Friends */}
          <div className="bg-gray-900 rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Users size={20} className="text-green-500" />
              Друзья онлайн
            </h3>
            <div className="space-y-2">
              {onlineFriends.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => navigate(`/profile/${friend.id}`)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`}
                      alt={friend.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                  </div>
                  <span className="text-sm">{friend.displayName}</span>
                </button>
              ))}
              {onlineFriends.length === 0 && (
                <p className="text-gray-500 text-sm">Нет друзей онлайн</p>
              )}
            </div>
          </div>

          {/* Now Status */}
          <div className="bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-500" />
              Сейчас
            </h3>
            <div className="space-y-3">
              {usersWithStatus.slice(0, 5).map(user => (
                <button
                  key={user.id}
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="flex items-center gap-3 w-full text-left"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.nowStatus?.type === 'listening' && '🎵 Слушает: '}
                      {user.nowStatus?.type === 'watching' && '📺 Смотрит: '}
                      {user.nowStatus?.type === 'playing' && '🎮 Играет: '}
                      {user.nowStatus?.type === 'mood' && '😊 Настроение: '}
                      {user.nowStatus?.value}
                    </p>
                  </div>
                </button>
              ))}
              {usersWithStatus.length === 0 && (
                <p className="text-gray-500 text-sm">Нет активных статусов</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
}
