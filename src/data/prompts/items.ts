import { PromptItem } from './types';

export const promptItems: PromptItem[] = [
  {
    slug: 'portret-u-okna',
    topicSlug: 'portret',
    category: 'image',
    title: 'Портрет у окна в мягком естественном свете',
    promptRu: 'Портрет молодой женщины у окна, мягкий естественный свет, студийное освещение, глубина резкости, 85mm объектив, высокая детализация, фотореализм.',
    promptEn: 'Portrait of a young woman by the window, soft natural light, studio lighting, depth of field, 85mm lens, high detail, photorealism.',
    providerId: 'nano-banana',
    subModelId: 'nb-2-1k',
    params: { aspect: '3:4' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/01.jpg', alt: 'Фотореалистичный портрет девушки у окна в лучах утреннего солнца' }],
    body: {
      overview: 'Классический поясной портрет с использованием мягкого бокового света от окна, который создает деликатные переходы света и тени, подчеркивая естественную текстуру кожи и блеск в глазах модели без лишнего контраста.',
      breakdown: 'В запросе мы комбинируем описание главного объекта (женщина), типа освещения (естественный свет, окно) и технических параметров съемки (85mm объектив, малая глубина резкости) для получения профессионального эффекта.',
      howToChange: 'Вы можете легко адаптировать этот промпт под свои задачи, изменив описание внешности модели, стиля ее одежды или времени суток — например, указав "golden hour light" для получения более теплых, медовых оттенков в кадре.',
      mistakes: 'Основная ошибка здесь — игнорирование параметров оптики. Без указания объектива с фиксированным фокусным расстоянием нейросеть может выдать слишком широкий угол, что исказит пропорции лица на крупном плане.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  },
  {
    slug: 'portret-studiya-rembrandt',
    topicSlug: 'portret',
    category: 'image',
    title: 'Студийный портрет со светом по схеме Рембрандта',
    promptRu: 'Мужской портрет, освещение по схеме Рембрандта, темный фон, драматичные тени, текстура кожи, кинематографичный стиль, высокое разрешение.',
    promptEn: 'Male portrait, Rembrandt lighting, dark background, dramatic shadows, skin texture, cinematic style, high resolution.',
    providerId: 'seedream',
    subModelId: 'seedream-5-lite',
    params: { aspect: '3:4' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/02.jpg', alt: 'Портрет мужчины в стиле Рембрандта' }],
    body: {
      overview: 'Драматичный мужской портрет в стиле старых мастеров с глубоким контрастом и проработкой деталей, где свет лишь частично освещает одну сторону лица, оставляя другую в мягкой тени для придания объема.',
      breakdown: 'Для достижения эффекта используем ключевые слова: Rembrandt lighting, драматичные тени, текстура кожи. Дополнительно указываем кинематографичный стиль для настройки общей цветокоррекции и атмосферы кадра.',
      howToChange: 'Схема Рембрандта универсальна. Попробуйте поменять модель на человека с характерной внешностью (глубокие морщины, щетина), чтобы подчеркнуть текстуру кожи, или измените фон на более индустриальный.',
      mistakes: 'Главная ошибка — слишком слабый контраст. Свет должен быть направленным, а не рассеянным. Также следите, чтобы нейросеть не "залила" всё лицо светом, теряя ту самую треугольную зону на щеке.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  },
  {
    slug: 'avatarka-minimal',
    topicSlug: 'avatarka',
    category: 'image',
    title: 'Минималистичная аватарка на однотонном фоне',
    promptRu: 'Минималистичный портрет, чистый пастельный фон, мягкое студийное освещение, высокая детализация лица, нейтральное выражение, профессиональное фото.',
    promptEn: 'Minimalist portrait, clean pastel background, soft studio lighting, high face detail, neutral expression, professional photo.',
    providerId: 'nano-banana',
    subModelId: 'nb-2-1k',
    params: { aspect: '1:1' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/03.jpg', alt: 'Минималистичный портрет для аватара' }],
    body: {
      overview: 'Чистая, современная аватарка для профессионального профиля или социальных сетей, выполненная в стиле студийной съемки с ровным мягким светом и акцентом на взгляде, направленном прямо в камеру.',
      breakdown: 'В запросе используются термины: минималистичный портрет, чистый фон, пастельные тона. Мы убираем все лишнее из кадра, чтобы ни один элемент не отвлекал внимание от лица и выражения глаз объекта.',
      howToChange: 'Это отличный шаблон для корпоративных фото. Вы можете сменить цвет фона на ваш брендовый или изменить стиль одежды (например, на "formal suit" или "business casual"), сохраняя общую чистоту и лаконичность.',
      mistakes: 'Использование пестрых фонов или сложной одежды с мелким принтом — это фатальная ошибка для аватарки, так как при уменьшении размера картинки в кружочке профиля объект потеряется и станет неразборчивым.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  },
  {
    slug: 'avatarka-neon',
    topicSlug: 'avatarka',
    category: 'image',
    title: 'Аватарка в неоновой подсветке для соцсетей',
    promptRu: 'Стильный портрет, неоновое освещение, футуристическая атмосфера, глубокие тени, контрастные цвета, крупный план.',
    promptEn: 'Stylish portrait, neon lighting, futuristic atmosphere, deep shadows, contrasting colors, close up.',
    providerId: 'seedream',
    subModelId: 'seedream-5-lite',
    params: { aspect: '1:1' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/04.jpg', alt: 'Неоновый портрет для аватара' }],
    body: {
      overview: 'Эффектный аватар, выделяющийся в ленте новостей.',
      breakdown: 'Неоновый свет, контраст, футуристика.',
      howToChange: 'Выбор других цветов неона для смены настроения.',
      mistakes: 'Чрезмерное количество бликов, которые скрывают черты лица.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  },
  {
    slug: 'anime-gorod-dozhd',
    topicSlug: 'anime',
    category: 'image',
    title: 'Аниме-кадр: город под дождём вечером',
    promptRu: 'Аниме стиль, вечерний городской пейзаж, проливной дождь, свет фонарей в лужах, кинематографичные облака, высокая детализация, уютная атмосфера.',
    promptEn: 'Anime style, evening cityscape, heavy rain, streetlight reflections in puddles, cinematic clouds, high detail, cozy atmosphere.',
    providerId: 'nano-banana',
    subModelId: 'nb-2-1k',
    params: { aspect: '16:9' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/05.jpg', alt: 'Аниме пейзаж города под дождем' }],
    body: {
      overview: 'Атмосферный пейзаж в стиле современного аниме.',
      breakdown: 'Стиль аниме, дождь, освещение отражений.',
      howToChange: 'Смена времени суток или добавление персонажа под зонтом.',
      mistakes: 'Слишком хаотичная композиция фона.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  },
  {
    slug: 'anime-personazh-portret',
    topicSlug: 'anime',
    category: 'image',
    title: 'Портрет аниме-персонажа крупным планом',
    promptRu: 'Портрет аниме-персонажа, детализированные глаза, мягкий свет, пастельные тона, прорисовка волос, студийное качество.',
    promptEn: 'Anime character portrait, detailed eyes, soft light, pastel colors, hair detail, studio quality.',
    providerId: 'seedream',
    subModelId: 'seedream-5-lite',
    params: { aspect: '1:1' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/06.jpg', alt: 'Аниме портрет персонажа' }],
    body: {
      overview: 'Выразительный портрет аниме-персонажа с акцентом на глаза.',
      breakdown: 'Аниме-портрет, акцент на детализации лица.',
      howToChange: 'Изменение цвета волос или аксессуаров персонажа.',
      mistakes: 'Неправильная анатомия лица для данного стиля.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  },
  {
    slug: 'kiberpank-ulica',
    topicSlug: 'kiberpank',
    category: 'image',
    title: 'Неоновая улица киберпанк-мегаполиса',
    promptRu: 'Киберпанк улица, неоновые вывески, футуристичные автомобили, дождь, детализированная архитектура, высокая насыщенность, ночь.',
    promptEn: 'Cyberpunk street, neon signs, futuristic cars, rain, detailed architecture, high saturation, night.',
    providerId: 'nano-banana',
    subModelId: 'nb-2-1k',
    params: { aspect: '16:9' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/07.jpg', alt: 'Киберпанк улица ночью' }],
    body: {
      overview: 'Погружение в атмосферу ночного неонового города.',
      breakdown: 'Киберпанк, неон, футуризм.',
      howToChange: 'Добавление людей или роботов в кадр.',
      mistakes: 'Слишком много объектов, создающих визуальный шум.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  },
  {
    slug: 'interer-skandi-gostinaya',
    topicSlug: 'interer',
    category: 'image',
    title: 'Скандинавская гостиная в дневном свете',
    promptRu: 'Скандинавский интерьер, гостиная, большие окна, много дневного света, натуральное дерево, минимализм, уютный декор.',
    promptEn: 'Scandinavian interior, living room, large windows, lots of natural light, natural wood, minimalist, cozy decor.',
    providerId: 'seedream',
    subModelId: 'seedream-5-lite',
    params: { aspect: '16:9' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/08.jpg', alt: 'Скандинавская гостиная' }],
    body: {
      overview: 'Светлая и просторная гостиная в скандинавском стиле.',
      breakdown: 'Сканди-интерьер, свет, фактура дерева.',
      howToChange: 'Замена мебели или добавление растений.',
      mistakes: 'Неправильно выставленный масштаб мебели.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  },
  {
    slug: 'interer-kuhnya-loft',
    topicSlug: 'interer',
    category: 'image',
    title: 'Кухня в стиле лофт с тёплым светом',
    promptRu: 'Кухня в стиле лофт, кирпичные стены, металлические элементы, теплое освещение, стильные аксессуары, профессиональное фото интерьера.',
    promptEn: 'Loft kitchen, brick walls, metal elements, warm lighting, stylish accessories, professional interior photo.',
    providerId: 'nano-banana',
    subModelId: 'nb-2-1k',
    params: { aspect: '16:9' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/01.jpg', alt: 'Интерьер кухни в стиле лофт' }],
    body: {
      overview: 'Уютная и стильная кухня с элементами лофта.',
      breakdown: 'Лофт, кирпич, дерево, теплое освещение.',
      howToChange: 'Смена осветительных приборов.',
      mistakes: 'Слишком тёмный кадр без достаточного освещения.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  },
  {
    slug: 'eda-pasta-krupno',
    topicSlug: 'eda',
    category: 'image',
    title: 'Макросъёмка пасты с паром над тарелкой',
    promptRu: 'Фуд-фото, макросъемка пасты, аппетитный пар, профессиональная сервировка, мягкий свет, высокая детализация.',
    promptEn: 'Food photography, macro pasta, appetizing steam, professional plating, soft lighting, high detail.',
    providerId: 'seedream',
    subModelId: 'seedream-5-lite',
    params: { aspect: '1:1' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/02.jpg', alt: 'Макро пасты' }],
    body: {
      overview: 'Аппетитное изображение блюда, сфокусированное на текстуре.',
      breakdown: 'Макро, фуд-стиль, свет.',
      howToChange: 'Смена вида блюда.',
      mistakes: 'Слишком размытый фон, скрывающий детали еды.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  },
  {
    slug: 'karta-tovara-krossovki',
    topicSlug: 'karta-tovara',
    category: 'image',
    title: 'Кроссовки на белом фоне для карточки товара',
    promptRu: 'Кроссовки, студийное освещение, белый фон, коммерческое качество, высокая детализация, четкие контуры.',
    promptEn: 'Sneakers, studio lighting, white background, commercial quality, high detail, sharp contours.',
    providerId: 'nano-banana',
    subModelId: 'nb-2-1k',
    params: { aspect: '1:1' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/03.jpg', alt: 'Кроссовки на белом фоне' }],
    body: {
      overview: 'Профессиональное изображение товара для интернет-магазина.',
      breakdown: 'Товар, белый фон, студия.',
      howToChange: 'Смена модели товара.',
      mistakes: 'Неравномерное освещение, дающее лишние тени.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  },
  {
    slug: 'logotip-geometricheskiy',
    topicSlug: 'logotip',
    category: 'image',
    title: 'Геометрический минималистичный логотип',
    promptRu: 'Минималистичный логотип, геометрические формы, векторный стиль, белый фон, чистота линий, концептуальный дизайн.',
    promptEn: 'Minimalist logo, geometric shapes, vector style, white background, clean lines, conceptual design.',
    providerId: 'seedream',
    subModelId: 'seedream-5-lite',
    params: { aspect: '1:1' },
    // TODO: заменить на собственную генерацию по этому промпту
    media: [{ type: 'image', src: '/community/04.jpg', alt: 'Минималистичный геометрический логотип' }],
    body: {
      overview: 'Чистый векторный логотип для современных брендов.',
      breakdown: 'Минимализм, вектор, геометрия.',
      howToChange: 'Смена цветовой схемы.',
      mistakes: 'Слишком сложные элементы, не подходящие для маленьких иконок.'
    },
    status: 'published',
    source: 'editorial',
    publishedAt: '2026-08-11',
    updatedAt: '2026-08-11'
  }
];
