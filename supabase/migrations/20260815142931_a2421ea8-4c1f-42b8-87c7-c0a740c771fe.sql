-- 1. Create 6 demo users in auth.users
DO $$
DECLARE
    u1 uuid := gen_random_uuid();
    u2 uuid := gen_random_uuid();
    u3 uuid := gen_random_uuid();
    u4 uuid := gen_random_uuid();
    u5 uuid := gen_random_uuid();
    u6 uuid := gen_random_uuid();
    user_ids uuid[] := ARRAY[u1, u2, u3, u4, u5, u6];
    emails text[] := ARRAY['demo1@era2.ai', 'demo2@era2.ai', 'demo3@era2.ai', 'demo4@era2.ai', 'demo5@era2.ai', 'demo6@era2.ai'];
    display_names text[] := ARRAY['Анна Ветрова', 'Максим Тихонов', 'Елена Соколова', 'Артем Морозов', 'Юлия Белова', 'Игорь Волков'];
    usernames text[] := ARRAY['anna_v', 'maxtikhon', 'elena_s', 'art_moroz', 'yulia_b', 'igor_v'];
    bios text[] := ARRAY['Дизайнер и энтузиаст ИИ-арта.', 'Создаю кинематографичные видео в Kling.', 'Пишу сложные текстовые квесты.', 'Музыкант, исследую возможности Suno.', 'Разрабатываю умных агентов для бизнеса.', 'Экспериментирую с фотореализмом.'];
