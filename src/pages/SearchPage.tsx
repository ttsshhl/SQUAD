import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStore } from '../store/useStore';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const { searchUsers, currentUser } = useStore();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const results = query.trim() ? searchUsers(query) : [];
  const filteredResults = results.filter(u => u.id !== currentUser?.id);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск пользователей по имени или интересам..."
              className="w-full bg-gray-900 rounded-full pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </form>
      </div>

      <div className="p-4">
        {query.trim() ? (
          filteredResults.length > 0 ? (
            <div className="space-y-2">
              <p className="text-gray-500 text-sm mb-4">
                Найдено: {filteredResults.length} {filteredResults.length === 1 ? 'пользователь' : 'пользователей'}
              </p>
              {filteredResults.map(user => (
                <button
                  key={user.id}
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full"
                    style={{ borderColor: user.profileColor, borderWidth: 2 }}
                  />
                  <div className="flex-1 text-left">
                    <p className="font-bold">{user.displayName}</p>
                    <p className="text-gray-500 text-sm">@{user.username}</p>
                    {user.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.interests.slice(0, 3).map(interest => (
                          <span
                            key={interest}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              interest.toLowerCase().includes(query.toLowerCase())
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                          >
                            #{interest}
                          </span>
                        ))}
                        {user.interests.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{user.interests.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Пользователи не найдены</p>
              <p className="text-gray-600 text-sm mt-1">
                Попробуйте изменить запрос
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Введите запрос для поиска</p>
            <p className="text-gray-600 text-sm mt-1">
              Ищите по имени пользователя или интересам
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
