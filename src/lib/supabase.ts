import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://znsrmhtcxnpiihbxswdj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc3JtaHRjeG5waWloYnhzd2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjkyMzMsImV4cCI6MjA4NTcwNTIzM30.WXLXd1mpRjwhc4AFeOOjrTAE4iMj2xvW2iKslgOn6t0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для базы данных
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          profile_color: string;
          interests: string[];
          is_online: boolean;
          now_status_type: 'listening' | 'watching' | 'playing' | 'mood' | null;
          now_status_value: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          profile_color?: string;
          interests?: string[];
          is_online?: boolean;
          now_status_type?: 'listening' | 'watching' | 'playing' | 'mood' | null;
          now_status_value?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          content: string;
          hashtag: string | null;
          created_at: string;
        };
        Insert: {
          author_id: string;
          content: string;
          hashtag?: string | null;
        };
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['likes']['Insert']>;
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          author_id: string;
          content: string;
        };
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      reposts: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['reposts']['Insert']>;
      };
      friendships: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          from_user_id: string;
          to_user_id: string;
          status?: 'pending' | 'accepted' | 'rejected';
        };
        Update: {
          status?: 'pending' | 'accepted' | 'rejected';
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
  };
};