BEGIN
    -- Create users in auth.users
    FOR i IN 1..6 LOOP
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token, last_sign_in_at)
        VALUES (
            user_ids[i], 
            emails[i], 
            crypt('Era2-Demo-9f3kQx7w', gen_salt('bf')), 
            now(), 
            '{"provider":"email","providers":["email"]}', 
            jsonb_build_object('display_name', display_names[i]), 
            now(), 
            now(), 
            'authenticated', 
            '', 
            now()
        );

        -- The trigger should handle profiles, but we'll explicitly update them to ensure request details
        UPDATE public.profiles 
        SET 
            display_name = display_names[i], 
            username = usernames[i], 
            bio = bios[i]
        WHERE id = user_ids[i];
    END LOOP;

    -- 2. Create 24 published posts + 3 pending
    -- Images (8)
    FOR i IN 1..8 LOOP
        INSERT INTO public.posts (author_id, type, title, prompt_ru, provider_id, category_slug, media, status, published_at, views)
        VALUES (
            user_ids[(i % 6) + 1],
            'image',
            CASE i 
                WHEN 1 THEN 'Киберпанк Нео-Токио' WHEN 2 THEN 'Лесной дух' WHEN 3 THEN 'Минималистичный интерьер' 
                WHEN 4 THEN 'Футуристичный кроссовок' WHEN 5 THEN 'Портрет в золотой час' WHEN 6 THEN 'Космический пейзаж'
                WHEN 7 THEN 'Абстрактная архитектура' ELSE 'Стимпанк дирижабль' END,
            'Закат в неоновом городе, отражения в лужах, кинематографичный свет, высокая детализация, стиль 80-х.',
            'midjourney',
            'kiberpank',
            jsonb_build_array(jsonb_build_object('type', 'image', 'url', '/community/01.jpg')),
            'published',
            now() - (i || ' hours')::interval,
            floor(random() * 860 + 40)
        );
    END LOOP;

    -- Videos (6)
    FOR i IN 1..6 LOOP
        INSERT INTO public.posts (author_id, type, title, prompt_ru, provider_id, category_slug, media, status, published_at, views)
        VALUES (
            user_ids[(i % 6) + 1],
            'video',
            CASE i 
                WHEN 1 THEN 'Полет над каньоном' WHEN 2 THEN 'Таймлапс цветка' WHEN 3 THEN 'Подводный мир' 
                WHEN 4 THEN 'Прогулка по Парижу' WHEN 5 THEN 'Коты в космосе' ELSE 'Кибер-рынок' END,
            'Динамичная проходка камеры через оживленный рынок, глубокие тени, дым, неоновые вывески, 4k.',
            'kling',
            'reklamnyy-rolik',
            jsonb_build_array(jsonb_build_object('type', 'video', 'url', '/community/video-preview.mp4')),
            'published',
            now() - (i || ' hours')::interval,
            floor(random() * 860 + 40)
        );
    END LOOP;

    -- Text (5)
    FOR i IN 1..5 LOOP
        INSERT INTO public.posts (author_id, type, title, prompt_ru, provider_id, category_slug, media, status, published_at, views)
        VALUES (
            user_ids[(i % 6) + 1],
            'text',
            CASE i 
                WHEN 1 THEN 'Сценарий для короткометражки' WHEN 2 THEN 'Описание персонажа' WHEN 3 THEN 'Рекламный слоган' 
                WHEN 4 THEN 'Письмо из будущего' ELSE 'Техническое задание' END,
            'Драматический диалог между двумя роботами о смысле существования, стиль нуар, лаконичные фразы.',
            'claude',
            'tekstovye-prompty',
            '[]'::jsonb,
            'published',
            now() - (i || ' hours')::interval,
            floor(random() * 860 + 40)
        );
    END LOOP;

    -- Audio (3)
    FOR i IN 1..3 LOOP
        INSERT INTO public.posts (author_id, type, title, prompt_ru, provider_id, category_slug, media, status, published_at, views)
        VALUES (
            user_ids[(i % 6) + 1],
            'audio',
            CASE i WHEN 1 THEN 'Синтвейв трек' WHEN 2 THEN 'Атмосферный эмбиент' ELSE 'Джазовая импровизация' END,
            'Мелодичный ретро-вейв с мощным басом и космическими синтезаторами, темп 110 bpm, ностальгическое настроение.',
            'suno',
            'muzyka-i-zvuk',
            jsonb_build_array(jsonb_build_object('type', 'audio', 'url', '/community/sample-audio.mp3')),
            'published',
            now() - (i || ' hours')::interval,
            floor(random() * 860 + 40)
        );
    END LOOP;

    -- Agents (2)
    FOR i IN 1..2 LOOP
        INSERT INTO public.posts (author_id, type, title, prompt_ru, provider_id, category_slug, media, status, published_at, views)
        VALUES (
            user_ids[(i % 6) + 1],
            'agent',
            CASE i WHEN 1 THEN 'Ассистент-копирайтер' ELSE 'Аналитик рынка' END,
            'Действуй как профессиональный редактор. Твоя задача — проверять тексты на логику, стиль и грамотность.',
            'nano-banana',
            'poleznye-agenty',
            '[]'::jsonb,
            'published',
            now() - (i || ' hours')::interval,
            floor(random() * 860 + 40)
        );
    END LOOP;

    -- Pending (3)
    FOR i IN 1..3 LOOP
        INSERT INTO public.posts (author_id, type, title, prompt_ru, provider_id, category_slug, media, status, views)
        VALUES (
            user_ids[i],
            'image',
            'Черновик ' || i,
            'Тестовый промпт для проверки модерации. Нужно проверить как отображается в статусе pending.',
            'seedream',
            'logotip',
            jsonb_build_array(jsonb_build_object('type', 'image', 'url', '/community/02.jpg')),
            'pending',
            floor(random() * 10)
        );
    END LOOP;

    -- 3. Likes
    INSERT INTO public.likes (post_id, user_id)
    SELECT p.id, u.id 
    FROM public.posts p, public.profiles u
    WHERE u.username IN ('anna_v', 'maxtikhon', 'elena_s', 'art_moroz', 'yulia_b', 'igor_v')
    AND random() > 0.3
    ON CONFLICT DO NOTHING;

    -- 4. Comments (20)
    INSERT INTO public.comments (post_id, author_id, body)
    SELECT p.id, u.id, 
           CASE floor(random()*5) 
             WHEN 0 THEN 'Отличная работа!' WHEN 1 THEN 'Как ты добился такого света?' WHEN 2 THEN 'Очень вдохновляет.' 
             WHEN 3 THEN 'Попробую повторить с этими параметрами.' ELSE 'Круто, спасибо за промпт!' END
    FROM public.posts p, public.profiles u
    WHERE p.status = 'published'
    AND u.username IN ('anna_v', 'maxtikhon', 'elena_s', 'art_moroz', 'yulia_b', 'igor_v')
    AND random() > 0.8
    LIMIT 20;

    -- 5. Follows (12)
    INSERT INTO public.follows (follower_id, following_id)
    SELECT u1.id, u2.id
    FROM public.profiles u1, public.profiles u2
    WHERE u1.username IN ('anna_v', 'maxtikhon', 'elena_s', 'art_moroz', 'yulia_b', 'igor_v')
    AND u2.username IN ('anna_v', 'maxtikhon', 'elena_s', 'art_moroz', 'yulia_b', 'igor_v')
    AND u1.id != u2.id AND random() > 0.6
    LIMIT 12;

END $$;