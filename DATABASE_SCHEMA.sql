-- ===========================================
-- СХЕМА БАЗЫ ДАННЫХ ДЛЯ SUPABASE
-- Социальная сеть "СКВАД"
-- ===========================================

-- Включаем расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (profiles)
-- ===========================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    profile_color TEXT DEFAULT '#6366F1',
    interests TEXT[] DEFAULT '{}',
    is_online BOOLEAN DEFAULT false,
    now_status_type TEXT CHECK (now_status_type IN ('listening', 'watching', 'playing', 'mood')),
    now_status_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS для profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Профили видны всем"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Пользователь может редактировать свой профиль"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Профиль создаётся при регистрации"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ===========================================
-- ТАБЛИЦА ПОСТОВ
-- ===========================================
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    hashtag TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_hashtag ON posts(hashtag);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- RLS для posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Посты видны всем"
    ON posts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Пользователь может создавать посты"
    ON posts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Пользователь может удалять свои посты"
    ON posts FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- ===========================================
-- ТАБЛИЦА ЛАЙКОВ
-- ===========================================
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_likes_user ON likes(user_id);

-- RLS для likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Лайки видны всем"
    ON likes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Пользователь может ставить лайки"
    ON likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователь может убирать свои лайки"
    ON likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ===========================================
-- ТАБЛИЦА КОММЕНТАРИЕВ
-- ===========================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);

-- RLS для comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Комментарии видны всем"
    ON comments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Пользователь может комментировать"
    ON comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Пользователь может удалять свои комментарии"
    ON comments FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- ===========================================
-- ТАБЛИЦА РЕПОСТОВ
-- ===========================================
CREATE TABLE reposts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_reposts_post ON reposts(post_id);

-- RLS для reposts
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Репосты видны всем"
    ON reposts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Пользователь может репостить"
    ON reposts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- ТАБЛИЦА ДРУЖБЫ / ПОДПИСОК
-- ===========================================
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX idx_friendships_from ON friendships(from_user_id);
CREATE INDEX idx_friendships_to ON friendships(to_user_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- RLS для friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Дружба видна участникам"
    ON friendships FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Пользователь может отправлять заявки"
    ON friendships FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Получатель может принять/отклонить заявку"
    ON friendships FOR UPDATE
    TO authenticated
    USING (auth.uid() = to_user_id);

-- ===========================================
-- ТАБЛИЦА СООБЩЕНИЙ
-- ===========================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- RLS для messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Сообщения видны участникам диалога"
    ON messages FOR SELECT
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Пользователь может отправлять сообщения друзьям"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM friendships
            WHERE status = 'accepted' AND
            ((from_user_id = auth.uid() AND to_user_id = receiver_id) OR
             (to_user_id = auth.uid() AND from_user_id = receiver_id))
        )
    );

CREATE POLICY "Получатель может пометить сообщение прочитанным"
    ON messages FOR UPDATE
    TO authenticated
    USING (auth.uid() = receiver_id);

-- ===========================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ===========================================

-- Функция для создания профиля при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, username, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        LOWER(SPLIT_PART(NEW.email, '@', 1)),
        SPLIT_PART(NEW.email, '@', 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_friendships_updated_at
    BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- ПРЕДСТАВЛЕНИЯ (VIEWS)
-- ===========================================

-- Посты с количеством реакций
CREATE OR REPLACE VIEW posts_with_stats AS
SELECT 
    p.*,
    COALESCE(l.likes_count, 0) as likes_count,
    COALESCE(c.comments_count, 0) as comments_count,
    COALESCE(r.reposts_count, 0) as reposts_count,
    (COALESCE(l.likes_count, 0) + COALESCE(c.comments_count, 0) + COALESCE(r.reposts_count, 0)) as total_reactions
FROM posts p
LEFT JOIN (SELECT post_id, COUNT(*) as likes_count FROM likes GROUP BY post_id) l ON p.id = l.post_id
LEFT JOIN (SELECT post_id, COUNT(*) as comments_count FROM comments GROUP BY post_id) c ON p.id = c.post_id
LEFT JOIN (SELECT post_id, COUNT(*) as reposts_count FROM reposts GROUP BY post_id) r ON p.id = r.post_id;

-- Популярные хэштеги
CREATE OR REPLACE VIEW trending_hashtags AS
SELECT 
    hashtag,
    COUNT(*) as post_count
FROM posts
WHERE hashtag IS NOT NULL
    AND created_at > NOW() - INTERVAL '7 days'
GROUP BY hashtag
ORDER BY post_count DESC
LIMIT 10;

-- ===========================================
-- STORAGE BUCKET ДЛЯ АВАТАРОВ
-- ===========================================
-- В Supabase Dashboard создайте bucket 'avatars' с публичным доступом

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true);

-- CREATE POLICY "Аватары публичны" ON storage.objects
--     FOR SELECT USING (bucket_id = 'avatars');

-- CREATE POLICY "Пользователь может загружать свой аватар" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'avatars' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Пользователь может обновлять свой аватар" ON storage.objects
--     FOR UPDATE USING (
--         bucket_id = 'avatars' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );
