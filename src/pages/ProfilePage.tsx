import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, MessageCircle, UserPlus, UserCheck, Clock, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PostCard } from '../components/PostCard';

const profileColors = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
  '#EAB308', '#22C55E', '#10B981', '#06B6D4', '#3B82F6'
];

const interestOptions = [
  'программирование', 'дизайн', 'музыка', 'игры', 'искусство',
  'кино', 'книги', 'путешествия', 'еда', 'спорт', 'технологии',
  'фотография', 'аниме', 'мода', 'наука'
];

const statusTypes = [
  { type: 'listening', label: '🎵 Слушаю', placeholder: 'Название трека' },
  { type: 'watching', label: '📺 Смотрю', placeholder: 'Название шоу/фильма' },
  { type: 'playing', label: '🎮 Играю', placeholder: 'Название игры' },
  { type: 'mood', label: '😊 Настроение', placeholder: 'Ваше настроение' }
] as const;

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentUser, getUser, updateUser, posts, 
    getFriends, getFollowers, getFriendStatus,
    sendFriendRequest, acceptFriendRequest, friendRequests
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editColor, setEditColor] = useState('');
  const [editStatus, setEditStatus] = useState<{ type: typeof statusTypes[number]['type']; value: string } | null>(null);

  const user = getUser(id!);
  const isOwner = currentUser?.id === id;

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Пользователь не найден</p>
      </div>
    );
  }

  const friends = getFriends(user.id);
  const followers = getFollowers(user.id);
  const userPosts = posts.filter(p => p.authorId === user.id);
  const friendStatus = getFriendStatus(user.id);

  const startEditing = () => {
    setEditBio(user.bio || '');
    setEditDisplayName(user.displayName);
    setEditInterests(user.interests);
    setEditColor(user.profileColor);
    setEditStatus(user.nowStatus || null);
    setIsEditing(true);
  };

  const saveProfile = () => {
    updateUser(user.id, {
      bio: editBio,
      displayName: editDisplayName,
      interests: editInterests,
      profileColor: editColor,
      nowStatus: editStatus || undefined
    });
    setIsEditing(false);
  };

  const handleFriendAction = () => {
    if (friendStatus === 'none') {
      sendFriendRequest(user.id);
    } else if (friendStatus === 'follower') {
      const request = friendRequests.find(
        fr => fr.fromUserId === user.id && fr.toUserId === currentUser?.id && fr.status === 'pending'
      );
      if (request) {
        acceptFriendRequest(request.id);
      }
    }
  };

  const toggleInterest = (interest: string) => {
    setEditInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAvatarChange = () => {
    const seed = Math.random().toString(36).substr(2, 9);
    updateUser(user.id, {
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
    });
  };

  return (
    <div>
      {/* Profile Header */}
      <div 
        className="h-32 relative"
        style={{ backgroundColor: user.profileColor }}
      />

      <div className="px-4 pb-4">
        <div className="flex justify-between items-start -mt-16 mb-4">
          <div className="relative">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
              alt={user.displayName}
              className="w-32 h-32 rounded-full border-4 border-black"
            />
            {isOwner && (
              <button
                onClick={handleAvatarChange}
                className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
              >
                <Camera size={16} />
              </button>
            )}
          </div>

          <div className="mt-20 flex gap-2">
            {isOwner ? (
              <button
                onClick={isEditing ? saveProfile : startEditing}
                className="px-4 py-2 bg-gray-800 rounded-full font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Settings size={16} />
                {isEditing ? 'Сохранить' : 'Редактировать'}
              </button>
            ) : (
              <>
                {friendStatus === 'friend' && (
                  <button
                    onClick={() => navigate('/messages')}
                    className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    <MessageCircle size={20} />
                  </button>
                )}
                <button
                  onClick={handleFriendAction}
                  disabled={friendStatus === 'pending'}
                  className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-colors ${
                    friendStatus === 'friend'
                      ? 'bg-green-600 text-white'
                      : friendStatus === 'pending'
                      ? 'bg-gray-700 text-gray-400'
                      : friendStatus === 'follower'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {friendStatus === 'friend' && <><UserCheck size={16} /> Друзья</>}
                  {friendStatus === 'pending' && <><Clock size={16} /> Запрос отправлен</>}
                  {friendStatus === 'follower' && <><UserPlus size={16} /> Принять дружбу</>}
                  {friendStatus === 'none' && <><UserPlus size={16} /> Стать другом</>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4">
          {isEditing ? (
            <input
              type="text"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              className="text-xl font-bold bg-gray-800 rounded-lg px-3 py-1 w-full mb-1"
            />
          ) : (
            <h1 className="text-xl font-bold">{user.displayName}</h1>
          )}
          <p className="text-gray-500">@{user.username}</p>
        </div>

        {/* Now Status */}
        {(user.nowStatus || isEditing) && (
          <div className="mb-4 p-3 bg-gray-900 rounded-xl">
            {isEditing ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-2">Что сейчас делаете?</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {statusTypes.map(st => (
                    <button
                      key={st.type}
                      onClick={() => setEditStatus(editStatus?.type === st.type ? null : { type: st.type, value: '' })}
                      className={`px-3 py-1 rounded-full text-sm ${
                        editStatus?.type === st.type
                          ? 'bg-purple-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
                {editStatus && (
                  <input
                    type="text"
                    value={editStatus.value}
                    onChange={(e) => setEditStatus({ ...editStatus, value: e.target.value })}
                    placeholder={statusTypes.find(s => s.type === editStatus.type)?.placeholder}
                    className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm"
                  />
                )}
              </div>
            ) : user.nowStatus && (
              <p className="text-sm">
                {user.nowStatus.type === 'listening' && '🎵 Слушает: '}
                {user.nowStatus.type === 'watching' && '📺 Смотрит: '}
                {user.nowStatus.type === 'playing' && '🎮 Играет: '}
                {user.nowStatus.type === 'mood' && '😊 Настроение: '}
                <span className="text-purple-400">{user.nowStatus.value}</span>
              </p>
            )}
          </div>
        )}

        {/* Bio */}
        {isEditing ? (
          <textarea
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            placeholder="Расскажите о себе..."
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none h-24 mb-4"
          />
        ) : user.bio ? (
          <p className="text-gray-300 mb-4">{user.bio}</p>
        ) : isOwner ? (
          <p className="text-gray-500 mb-4">Добавьте описание профиля</p>
        ) : null}

        {/* Stats */}
        <div className="flex gap-6 mb-4 text-sm">
          <div>
            <span className="font-bold">{friends.length}</span>
            <span className="text-gray-500 ml-1">друзей</span>
          </div>
          <div>
            <span className="font-bold">{followers.length}</span>
            <span className="text-gray-500 ml-1">подписчиков</span>
          </div>
          <div>
            <span className="font-bold">{userPosts.length}</span>
            <span className="text-gray-500 ml-1">постов</span>
          </div>
        </div>

        {/* Profile Color */}
        {isEditing && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Цвет профиля</p>
            <div className="flex gap-2">
              {profileColors.map(color => (
                <button
                  key={color}
                  onClick={() => setEditColor(color)}
                  className={`w-8 h-8 rounded-full ${
                    editColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Интересы</p>
          {isEditing ? (
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    editInterests.includes(interest)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  #{interest}
                </button>
              ))}
            </div>
          ) : user.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.interests.map(interest => (
                <button
                  key={interest}
                  onClick={() => navigate(`/search?q=${interest}`)}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm text-purple-400 hover:bg-gray-700 transition-colors"
                >
                  #{interest}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Интересы не указаны</p>
          )}
        </div>
      </div>

      {/* User Posts */}
      <div className="border-t border-gray-800">
        <h2 className="px-4 py-3 font-bold">Посты</h2>
        {userPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Пока нет постов</p>
          </div>
        ) : (
          userPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
