import { useState } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useStore } from '../store/useStore';

export function MessagesPage() {
  const { currentUser, getFriends, getConversation, sendMessage, getUser, messages } = useStore();
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const friends = currentUser ? getFriends(currentUser.id) : [];
  const selectedFriend = selectedFriendId ? getUser(selectedFriendId) : null;
  const conversation = selectedFriendId ? getConversation(selectedFriendId) : [];

  // Get last message for each friend
  const friendsWithLastMessage = friends.map(friend => {
    const conv = messages.filter(
      m => (m.senderId === currentUser?.id && m.receiverId === friend.id) ||
           (m.senderId === friend.id && m.receiverId === currentUser?.id)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return {
      ...friend,
      lastMessage: conv[0]
    };
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedFriendId) return;
    sendMessage(selectedFriendId, messageText);
    setMessageText('');
  };

  if (friends.length === 0) {
    return (
      <div>
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
          <h1 className="px-4 py-4 text-xl font-bold">Сообщения</h1>
        </div>
        <div className="p-8 text-center text-gray-500">
          <p className="text-lg mb-2">У вас пока нет друзей</p>
          <p className="text-sm">Добавьте друзей, чтобы начать общение</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Friends List */}
      <div className={`w-full md:w-80 border-r border-gray-800 flex flex-col ${selectedFriendId ? 'hidden md:flex' : 'flex'}`}>
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
          <h1 className="px-4 py-4 text-xl font-bold">Сообщения</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {friendsWithLastMessage.map(friend => (
            <button
              key={friend.id}
              onClick={() => setSelectedFriendId(friend.id)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-gray-900 transition-colors ${
                selectedFriendId === friend.id ? 'bg-gray-900' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`}
                  alt={friend.displayName}
                  className="w-12 h-12 rounded-full"
                />
                {friend.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold">{friend.displayName}</p>
                {friend.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {friend.lastMessage.senderId === currentUser?.id && 'Вы: '}
                    {friend.lastMessage.content}
                  </p>
                )}
              </div>
              {friend.lastMessage && (
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(friend.lastMessage.createdAt), { locale: ru, addSuffix: false })}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${selectedFriendId ? 'flex' : 'hidden md:flex'}`}>
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center gap-3">
              <button
                onClick={() => setSelectedFriendId(null)}
                className="md:hidden p-2 hover:bg-gray-800 rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
              <img
                src={selectedFriend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedFriend.id}`}
                alt={selectedFriend.displayName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{selectedFriend.displayName}</p>
                <p className="text-xs text-gray-500">
                  {selectedFriend.isOnline ? 'онлайн' : 'был(а) недавно'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Начните разговор!</p>
                </div>
              ) : (
                conversation.map(msg => {
                  const isOwn = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-purple-600 text-white rounded-br-md'
                            : 'bg-gray-800 text-white rounded-bl-md'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-500'}`}>
                          {formatDistanceToNow(new Date(msg.createdAt), { locale: ru, addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Написать сообщение..."
                  className="flex-1 bg-gray-900 rounded-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-3 bg-purple-600 rounded-full disabled:opacity-50 hover:bg-purple-700 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Выберите диалог для начала общения</p>
          </div>
        )}
      </div>
    </div>
  );
}
