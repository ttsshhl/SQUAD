export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  profileColor: string;
  interests: string[];
  createdAt: string;
  isOnline: boolean;
  nowStatus?: {
    type: 'listening' | 'watching' | 'playing' | 'mood';
    value: string;
  };
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  hashtag?: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
  reposts: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}
