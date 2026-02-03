import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Hash } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PostCard } from '../components/PostCard';

const allInterests = [
  'программирование', 'дизайн', 'музыка', 'игры', 'искусство',
  'кино', 'книги', 'путешествия', 'еда', 'спорт', 'технологии',
  'фотография', 'аниме', 'мода', 'наука', 'react', 'typescript'
];

export function ExplorePage() {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { posts } = useStore();

  // Get hashtag stats
  const hashtagCounts: Record<string, number> = {};
  posts.forEach(post => {
    if (post.hashtag) {
      hashtagCounts[post.hashtag] = (hashtagCounts[post.hashtag] || 0) + 1;
    }
  });

  const trendingHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const filteredPosts = selectedTag
    ? posts.filter(p => p.hashtag === selectedTag)
    : [];

  return (
    <div>
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <h1 className="px-4 py-4 text-xl font-bold">Обзор</h1>
      </div>

      <div className="p-4">
        {/* Trending Section */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <TrendingUp size={20} className="text-pink-500" />
            Популярные хэштеги
          </h2>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-4 py-2 rounded-full transition-colors flex items-center gap-2 ${
                  selectedTag === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Hash size={14} />
                {tag}
                <span className="text-xs opacity-70">{count}</span>
              </button>
            ))}
            {trendingHashtags.length === 0 && (
              <p className="text-gray-500">Пока нет популярных хэштегов</p>
            )}
          </div>
        </div>

        {/* All Interests */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3">Интересы</h2>
          <div className="flex flex-wrap gap-2">
            {allInterests.map(interest => (
              <button
                key={interest}
                onClick={() => navigate(`/search?q=${interest}`)}
                className="px-3 py-1.5 bg-gray-800 rounded-full text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              >
                #{interest}
              </button>
            ))}
          </div>
        </div>

        {/* Filtered Posts */}
        {selectedTag && (
          <div>
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              Посты по тегу
              <span className="text-purple-400">#{selectedTag}</span>
            </h2>
            {filteredPosts.length > 0 ? (
              <div className="-mx-4">
                {filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Нет постов с этим хэштегом
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
