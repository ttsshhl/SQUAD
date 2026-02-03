import { useState } from 'react';
import { useStore } from '../store/useStore';
import { PostCard } from '../components/PostCard';

type FeedTab = 'friends' | 'popular';

export function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('friends');
  const { currentUser, posts, getFriends } = useStore();

  const friends = currentUser ? getFriends(currentUser.id) : [];
  const friendIds = friends.map(f => f.id);

  const friendsPosts = posts.filter(p => 
    friendIds.includes(p.authorId) || p.authorId === currentUser?.id
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const popularPosts = [...posts].sort((a, b) => {
    const aScore = a.likes.length + a.comments.length + a.reposts.length;
    const bScore = b.likes.length + b.comments.length + b.reposts.length;
    return bScore - aScore;
  });

  const displayPosts = activeTab === 'friends' ? friendsPosts : popularPosts;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <h1 className="px-4 py-4 text-xl font-bold">Главная</h1>
        <div className="flex">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 text-center font-medium transition-colors relative ${
              activeTab === 'friends' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Друзья
            {activeTab === 'friends' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-purple-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 py-3 text-center font-medium transition-colors relative ${
              activeTab === 'popular' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Популярное
            {activeTab === 'popular' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-purple-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Posts */}
      <div>
        {displayPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {activeTab === 'friends' ? (
              <>
                <p className="text-lg mb-2">Здесь пока пусто</p>
                <p className="text-sm">Добавьте друзей, чтобы видеть их посты</p>
              </>
            ) : (
              <p>Пока нет популярных постов</p>
            )}
          </div>
        ) : (
          displayPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
