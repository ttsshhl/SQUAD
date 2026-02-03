import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Repeat, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Post } from '../types';
import { useStore } from '../store/useStore';

interface Props {
  post: Post;
}

export function PostCard({ post }: Props) {
  const navigate = useNavigate();
  const { currentUser, getUser, likePost, commentPost, repostPost, deletePost } = useStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const author = getUser(post.authorId);
  if (!author) return null;

  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isOwner = currentUser?.id === post.authorId;
  const hasReposted = currentUser ? post.reposts.includes(currentUser.id) : false;

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentPost(post.id, commentText);
    setCommentText('');
  };

  return (
    <div className="border-b border-gray-800 p-4 hover:bg-gray-900/50 transition-colors">
      <div className="flex gap-3">
        <button onClick={() => navigate(`/profile/${author.id}`)}>
          <img
            src={author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.id}`}
            alt={author.displayName}
            className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity"
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate(`/profile/${author.id}`)}
              className="font-bold hover:underline"
            >
              {author.displayName}
            </button>
            <span className="text-gray-500">@{author.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(post.createdAt), { locale: ru, addSuffix: true })}
            </span>
            {isOwner && (
              <button
                onClick={() => deletePost(post.id)}
                className="ml-auto text-gray-500 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <p className="text-white whitespace-pre-wrap break-words mb-2">{post.content}</p>

          {post.hashtag && (
            <button
              onClick={() => navigate(`/search?q=${post.hashtag}`)}
              className="text-purple-400 text-sm hover:underline mb-2 block"
            >
              #{post.hashtag}
            </button>
          )}

          <div className="flex items-center gap-6 mt-3">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-400/10">
                <MessageCircle size={18} />
              </div>
              <span className="text-sm">{post.comments.length}</span>
            </button>

            <button
              onClick={() => repostPost(post.id)}
              className={`flex items-center gap-2 transition-colors group ${
                hasReposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10">
                <Repeat size={18} />
              </div>
              <span className="text-sm">{post.reposts.length}</span>
            </button>

            <button
              onClick={() => likePost(post.id)}
              className={`flex items-center gap-2 transition-colors group ${
                isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-pink-500/10">
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </div>
              <span className="text-sm">{post.likes.length}</span>
            </button>
          </div>

          {showComments && (
            <div className="mt-4 space-y-3">
              {post.comments.map(comment => {
                const commentAuthor = getUser(comment.authorId);
                return (
                  <div key={comment.id} className="flex gap-2 pl-2 border-l-2 border-gray-800">
                    <img
                      src={commentAuthor?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                    <div>
                      <span className="font-semibold text-sm">{commentAuthor?.displayName}</span>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                );
              })}

              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Написать комментарий..."
                  className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-2 bg-purple-600 rounded-lg disabled:opacity-50 hover:bg-purple-700 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
