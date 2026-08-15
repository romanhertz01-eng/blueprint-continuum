
DO $$ 
DECLARE
    post_record RECORD;
    media_array jsonb;
    new_media jsonb;
    i int := 1;
    img_names text[] := ARRAY['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg', '08.jpg'];
BEGIN
    FOR post_record IN 
        SELECT id, type, media 
        FROM public.posts 
        WHERE author_id IN (SELECT id FROM public.profiles WHERE display_name IN ('Анна Ветрова', 'Максим Тихонов', 'Елена Соколова', 'Денис Кузнецов', 'Марина Волкова', 'Игорь Белов'))
    LOOP
        IF post_record.type = 'image' THEN
            new_media := jsonb_build_array(jsonb_build_object('type', 'image', 'url', '/community/' || img_names[((i-1) % 8) + 1]));
            i := i + 1;
        ELSIF post_record.type = 'video' THEN
            -- Since no video files in public/community/, keeping them or using an image as thumbnail if needed, 
            -- but the prompt says to update to existing files. 
            -- If we don't have video files, maybe just a placeholder or one of the images.
            -- Actually, the card checks firstMedia?.url.
            new_media := jsonb_build_array(jsonb_build_object('type', 'video', 'url', '/community/' || img_names[((i-1) % 8) + 1]));
            i := i + 1;
        ELSIF post_record.type = 'audio' THEN
            new_media := jsonb_build_array(jsonb_build_object('type', 'audio', 'url', '/community/' || img_names[((i-1) % 8) + 1]));
            i := i + 1;
        ELSE
            new_media := '[]'::jsonb;
        END IF;

        UPDATE public.posts 
        SET media = new_media
        WHERE id = post_record.id;
    END LOOP;
END $$;
