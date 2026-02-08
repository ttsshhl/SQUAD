import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Post, Message, FriendRequest, Conversation } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  friendRequests: FriendRequest[];
  conversations: Conversation[];
  messages: Message[];
  
  // Auth
  login: (email: string, password: string) => User | null;
  register: (email: string, password: string, username: string) => User;
  logout: () => void;
  
  // Users
  updateUser: (userId: string, updates: Partial<User>) => void;
  getUser: (userId: string) => User | undefined;
  searchUsers: (query: string) => User[];
  
  // Posts
  createPost: (content: string, hashtag?: string) => Post;
  likePost: (postId: string) => void;
  commentPost: (postId: string, content: string) => void;
  repostPost: (postId: string) => void;
  deletePost: (postId: string) => void;
  
  // Friends
  sendFriendRequest: (toUserId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  getFriends: (userId: string) => User[];
  getFollowers: (userId: string) => User[];
  getFriendStatus: (userId: string) => 'none' | 'pending' | 'friend' | 'follower';
  
  // Messages
  sendMessage: (receiverId: string, content: string) => void;
  getConversation: (userId: string) => Message[];
  markAsRead: (conversationId: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock users for demo
const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'anna@demo.ru',
    username: 'anna_mir',
    displayName: 'Анна Мирова',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna',
    bio: 'Люблю программирование и дизайн',
    profileColor: '#8B5CF6',
    interests: ['программирование', 'дизайн', 'музыка'],
    createdAt: new Date().toISOString(),
    isOnline: true,
    nowStatus: { type: 'listening', value: 'Radiohead - Creep' }
  },
  {
    id: 'user2',
    email: 'ivan@demo.ru',
    username: 'ivan_dev',
    displayName: 'Иван Петров',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ivan',
    bio: 'Frontend разработчик',
    profileColor: '#EC4899',
    interests: ['react', 'typescript', 'игры'],
    createdAt: new Date().toISOString(),
    isOnline: true,
    nowStatus: { type: 'playing', value: 'Cyberpunk 2077' }
  },
  {
    id: 'user3',
    email: 'maria@demo.ru',
    username: 'maria_art',
    displayName: 'Мария Светлова',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    bio: 'Художник и иллюстратор',
    profileColor: '#10B981',
    interests: ['искусство', 'рисование', 'аниме'],
    createdAt: new Date().toISOString(),
    isOnline: false,
    nowStatus: { type: 'watching', value: 'Attack on Titan' }
  }
];

const mockPosts: Post[] = [
  {
    id: 'post1',
    authorId: 'user1',
    content: 'Сегодня начала изучать новый фреймворк! Очень интересно 🚀',
    hashtag: 'программирование',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likes: ['user2', 'user3'],
    comments: [
      { id: 'c1', authorId: 'user2', content: 'Какой фреймворк?', createdAt: new Date().toISOString() }
    ],
    reposts: []
  },
  {
    id: 'post2',
    authorId: 'user2',
    content: 'Кто ещё ждёт выход новой части игры? Не могу больше ждать!',
    hashtag: 'игры',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    likes: ['user1'],
    comments: [],
    reposts: ['user3']
  },
  {
    id: 'post3',
    authorId: 'user3',
    content: 'Закончила новую иллюстрацию! Скоро покажу результат 🎨',
    hashtag: 'искусство',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    likes: ['user1', 'user2'],
    comments: [],
    reposts: []
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      posts: mockPosts,
      friendRequests: [
        { id: 'fr1', fromUserId: 'user1', toUserId: 'user2', status: 'accepted', createdAt: new Date().toISOString() }
      ],
      conversations: [],
      messages: [],

      login: (email, _password) => {
        const user = get().users.find(u => u.email === email);
        if (user) {
          set({ currentUser: { ...user, isOnline: true } });
          return user;
        }
        return null;
      },

      register: (email, _password, username) => {
        const newUser: User = {
          id: generateId(),
          email,
          username,
          displayName: username,
          profileColor: '#6366F1',
          interests: [],
          createdAt: new Date().toISOString(),
          isOnline: true
        };
        set(state => ({
          users: [...state.users, newUser],
          currentUser: newUser
        }));
        return newUser;
      },

      logout: () => {
        set({ currentUser: null });
      },

      updateUser: (userId, updates) => {
        set(state => ({
          users: state.users.map(u => u.id === userId ? { ...u, ...updates } : u),
          currentUser: state.currentUser?.id === userId 
            ? { ...state.currentUser, ...updates }
            : state.currentUser
        }));
      },

      getUser: (userId) => {
        return get().users.find(u => u.id === userId);
      },

      searchUsers: (query) => {
        const q = query.toLowerCase();
        return get().users.filter(u => 
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q) ||
          u.interests.some(i => i.toLowerCase().includes(q))
        );
      },

      createPost: (content, hashtag) => {
        const newPost: Post = {
          id: generateId(),
          authorId: get().currentUser!.id,
          content,
          hashtag,
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
          reposts: []
        };
        set(state => ({ posts: [newPost, ...state.posts] }));
        return newPost;
      },

      likePost: (postId) => {
        const userId = get().currentUser?.id;
        if (!userId) return;
        set(state => ({
          posts: state.posts.map(p => {
            if (p.id === postId) {
              const hasLiked = p.likes.includes(userId);
              return {
                ...p,
                likes: hasLiked 
                  ? p.likes.filter(id => id !== userId)
                  : [...p.likes, userId]
              };
            }
            return p;
          })
        }));
      },

      commentPost: (postId, content) => {
        const userId = get().currentUser?.id;
        if (!userId) return;
        const newComment = {
          id: generateId(),
          authorId: userId,
          content,
          createdAt: new Date().toISOString()
        };
        set(state => ({
          posts: state.posts.map(p => 
            p.id === postId 
              ? { ...p, comments: [...p.comments, newComment] }
              : p
          )
        }));
      },

      repostPost: (postId) => {
        const userId = get().currentUser?.id;
        if (!userId) return;
        set(state => ({
          posts: state.posts.map(p => {
            if (p.id === postId && !p.reposts.includes(userId)) {
              return { ...p, reposts: [...p.reposts, userId] };
            }
            return p;
          })
        }));
      },

interface StoreState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>; // НОВАЯ ФУНКЦИЯ
  logout: () => void;
  // ... остальные поля
}

