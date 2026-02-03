# 🖥️ Как запустить СКВАД на своём компьютере

## Шаг 1: Установите необходимые программы

### 1.1 Установите Node.js

1. Перейдите на https://nodejs.org/
2. Скачайте версию **LTS** (рекомендуемую)
3. Запустите установщик и следуйте инструкциям
4. После установки откройте **Командную строку** (Windows) или **Терминал** (Mac/Linux)
5. Проверьте установку:

```bash
node --version
```

Должно показать что-то вроде `v20.10.0`

```bash
npm --version
```

Должно показать что-то вроде `10.2.3`

### 1.2 Установите редактор кода (рекомендуется)

Скачайте **VS Code**: https://code.visualstudio.com/

---

## Шаг 2: Создайте папку проекта

### Windows:

1. Откройте Проводник
2. Создайте папку `squad` в удобном месте (например, `C:\Projects\squad`)
3. Откройте **Командную строку** (Win + R → cmd → Enter)
4. Перейдите в папку:

```bash
cd C:\Projects\squad
```

### Mac/Linux:

```bash
mkdir ~/Projects/squad
cd ~/Projects/squad
```

---

## Шаг 3: Создайте файлы проекта

### Вариант А: Быстрый способ (скачать архив)

Если вы экспортировали проект из этого чата, просто распакуйте архив в папку `squad`.

### Вариант Б: Создать вручную

Создайте файл `package.json` в папке `squad`:

```json
{
  "name": "squad-social",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.7",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

Затем создайте все остальные файлы из проекта (или скопируйте из чата).

---

## Шаг 4: Установите зависимости

В командной строке, находясь в папке проекта, выполните:

```bash
npm install
```

Это займёт 1-3 минуты. Появится папка `node_modules`.

---

## Шаг 5: Настройте Supabase (бесплатно)

### 5.1 Создайте аккаунт

1. Перейдите на https://supabase.com
2. Нажмите "Start your project"
3. Войдите через GitHub (или создайте аккаунт)

### 5.2 Создайте проект

1. Нажмите "New Project"
2. Заполните:
   - **Name**: squad
   - **Database Password**: придумайте пароль (сохраните его!)
   - **Region**: выберите ближайший (например, Frankfurt)
3. Нажмите "Create new project"
4. Подождите 2-3 минуты пока проект создаётся

### 5.3 Получите ключи API

1. В левом меню нажмите на ⚙️ **Settings**
2. Выберите **API**
3. Скопируйте:
   - **Project URL** (например: `https://abcdefgh.supabase.co`)
   - **anon public** key (длинная строка)

### 5.4 Создайте таблицы базы данных

1. В левом меню нажмите **SQL Editor**
2. Нажмите "New query"
3. Скопируйте и вставьте этот SQL код:

```sql
-- Таблица пользователей
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  profile_color TEXT DEFAULT '#8B5CF6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT false
);

-- Интересы пользователей
CREATE TABLE user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Статус "Сейчас"
CREATE TABLE user_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  listening TEXT,
  watching TEXT,
  playing TEXT,
  mood TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Посты
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  hashtag TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Лайки
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Комментарии
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Друзья и подписчики
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Сообщения
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Политики доступа (разрешаем всё для MVP)
CREATE POLICY "Enable all for users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all for posts" ON posts FOR ALL USING (true);
CREATE POLICY "Enable all for likes" ON likes FOR ALL USING (true);
CREATE POLICY "Enable all for comments" ON comments FOR ALL USING (true);
CREATE POLICY "Enable all for friendships" ON friendships FOR ALL USING (true);
CREATE POLICY "Enable all for messages" ON messages FOR ALL USING (true);
CREATE POLICY "Enable all for user_interests" ON user_interests FOR ALL USING (true);
CREATE POLICY "Enable all for user_status" ON user_status FOR ALL USING (true);
```

4. Нажмите **Run** (зелёная кнопка)
5. Должно появиться "Success. No rows returned"

### 5.5 Создайте хранилище для аватаров

1. В левом меню нажмите **Storage**
2. Нажмите "New bucket"
3. Введите имя: `avatars`
4. Включите галочку **Public bucket**
5. Нажмите "Create bucket"

---

## Шаг 6: Создайте файл с ключами

В папке проекта создайте файл `.env` (именно с точкой в начале):

```env
VITE_SUPABASE_URL=https://ваш-проект.supabase.co
VITE_SUPABASE_ANON_KEY=ваш-anon-ключ
```

**Замените значения на ваши реальные ключи из Supabase!**

---

## Шаг 7: Запустите проект

В командной строке выполните:

```bash
npm run dev
```

Вы увидите:

```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

---

## Шаг 8: Откройте в браузере

1. Откройте браузер (Chrome, Firefox, Edge)
2. Перейдите по адресу: **http://localhost:5173**
3. Вы увидите страницу входа СКВАД! 🎉

---

## 🧪 Как тестировать

### Демо-режим (без Supabase)

Нажмите кнопку **"Демо-вход"** на странице входа. Это позволит посмотреть интерфейс с тестовыми данными.

### Реальная регистрация

1. Нажмите "Создать аккаунт"
2. Введите email и пароль
3. Войдите в систему

---

## ⚠️ Возможные проблемы

### Ошибка "npm не найден"

Node.js не установлен или не добавлен в PATH. Переустановите Node.js.

### Ошибка "EACCES permission denied"

На Mac/Linux выполните:
```bash
sudo npm install
```

### Страница не загружается

1. Проверьте, что `npm run dev` запущен
2. Проверьте адрес: http://localhost:5173
3. Попробуйте другой браузер

### Ошибки Supabase

1. Проверьте правильность ключей в `.env`
2. Убедитесь, что таблицы созданы
3. Откройте консоль браузера (F12) и посмотрите ошибки

---

## 🛑 Как остановить сервер

В командной строке нажмите **Ctrl + C**

---

## 📱 Как открыть с телефона

Когда сервер запущен, вы увидите адрес `Network: http://192.168.x.x:5173/`

1. Убедитесь, что телефон в той же Wi-Fi сети
2. Откройте этот адрес в браузере телефона

---

## ✅ Чек-лист

- [ ] Node.js установлен
- [ ] Папка проекта создана
- [ ] Файлы проекта скопированы
- [ ] `npm install` выполнен успешно
- [ ] Supabase проект создан
- [ ] Таблицы в базе данных созданы
- [ ] Storage bucket `avatars` создан
- [ ] Файл `.env` создан с правильными ключами
- [ ] `npm run dev` запущен
- [ ] Сайт открывается на http://localhost:5173

---

## Следующий шаг

Когда всё работает локально, переходите к деплою на Vercel (файл `DEPLOYMENT_GUIDE.md`).
