import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Props {
  onClose: () => void;
}

const popularHashtags = [
  'мысли', 'программирование', 'музыка', 'игры', 'искусство', 
  'кино', 'книги', 'путешествия', 'еда', 'спорт'
];

export function CreatePostModal({ onClose }: Props) {
  const [content, setContent] = useState('');
  const [hashtag, setHashtag] = useState('');
  const { createPost } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createPost(content, hashtag || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold">Новый пост</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Что у вас нового?"
            className="w-full h-32 bg-gray-800 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />

          <div>
            <label className="block text-sm text-gray-400 mb-2">Выберите хэштег</label>
            <div className="flex flex-wrap gap-2">
              {popularHashtags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setHashtag(tag === hashtag ? '' : tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    hashtag === tag
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value.replace(/[^а-яa-z0-9]/gi, ''))}
              placeholder="Или введите свой хэштег"
              className="mt-2 w-full bg-gray-800 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Опубликовать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