export const useStore = create<StoreState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,

  // Ваши существующие функции...
  login: async (email: string, password: string) => {
    // ваша логика
  },

  register: async (email: string, password: string) => {
    // ваша логика
  },

  // НОВАЯ ФУНКЦИЯ - Google OAuth через Supabase
  loginWithGoogle: async (code: string) => {
    try {
      // Обмениваем код на сессию через Supabase
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) throw error;

      if (data.session && data.user) {
        // Проверяем, есть ли профиль пользователя
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        // Если профиля нет - создаём
        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              username: data.user.email?.split('@')[0] || 'user',
              full_name: data.user.user_metadata?.full_name || '',
              avatar_url: data.user.user_metadata?.avatar_url || '',
            });

          if (insertError) throw insertError;
        }

        // Получаем обновлённый профиль
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({
          currentUser: updatedProfile,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },
      deletePost: (postId) => {
        set(state => ({
          posts: state.posts.filter(p => p.id !== postId)
        }));
      },

      sendFriendRequest: (toUserId) => {
        const fromUserId = get().currentUser?.id;
        if (!fromUserId) return;
        const existing = get().friendRequests.find(
          fr => (fr.fromUserId === fromUserId && fr.toUserId === toUserId) ||
                (fr.fromUserId === toUserId && fr.toUserId === fromUserId)
        );
        if (existing) return;
        const newRequest: FriendRequest = {
          id: generateId(),
          fromUserId,
          toUserId,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        set(state => ({
          friendRequests: [...state.friendRequests, newRequest]
        }));
      },

      acceptFriendRequest: (requestId) => {
        set(state => ({
          friendRequests: state.friendRequests.map(fr =>
            fr.id === requestId ? { ...fr, status: 'accepted' } : fr
          )
        }));
      },

      rejectFriendRequest: (requestId) => {
        set(state => ({
          friendRequests: state.friendRequests.map(fr =>
            fr.id === requestId ? { ...fr, status: 'rejected' } : fr
          )
        }));
      },

      getFriends: (userId) => {
        const requests = get().friendRequests.filter(
          fr => fr.status === 'accepted' &&
            (fr.fromUserId === userId || fr.toUserId === userId)
        );
        const friendIds = requests.map(fr =>
          fr.fromUserId === userId ? fr.toUserId : fr.fromUserId
        );
        return get().users.filter(u => friendIds.includes(u.id));
      },

      getFollowers: (userId) => {
        const requests = get().friendRequests.filter(
          fr => fr.toUserId === userId && fr.status === 'pending'
        );
        return get().users.filter(u => requests.some(fr => fr.fromUserId === u.id));
      },

      getFriendStatus: (userId) => {
        const currentUserId = get().currentUser?.id;
        if (!currentUserId) return 'none';
        const request = get().friendRequests.find(
          fr => (fr.fromUserId === currentUserId && fr.toUserId === userId) ||
                (fr.fromUserId === userId && fr.toUserId === currentUserId)
        );
        if (!request) return 'none';
        if (request.status === 'accepted') return 'friend';
        if (request.fromUserId === currentUserId) return 'pending';
        return 'follower';
      },

      sendMessage: (receiverId, content) => {
        const senderId = get().currentUser?.id;
        if (!senderId) return;
        const newMessage: Message = {
          id: generateId(),
          senderId,
          receiverId,
          content,
          createdAt: new Date().toISOString(),
          read: false
        };
        set(state => ({
          messages: [...state.messages, newMessage]
        }));
      },

      getConversation: (userId) => {
        const currentUserId = get().currentUser?.id;
        if (!currentUserId) return [];
        return get().messages.filter(
          m => (m.senderId === currentUserId && m.receiverId === userId) ||
               (m.senderId === userId && m.receiverId === currentUserId)
        ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },

      markAsRead: (_conversationId) => {
        // Implementation for marking messages as read
      }
    }),
    {
      name: 'squad-storage'
    }
  )
);
