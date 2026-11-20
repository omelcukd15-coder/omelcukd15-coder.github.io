export type GameCategory = 'guessing' | 'voting' | 'arena' | 'words';

export interface GiftAction {
  giftName: string;
  emoji: string;
  coins: number;
  effect: string;
  actionType: 'hint' | 'letter' | 'skip' | 'continent' | 'double' | 'grow' | 'shield' | 'revive' | 'speed' | 'boss' | 'feast' | 'golden_apple' | 'bomb' | 'troops' | 'shake';
}

export interface ControlButtonDef {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface GameDefinition {
  slug: string;
  title: string;
  shortRule: string;
  description: string;
  category: GameCategory;
  accentGradient: string;
  emoji: string;
  isNew?: boolean;
  popularity: number;
  platforms: ('tiktok' | 'twitch' | 'youtube')[];
  howChatPlays: string[];
  gifts: GiftAction[];
  controls: ControlButtonDef[];
  faq: { q: string; a: string }[];
}

export const GAMES: GameDefinition[] = [
  {
    slug: 'contexto',
    title: 'Контекстно',
    shortRule: 'Угадайте секретное слово по смысловой близости (ранг от 1000 до 1)',
    description:
      'Чат пишет любые слова, а алгоритм мгновенно показывает, насколько слово близко по смыслу к загаданному. Кто угадал первым — забирает победу и запускает новый раунд через 15 секунд.',
    category: 'words',
    accentGradient: 'from-violet-600 to-indigo-600',
    emoji: '🧠',
    popularity: 99,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'Зритель пишет в чат TikTok любое существительное в именительном падеже.',
      'Игра оценивает смысловую близость к секретному слову (чем ближе к 1, тем теплее: зелёная зона — очень близко).',
      'Первый зритель, написавший точное слово (#1), побеждает и получает очки в таблицу лидеров эфира.',
      'Новый раунд автоматически стартует через 15 секунд или по кнопке стримера.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Открывает слово-подсказку из топ-30 по близости', actionType: 'hint' },
      { giftName: 'Сердце-палец', emoji: '🫰', coins: 5, effect: 'Открывает одну букву загаданного слова', actionType: 'letter' },
      { giftName: 'Пончик', emoji: '🍩', coins: 30, effect: 'Засчитывает слово и запускает новый раунд', actionType: 'skip' },
    ],
    controls: [
      { id: 'hint', label: 'Подсказка', variant: 'primary' },
      { id: 'letter', label: 'Буква', variant: 'secondary' },
      { id: 'new_round', label: 'Новое слово', variant: 'secondary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
      { id: 'tts', label: 'Озвучка', variant: 'secondary' },
    ],
    faq: [
      { q: 'Сколько игроков могут писать одновременно?', a: 'Без ограничений: даже 500+ сообщений в минуту обрабатываются очередью без лагов.' },
      { q: 'Можно ли добавить свои слова и стоп-слова?', a: 'Да, в разделе «Контент» и «Модерация» личного кабинета.' },
    ],
  },
  {
    slug: 'flag-quiz',
    title: 'Угадай флаг',
    shortRule: 'На экране появляется флаг — чат угадывает страну на скорость',
    description:
      'Динамичная викторина по флагам мира. Очки начисляются за скорость: 1-й получает 3 балла, 2-й — 2 балла, остальные — по 1. Баллы копятся за весь эфир, а на экране горит топ-3 лидеров.',
    category: 'guessing',
    accentGradient: 'from-sky-500 to-blue-600',
    emoji: '🏁',
    popularity: 96,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'На вертикальном экране крупно показывается флаг страны.',
      'Зрители пишут название страны в чат на русском или английском.',
      'Первые трое угадавших получают 3, 2 и 1 очко соответственно; счёт копится весь стрим.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Открывает следующую букву названия страны', actionType: 'letter' },
      { giftName: 'TikTok', emoji: '🎵', coins: 1, effect: 'Показывает часть света (Европа, Азия и т.д.)', actionType: 'continent' },
      { giftName: 'Мороженое', emoji: '🍦', coins: 10, effect: 'Пропустить сложный флаг', actionType: 'skip' },
    ],
    controls: [
      { id: 'letter', label: 'Открыть букву', variant: 'primary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
      { id: 'skip', label: 'Пропустить', variant: 'secondary' },
      { id: 'reset_scores', label: 'Сбросить очки', variant: 'danger' },
    ],
    faq: [
      { q: 'Принимаются ли варианты вроде "США" и "Америка"?', a: 'Да, для каждой страны прописаны синонимы и популярные сокращения.' },
    ],
  },
  {
    slug: 'word-reveal',
    title: 'Найди слово',
    shortRule: 'Чат открывает буквы с начала, а побеждает тот, кто напишет всё слово целиком',
    description:
      'Игроки видят скрытое слово по клеточкам. По мере сообщений и подсказок буквы открываются слева направо, пока кто-то не угадает слово целиком.',
    category: 'words',
    accentGradient: 'from-emerald-500 to-teal-600',
    emoji: '🔤',
    popularity: 88,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'Слово скрыто под плитками с известной длиной и категорией.',
      'Каждый корректный шаг или буква в чате открывает следующую букву с начала слова.',
      'Кто первым напишет полное слово — забирает раунд и очки.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Открывает ещё одну букву с начала', actionType: 'letter' },
      { giftName: 'Пончик', emoji: '🍩', coins: 30, effect: 'Пропуск текущего слова', actionType: 'skip' },
    ],
    controls: [
      { id: 'letter', label: 'Открыть букву', variant: 'primary' },
      { id: 'new_round', label: 'Новое слово', variant: 'secondary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
    ],
    faq: [
      { q: 'Какой длины слова в базе?', a: 'От 5 до 10 букв, разбиты по темам и сложности.' },
    ],
  },
  {
    slug: 'doodle-guess',
    title: 'Угадай рисунок',
    shortRule: 'Карандаш рисует штрих за штрихом, пока чат пытается угадать объект',
    description:
      'Живой карандаш на холсте рисует предмет линия за линией, либо стример рисует сам прямо мышкой/пальцем на телефоне. Чат наперегонки угадывает, что изображено.',
    category: 'guessing',
    accentGradient: 'from-amber-500 to-orange-600',
    emoji: '✏️',
    popularity: 91,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'На белом скетчбуке постепенно прорисовывается объект штрих за штрихом.',
      'Зрители пишут догадки в чат, пока рисунок ещё не закончен.',
      'Чем раньше угадано слово, тем больше бонусных очков.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Мгновенно дорисовывает +30% контуров', actionType: 'hint' },
      { giftName: 'Сердце-палец', emoji: '🫰', coins: 5, effect: 'Показывает первую букву', actionType: 'letter' },
      { giftName: 'Мороженое', emoji: '🍦', coins: 10, effect: 'Сменить рисунок', actionType: 'skip' },
    ],
    controls: [
      { id: 'hint', label: 'Дорисовать', variant: 'primary' },
      { id: 'letter', label: 'Буква', variant: 'secondary' },
      { id: 'new_round', label: 'Новый рисунок', variant: 'secondary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
    ],
    faq: [
      { q: 'Могу ли я рисовать сам с телефона?', a: 'Да! Включайте режим ручного рисования прямо на экране.' },
    ],
  },
  {
    slug: 'logo-quiz',
    title: 'Угадай логотип',
    shortRule: 'Размытый логотип бренда становится чётче — быстрее угадал, больше очков',
    description:
      'На старте логотип сильно размыт. Каждые 5 секунд блюр ослабевает. Кто узнает бренд раньше всех, получает максимальные +5 очков.',
    category: 'guessing',
    accentGradient: 'from-rose-500 to-pink-600',
    emoji: '🏷️',
    popularity: 89,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'Появляется заблюренная эмблема известного бренда или игры.',
      'Размытие плавно уменьшается каждые несколько секунд.',
      'Зритель пишет название бренда в чат и получает 1–5 очков в зависимости от скорости.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Снимает 40% размытия сразу', actionType: 'hint' },
      { giftName: 'Мороженое', emoji: '🍦', coins: 10, effect: 'Следующий логотип', actionType: 'skip' },
    ],
    controls: [
      { id: 'hint', label: 'Снять блюр', variant: 'primary' },
      { id: 'skip', label: 'Пропустить', variant: 'secondary' },
      { id: 'reset_scores', label: 'Сбросить очки', variant: 'danger' },
    ],
    faq: [
      { q: 'Какие логотипы в коллекции?', a: 'Технологии, авто, фастфуд, игры, мода и стриминг-сервисы.' },
    ],
  },
  {
    slug: 'spot-the-country',
    title: 'Угадай страну',
    shortRule: 'По уличным деталям, знакам и пейзажу чат определяет страну',
    description:
      'Атмосферная гео-игра в формате GeoGuessr для вертикального стрима. Зрители ищут подсказки на фото улицы: язык вывесок, разметку, архитектуру и природу.',
    category: 'guessing',
    accentGradient: 'from-cyan-500 to-blue-600',
    emoji: '🌍',
    popularity: 85,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'На экране показывается сцена улицы с типичными деталями страны.',
      'Зрители пишут свои варианты стран в чат.',
      'Первый угадавший получает 3 очка и попадает на подиум раунда.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Подсказка с континентом', actionType: 'continent' },
      { giftName: 'Сердце-палец', emoji: '🫰', coins: 5, effect: 'Открыть букву страны', actionType: 'letter' },
    ],
    controls: [
      { id: 'hint', label: 'Подсказка', variant: 'primary' },
      { id: 'skip', label: 'Следующее фото', variant: 'secondary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
    ],
    faq: [
      { q: 'Можно ли загрузить свои локации?', a: 'Да, через редактор контента в личном кабинете.' },
    ],
  },
  {
    slug: 'would-you-rather',
    title: 'Что бы ты выбрал?',
    shortRule: 'Два варианта ответа — чат голосует цифрой 1 или 2 и запускает шары с аватарками',
    description:
      'Социальная битва мнений: на экране две дилеммы. Зрители пишут «1» или «2», на чашу весов падает физический шар с их аватаркой.',
    category: 'voting',
    accentGradient: 'from-fuchsia-600 to-purple-600',
    emoji: '⚖️',
    popularity: 93,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'Стример зачитывает острую или смешную дилемму из 2 вариантов.',
      'Зритель пишет «1» или «2» в чат.',
      'Шар с его аватаркой вылетает на сторону выбранного ответа, двигая шкалу процентов.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Увеличивает шар зрителя в 2.5 раза (+5 голосов)', actionType: 'grow' },
      { giftName: 'Сердце-палец', emoji: '🫰', coins: 5, effect: 'Встряхивает все шары на арене', actionType: 'shake' },
      { giftName: 'Мороженое', emoji: '🍦', coins: 10, effect: 'Переключает на новый вопрос', actionType: 'skip' },
    ],
    controls: [
      { id: 'new_round', label: 'Новый вопрос', variant: 'primary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
      { id: 'hint', label: 'Потрясти', variant: 'secondary' },
    ],
    faq: [
      { q: 'Можно ли добавить свои дилеммы?', a: 'Да, прямо в панели игры или через CSV-импорт.' },
    ],
  },
  {
    slug: 'would-you-rather-vs',
    title: 'Что бы ты выбрал? VS',
    shortRule: 'Неоновая битва сторон: каждый голос и подарок двигает границу противостояния',
    description:
      'Агрессивная неоновая версия голосования с перетягиванием лазерного барьера в реальном времени.',
    category: 'voting',
    accentGradient: 'from-pink-600 to-violet-700',
    emoji: '⚡',
    isNew: true,
    popularity: 90,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'Экран разделён неоновым барьером между стороной А (1) и стороной Б (2).',
      'Сообщения «1» и «2» толкают границу вверх или вниз.',
      'Кто удержит более 50% территории до конца таймера — побеждает.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Мощный импульс +10% к последней стороне', actionType: 'grow' },
      { giftName: 'Пончик', emoji: '🍩', coins: 30, effect: 'Следующий баттл', actionType: 'skip' },
    ],
    controls: [
      { id: 'new_round', label: 'Новый баттл', variant: 'primary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
    ],
    faq: [
      { q: 'Чем отличается от обычной версии?', a: 'Неоновый дизайн, динамический перетяг границы и таймер 45 секунд.' },
    ],
  },
  {
    slug: 'trivia',
    title: 'Викторина',
    shortRule: '9 тематик, 4 формата вопросов и уникальное оформление для каждой темы',
    description:
      'Универсальное квиз-шоу: Кино, Музыка, Игры, Наука, Спорт, История, География, Аниме, IT. Поддерживает выбор A/B/C/D, Правда/Ложь и свободный ответ.',
    category: 'guessing',
    accentGradient: 'from-indigo-600 to-blue-600',
    emoji: '🎓',
    popularity: 94,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'На экране появляется вопрос в стиле выбранной темы.',
      'Чат отвечает буквой (A, B, C, D), цифрой (1–4) или точным словом.',
      'Быстрые правильные ответы строят комбо-серию и топ-3 лидеров.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Убирает 2 неверных варианта ответа', actionType: 'hint' },
      { giftName: 'Сердце-палец', emoji: '🫰', coins: 5, effect: 'Удвоение очков (x2) на текущий вопрос', actionType: 'double' },
      { giftName: 'Мороженое', emoji: '🍦', coins: 10, effect: 'Пропустить вопрос', actionType: 'skip' },
    ],
    controls: [
      { id: 'hint', label: 'Подсказка', variant: 'primary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
      { id: 'skip', label: 'Пропустить вопрос', variant: 'secondary' },
      { id: 'reset_scores', label: 'Сбросить очки', variant: 'danger' },
    ],
    faq: [
      { q: 'Какие 4 формата поддерживаются?', a: '4 варианта, Правда/Ложь, Блиц-ввод слова и Выбор года.' },
    ],
  },
  {
    slug: 'ball-royale',
    title: 'Битва шаров',
    shortRule: 'Любое сообщение спавнит ваш шар с аватаркой; ешьте других, пока зона сжимается',
    description:
      'Королевская битва на физическом 2D Canvas: любое сообщение в чате рождает бойца. Шары двигаются, едят корм и поглощают тех, кто меньше. Смертельная зона сужается.',
    category: 'arena',
    accentGradient: 'from-red-500 to-orange-600',
    emoji: '⚔️',
    popularity: 98,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'Зритель пишет любое сообщение или смайлик в чат — на арене появляется шар с его ником и аватаркой.',
      'Шары автоматически сталкиваются, собирают бусты и поглощают более мелких соперников.',
      'Безопасный круг постоянно сжимается. Последний выживший шар забирает корону!',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Мгновенный рост шара +35%', actionType: 'grow' },
      { giftName: 'Сердце-палец', emoji: '🫰', coins: 5, effect: 'Энергетический щит на 12 секунд', actionType: 'shield' },
      { giftName: 'Пончик', emoji: '🍩', coins: 30, effect: 'Возврат выбывшего шара в центр арены', actionType: 'revive' },
    ],
    controls: [
      { id: 'new_round', label: 'Новый раунд', variant: 'primary' },
      { id: 'hint', label: 'Начать бой / Сжать зону', variant: 'secondary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
    ],
    faq: [
      { q: 'Сколько шаров держит арена без лагов?', a: 'Оптимизированный Canvas держит 60 FPS даже при 120+ одновременных шарах.' },
    ],
  },
  {
    slug: 'land-grab',
    title: 'Захват территории',
    shortRule: 'Зрители делятся на команды (1–4) и закрашивают поле шарами',
    description:
      'Тактическая войнушка цветных фракций! Зритель выбирает команду цифрой 1, 2, 3 или 4, а его шары отскакивают от границ и перекрашивают клетки арены.',
    category: 'arena',
    accentGradient: 'from-lime-500 to-emerald-600',
    emoji: '🗺️',
    popularity: 92,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'На поле 4 базы: Красная (1), Синяя (2), Фиолетовая (3), Жёлтая (4).',
      'Зритель пишет номер команды (1–4), и его шар начинает захватывать клетки для фракции.',
      'Побеждает команда с наибольшим % захваченной карты по окончании таймера.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Спавнит 3 дополнительных шара за команду', actionType: 'troops' },
      { giftName: 'TikTok', emoji: '🎵', coins: 1, effect: 'Ускорение всех шаров команды', actionType: 'speed' },
      { giftName: 'Сердце-палец', emoji: '🫰', coins: 5, effect: 'Щит территории для команды', actionType: 'shield' },
      { giftName: 'Пончик', emoji: '🍩', coins: 30, effect: 'Выпускает гигантский Шар-Босс', actionType: 'boss' },
    ],
    controls: [
      { id: 'new_round', label: 'Новый раунд', variant: 'primary' },
      { id: 'skip', label: 'Завершить', variant: 'secondary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
    ],
    faq: [
      { q: 'Можно ли играть 2 на 2?', a: 'Да, при 2 командах или 4 командах игра автоматически адаптирует цвета.' },
    ],
  },
  {
    slug: 'secret-word',
    title: 'Тайное слово',
    shortRule: 'Классические 5 букв как в Wordle: зелёная, жёлтая и серая подсветка',
    description:
      'Коллективный Wordle для эфира! Каждый зритель предлагает 5-буквенное слово. Клетки подсвечиваются: зелёным — на месте, жёлтым — есть в слове, серым — буквы нет.',
    category: 'words',
    accentGradient: 'from-teal-500 to-emerald-600',
    emoji: '🟩',
    popularity: 95,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'Загадано слово ровно из 5 букв.',
      'Зрители пишут 5-буквенные слова в чат; лучшие догадки добавляются на доску.',
      'Анализируйте цвета клеток и разгадайте слово быстрее таймера!',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Открывает одну зелёную букву', actionType: 'letter' },
      { giftName: 'Мороженое', emoji: '🍦', coins: 10, effect: 'Новое слово из 5 букв', actionType: 'skip' },
    ],
    controls: [
      { id: 'letter', label: 'Открыть букву', variant: 'primary' },
      { id: 'new_round', label: 'Новое слово', variant: 'secondary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
    ],
    faq: [
      { q: 'Что происходит, если слово не из 5 букв?', a: 'Система аккуратно игнорирует слишком длинные или короткие сообщения, не засоряя поле.' },
    ],
  },
  {
    slug: 'snake',
    title: 'Змейка',
    shortRule: 'Автономная змейка охотится на яблоки с аватарками зрителей из чата',
    description:
      'Расслабляющий и азартный формат: змейка сама ползает по полю с умным автопилотом, а каждое сообщение в чате кидает ей сочное яблоко с аватаркой зрителя.',
    category: 'arena',
    accentGradient: 'from-green-500 to-lime-600',
    emoji: '🐍',
    popularity: 87,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'Зритель пишет любое сообщение — на сетке появляется яблоко с его ником.',
      'Змейка нацеливается на ближайшие и самые ценные яблоки, увеличивая длину.',
      'Чьи яблоки змейка съедает чаще, тот поднимается в топ кормильцев.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Пир: высыпает 8 яблок на поле', actionType: 'feast' },
      { giftName: 'Сердце-палец', emoji: '🫰', coins: 5, effect: 'Золотое яблоко (+10 к длине и очкам)', actionType: 'golden_apple' },
      { giftName: 'Мороженое', emoji: '🍦', coins: 10, effect: 'Бомба — укорачивает змейку и сбрасывает препятствия', actionType: 'bomb' },
    ],
    controls: [
      { id: 'hint', label: 'Пир яблок', variant: 'primary' },
      { id: 'new_round', label: 'Рестарт змейки', variant: 'secondary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
    ],
    faq: [
      { q: 'Может ли змейка проиграть?', a: 'Если она врежется в себя при рекордной длине, фиксируется рекорд эфира и стартует новый цикл.' },
    ],
  },
  {
    slug: 'fortress-battle',
    title: 'Битва крепостей',
    shortRule: 'Две страны-крепости сходятся в осаде: чат, лайки и подарки высылают войска',
    description:
      'Эпичная стенка на стенку между двумя странами или командами. Зрители пишут название стороны, ставят лайки и шлют подарки, чтобы вызвать отряды рыцарей и катапульт.',
    category: 'arena',
    accentGradient: 'from-amber-600 to-red-600',
    emoji: '🏰',
    isNew: true,
    popularity: 91,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'На карте стоят 2 крепости с прочностью 1000 HP (например, Левая vs Правая).',
      'Пишите «1» или «2» (либо страну) для призыва отряда пехоты, а лайки усиливают атаку.',
      'Разрушьте вражеский замок до нуля HP для победы вашей армии!',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Призывает отряд из 5 элитных бойцов', actionType: 'troops' },
      { giftName: 'Пончик', emoji: '🍩', coins: 30, effect: 'Призывает Огромного Голема-Босса', actionType: 'boss' },
    ],
    controls: [
      { id: 'new_round', label: 'Новая осада', variant: 'primary' },
      { id: 'pause', label: 'Пауза', variant: 'secondary' },
    ],
    faq: [
      { q: 'Учитываются ли лайки TikTok LIVE?', a: 'Да! Входящий поток лайков автоматически подпитывает боевой заряд.' },
    ],
  },
  {
    slug: 'guesstimate',
    title: 'Угадай сколько',
    shortRule: 'Чат пишет число (год, цену, вес, расстояние) — ближе к правде = больше очков',
    description:
      'Сколько весит синий кит? В каком году открыли метро? Вся аудитория называет числа, а шкала на экране сортирует прогнозы и подсвечивает самого точного аналитика.',
    category: 'guessing',
    accentGradient: 'from-violet-500 to-purple-700',
    emoji: '🔢',
    popularity: 84,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'На экране появляется вопрос с числовым ответом.',
      'Зрители пишут числа в чат (учитывается последняя попытка до конца таймера).',
      'После таймера открывается точный ответ, а топ-3 самых близких получают очки.',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Сужает диапазон отгадки', actionType: 'hint' },
      { giftName: 'Мороженое', emoji: '🍦', coins: 10, effect: 'Новый вопрос', actionType: 'skip' },
    ],
    controls: [
      { id: 'hint', label: 'Показать диапазон', variant: 'primary' },
      { id: 'skip', label: 'Открыть ответ', variant: 'secondary' },
      { id: 'new_round', label: 'Следующий вопрос', variant: 'secondary' },
    ],
    faq: [
      { q: 'Можно ли отвечать несколько раз?', a: 'В каждом раунде фиксируется последнее число зрителя до стоп-сигнала.' },
    ],
  },
  {
    slug: 'emoji-quiz',
    title: 'Угадай по эмодзи',
    shortRule: 'Ребус из 2–5 эмодзи шифрует фильм, игру, песню или крылатую фразу',
    description:
      'Быстрая и весёлая головоломка для любого возраста. Разгадайте зашифрованный фильм, мем, сериал или слово раньше других.',
    category: 'guessing',
    accentGradient: 'from-yellow-400 to-amber-500',
    emoji: '🧩',
    popularity: 90,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'В центре кадра крупно сияют эмодзи-подсказки и категория (например, Фильм).',
      'Зрители пишут ответ в чат.',
      'Угадавший первым забирает баллы и запускает конфетти на весь экран!',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Открывает текстовую подсказку', actionType: 'hint' },
      { giftName: 'Сердце-палец', emoji: '🫰', coins: 5, effect: 'Открывает первую букву ответа', actionType: 'letter' },
      { giftName: 'Мороженое', emoji: '🍦', coins: 10, effect: 'Пропуск ребуса', actionType: 'skip' },
    ],
    controls: [
      { id: 'hint', label: 'Подсказка', variant: 'primary' },
      { id: 'letter', label: 'Буква', variant: 'secondary' },
      { id: 'skip', label: 'Пропустить', variant: 'secondary' },
    ],
    faq: [
      { q: 'Какая база эмодзи-ребусов?', a: 'Более 300 готовых ребусов + возможность добавлять свои.' },
    ],
  },
  {
    slug: 'ege-oge',
    title: 'ЕГЭ и ОГЭ',
    shortRule: 'Стример выбирает экзамен и предмет (Русский, Математика, Обществознание, Информатика)',
    description:
      'Образовательный хит для школьной и студенческой аудитории TikTok! Решайте реальные тестовые задания вместе с чатом и соревнуйтесь в баллах.',
    category: 'guessing',
    accentGradient: 'from-blue-600 to-indigo-700',
    emoji: '📚',
    isNew: true,
    popularity: 93,
    platforms: ['tiktok', 'twitch', 'youtube'],
    howChatPlays: [
      'Стример выбирает тип экзамена (ЕГЭ / ОГЭ) и предмет.',
      'Чат отправляет ответ (цифру, букву или слово) и сразу видит объяснение.',
      'За правильные решения растёт рейтинг «Сдал на 100 баллов!».',
    ],
    gifts: [
      { giftName: 'Роза', emoji: '🌹', coins: 1, effect: 'Подсказка правила или формулы', actionType: 'hint' },
      { giftName: 'Сердце-палец', emoji: '🫰', coins: 5, effect: 'Двойные баллы за задание', actionType: 'double' },
      { giftName: 'Мороженое', emoji: '🍦', coins: 10, effect: 'Следующее задание', actionType: 'skip' },
    ],
    controls: [
      { id: 'hint', label: 'Показать правило', variant: 'primary' },
      { id: 'skip', label: 'Следующее задание', variant: 'secondary' },
      { id: 'reset_scores', label: 'Сбросить баллы', variant: 'danger' },
    ],
    faq: [
      { q: 'Какие предметы доступны?', a: 'Русский язык, Профильная и Базовая математика, Обществознание, Информатика, История.' },
    ],
  },
];

export function getGameBySlug(slug: string): GameDefinition {
  return GAMES.find((g) => g.slug === slug) || GAMES[0];
}

// ==========================================
// ИГРОВЫЕ КОНТЕНТНЫЕ БАЗЫ (ДЛЯ РЕАЛЬНОЙ РАБОТЫ ВСЕХ 17 ИГР)
// ==========================================

export const CONTEXTO_WORDS: { word: string; hints: string[]; related: Record<string, number> }[] = [
  {
    word: 'космос',
    hints: ['вселенная', 'галактика', 'звезда', 'планета', 'ракета', 'орбита', 'луна'],
    related: {
      вселенная: 2, галактика: 4, звезда: 7, планета: 9, ракета: 14, орбита: 18,
      луна: 22, солнце: 28, астронавт: 34, метеорит: 41, спутник: 52, небо: 65,
      марс: 74, телескоп: 86, земля: 95, воздух: 210, вода: 440, дом: 720,
    },
  },
  {
    word: 'океан',
    hints: ['море', 'волна', 'вода', 'глубина', 'кит', 'корабль', 'пляж'],
    related: {
      море: 2, волна: 5, вода: 8, глубина: 12, кит: 16, корабль: 21, пляж: 26,
      акула: 33, остров: 40, берег: 49, шторм: 58, рыба: 72, песок: 90, река: 115,
    },
  },
  {
    word: 'музыка',
    hints: ['песня', 'мелодия', 'ритм', 'гитара', 'концерт', 'звук', 'нота'],
    related: {
      песня: 2, мелодия: 4, ритм: 7, нота: 11, звук: 15, гитара: 20, концерт: 27,
      альбом: 35, наушники: 44, танец: 56, пианино: 68, голос: 81, сцена: 94,
    },
  },
  {
    word: 'телефон',
    hints: ['смартфон', 'экран', 'звонок', 'связь', 'камера', 'интернет', 'зарядка'],
    related: {
      смартфон: 2, мобильник: 3, экран: 6, звонок: 9, камера: 14, зарядка: 19,
      интернет: 25, приложение: 31, сообщение: 40, компьютер: 55, стрим: 66, звук: 89,
    },
  },
];

export const FLAG_COUNTRIES: { code: string; emoji: string; name: string; aliases: string[]; continent: string; colors: string[] }[] = [
  { code: 'BR', emoji: '🇧🇷', name: 'Бразилия', aliases: ['бразилия', 'brazil'], continent: 'Южная Америка', colors: ['#009c3b', '#ffdf00', '#002776'] },
  { code: 'JP', emoji: '🇯🇵', name: 'Япония', aliases: ['япония', 'japan'], continent: 'Азия', colors: ['#ffffff', '#bc002d', '#ffffff'] },
  { code: 'FR', emoji: '🇫🇷', name: 'Франция', aliases: ['франция', 'france'], continent: 'Европа', colors: ['#0055a4', '#ffffff', '#ef4135'] },
  { code: 'TR', emoji: '🇹🇷', name: 'Турция', aliases: ['турция', 'turkey', 'turkiye'], continent: 'Европа / Азия', colors: ['#e30a17', '#ffffff', '#e30a17'] },
  { code: 'ID', emoji: '🇮🇩', name: 'Индонезия', aliases: ['индонезия', 'indonesia'], continent: 'Азия', colors: ['#ff0000', '#ffffff'] },
  { code: 'DE', emoji: '🇩🇪', name: 'Германия', aliases: ['германия', 'germany'], continent: 'Европа', colors: ['#000000', '#dd0000', '#ffce00'] },
  { code: 'IT', emoji: '🇮🇹', name: 'Италия', aliases: ['италия', 'italy'], continent: 'Европа', colors: ['#009246', '#ffffff', '#ce2b37'] },
  { code: 'KR', emoji: '🇰🇷', name: 'Южная Корея', aliases: ['корея', 'южная корея', 'south korea', 'korea'], continent: 'Азия', colors: ['#ffffff', '#cd2e3a', '#0047a0'] },
  { code: 'AR', emoji: '🇦🇷', name: 'Аргентина', aliases: ['аргентина', 'argentina'], continent: 'Южная Америка', colors: ['#74acdf', '#ffffff', '#74acdf'] },
  { code: 'CA', emoji: '🇨🇦', name: 'Канада', aliases: ['канада', 'canada'], continent: 'Северная Америка', colors: ['#ff0000', '#ffffff', '#ff0000'] },
];

export const SECRET_5_WORDS = ['ОКЕАН', 'СТРИМ', 'МЕЧТА', 'ВИДЕО', 'ГОЛОС', 'ЗАМОК', 'ЗВЕЗД', 'ПЛАМЯ', 'ТИТАН', 'МОТОР'];
export const REVEAL_WORDS = [
  { word: 'ТРАНСЛЯЦИЯ', category: 'Стриминг' },
  { word: 'МИКРОФОН', category: 'Оборудование' },
  { word: 'АЛГОРИТМ', category: 'Технологии' },
  { word: 'ГАЛАКТИКА', category: 'Космос' },
  { word: 'ЧЕЛЛЕНДЖ', category: 'Тренды' },
];

export const DOODLE_ITEMS = [
  { word: 'кот', label: 'Кот', emoji: '🐱', hint: 'Домашнее животное с усами' },
  { word: 'дом', label: 'Дом', emoji: '🏠', hint: 'У него есть крыша, окно и дверь' },
  { word: 'ракета', label: 'Ракета', emoji: '🚀', hint: 'Летит в космос' },
  { word: 'корона', label: 'Корона', emoji: '👑', hint: 'Носят короли и победители' },
  { word: 'пицца', label: 'Пицца', emoji: '🍕', hint: 'Итальянский треугольник с сыром' },
];

export const LOGO_BRANDS = [
  { answer: 'tiktok', display: 'TikTok', aliases: ['тикток', 'тик ток', 'tiktok'], bg: '#010101', color: '#25F4EE', glyph: '🎵' },
  { answer: 'youtube', display: 'YouTube', aliases: ['ютуб', 'ютьюб', 'youtube'], bg: '#FF0000', color: '#FFFFFF', glyph: '▶' },
  { answer: 'twitch', display: 'Twitch', aliases: ['твич', 'twitch'], bg: '#9146FF', color: '#FFFFFF', glyph: '📺' },
  { answer: 'telegram', display: 'Telegram', aliases: ['телеграм', 'телега', 'tg', 'telegram'], bg: '#229ED9', color: '#FFFFFF', glyph: '✈️' },
  { answer: 'spotify', display: 'Spotify', aliases: ['спотифай', 'spotify'], bg: '#1DB954', color: '#191414', glyph: '🎧' },
];

export const COUNTRY_SCENES = [
  { country: 'Япония', aliases: ['япония', 'japan'], continent: 'Азия', clues: 'Левостороннее движение · Неон Кандзи · Красные фонари · Фудзи вдали', visual: '⛩️🏮🚄🗻' },
  { country: 'Франция', aliases: ['франция', 'france'], continent: 'Европа', clues: 'Узкие улочки с круассанными · Багеты · Металлическая башня на горизонте', visual: '🥐🗼☕🚲' },
  { country: 'Египет', aliases: ['египет', 'egypt'], continent: 'Африка', clues: 'Жаркая пустыня · Верблюды · Древние пирамиды и сфинкс', visual: '🐪🏜️🔺☀️' },
  { country: 'США', aliases: ['сша', 'америка', 'usa'], continent: 'Северная Америка', clues: 'Жёлтые школьные автобусы · Небоскрёбы · Жёлтое такси', visual: '🚕🗽🍔🏙️' },
];

export const DILEMMAS = [
  { a: 'Никогда не спать и быть бодрым', b: 'Телепортироваться в любую точку раз в день' },
  { a: '1 000 000 онлайн на одном стриме', b: '10 000 верных зрителей каждый день весь год' },
  { a: 'Читать мысли зрителей в чате', b: 'Управлять погодой на улице' },
  { a: 'Есть только пиццу всю жизнь', b: 'Есть только суши всю жизнь' },
];

export const TRIVIA_QUESTIONS = [
  { theme: 'Кино', format: '4 варианта', q: 'Какой фильм собрал больше всего денег в мировом прокате?', options: ['Аватар', 'Мстители: Финал', 'Титаник', 'Интерстеллар'], answerIndex: 0, answerText: 'аватар' },
  { theme: 'Игры', format: '4 варианта', q: 'В какой игре главная валюта — V-Bucks?', options: ['Roblox', 'Minecraft', 'Fortnite', 'Valorant'], answerIndex: 2, answerText: 'fortnite' },
  { theme: 'Наука', format: '4 варианта', q: 'Какая планета Солнечной системы самая большая?', options: ['Сатурн', 'Юпитер', 'Нептун', 'Земля'], answerIndex: 1, answerText: 'юпитер' },
  { theme: 'IT и Стримы', format: '4 варианта', q: 'Какое расширение экрана считается стандартом вертикального стрима TikTok LIVE?', options: ['1920×1080', '800×600', '1080×1920', '1280×720'], answerIndex: 2, answerText: '1080×1920' },
];

export const GUESSTIMATE_QUESTIONS = [
  { q: 'Сколько секунд в одних сутках?', answer: 86400, unit: 'сек' },
  { q: 'В каком году был запущен TikTok (международная версия)?', answer: 2017, unit: 'год' },
  { q: 'Какая высота Эйфелевой башни со шпилем (в метрах)?', answer: 330, unit: 'м' },
  { q: 'Сколько костей в теле взрослого человека?', answer: 206, unit: 'шт' },
];

export const EMOJI_PUZZLES = [
  { emojis: '🦁👑🌅', category: 'Мультфильм', answer: 'король лев', aliases: ['король лев', 'lion king'] },
  { emojis: '🕷️🧑🏙️', category: 'Фильм', answer: 'человек паук', aliases: ['человек паук', 'человек-паук', 'spider man', 'spiderman'] },
  { emojis: '🚢🧊💔', category: 'Фильм', answer: 'титаник', aliases: ['титаник', 'titanic'] },
  { emojis: '⚡👓🪄', category: 'Книга / Фильм', answer: 'гарри поттер', aliases: ['гарри поттер', 'harry potter'] },
];

export const EGE_OGE_QUESTIONS = [
  { exam: 'ЕГЭ', subject: 'Русский язык', q: 'В каком слове верно поставлено ударение на второй слог?', options: ['1) звОнит', '2) звонИт', '3) тОрты', '4) бАнты'], answer: '2', rule: 'В глаголе «звонить» ударение всегда падает на окончание: звонИт, звонЯт.' },
  { exam: 'ЕГЭ', subject: 'Математика', q: 'Найдите корень уравнения: 2^(x - 3) = 16', options: ['1) 5', '2) 6', '3) 7', '4) 8'], answer: '3', rule: '16 = 2^4, поэтому x - 3 = 4, откуда x = 7.' },
  { exam: 'ОГЭ', subject: 'Информатика', q: 'Сколько бит в 1 байте?', options: ['1) 4', '2) 8', '3) 16', '4) 1024'], answer: '2', rule: 'Классический стандарт: 1 байт = 8 бит.' },
  { exam: 'ЕГЭ', subject: 'Обществознание', q: 'Что относится к факторам производства, доходом от которого является рента?', options: ['1) Труд', '2) Капитал', '3) Земля', '4) Информация'], answer: '3', rule: 'Доход с фактора производства «Земля» — рента.' },
];

export interface ArticleItem {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  readTime: string;
  date: string;
  author: string;
  sections: { heading: string; body: string }[];
}

export const ARTICLES: ArticleItem[] = [
  {
    slug: 'how-to-setup-tiktok-live-games-in-obs-and-phone',
    title: 'Как запустить интерактивную игру в TikTok LIVE с телефона или через OBS 1080×1920',
    excerpt: 'Пошаговая инструкция: настройка безопасных зон TikTok, подключение чата без лагов и формат Mobile Gaming.',
    tag: 'Гайд',
    readTime: '4 мин',
    date: '18 ноя 2026',
    author: 'Команда VibePlay',
    sections: [
      {
        heading: '1. Почему важен размер 1080×1920 в OBS',
        body: 'По умолчанию источник «Браузер» в OBS создаётся с разрешением 800×600. Для вертикального эфира TikTok обязательно укажите 1080 по ширине и 1920 по высоте, чтобы игра чётко легла на весь экран без чёрных полос.',
      },
      {
        heading: '2. Запуск прямо на телефоне (без ПК)',
        body: 'Откройте ссылку /play/[token]/[slug] прямо на смартфоне, установите сайт на рабочий стол как веб-приложение (PWA) и включите трансляцию экрана в TikTok Mobile Gaming. Плавающий мини-пульт можно свернуть в один тап.',
      },
      {
        heading: '3. Безопасные зоны интерфейса TikTok',
        body: 'Сверху панель профиля занимает ~150 px, снизу чат и кнопки забирают ~300 px, справа лайки ~120 px. Наш движок держит ключевой игровой контент строго внутри безопасной рамки.',
      },
    ],
  },
  {
    slug: 'why-chat-games-boost-tiktok-recommendations',
    title: 'Почему игры в чате поднимают стрим в рекомендации TikTok LIVE',
    excerpt: 'Разбираем механику удержания, скорость комментариев и триггеры подарков на реальных эфирах.',
    tag: 'Алгоритмы',
    readTime: '5 мин',
    date: '14 ноя 2026',
    author: 'Артём Волков',
    sections: [
      {
        heading: 'Скорость комментариев — главный сигнал',
        body: 'Когда новый зритель заходит из ленты рекомендаций на стрим, где чат каждую секунду пишет слова для «Контекстно» или «Тайного слова», срабатывает эффект сопричастности.',
      },
      {
        heading: 'Мотивация подарками без навязчивости',
        body: 'Подарок за 1 монету открывает букву или растит шар зрителя в «Битве шаров». Люди донатят ради влияния на игру и победы своей команды.',
      },
    ],
  },
  {
    slug: 'top-5-games-for-first-stream',
    title: 'Топ-5 игр VibePlay для самого первого эфира в 2026 году',
    excerpt: 'С каких форматов проще начать, если у вас пока 10–30 зрителей в онлайне.',
    tag: 'Подборка',
    readTime: '3 мин',
    date: '10 ноя 2026',
    author: 'Мария К.',
    sections: [
      {
        heading: '1. Контекстно и Тайное слово',
        body: 'Идеальны даже для 5 активных участников в чате: раунды динамичны, а каждый ответ даёт мгновенную обратную связь.',
      },
      {
        heading: '2. Битва шаров и Угадай флаг',
        body: 'Визуально яркие арены, которые цепляют взгляд при пролистывании ленты TikTok за первые 1.5 секунды.',
      },
    ],
  },
];

export const LIVE_SHOWCASE_STREAMS = [
  { id: '1', streamer: '@denis_streams', avatar: '🧑‍🚀', viewers: 1420, gameSlug: 'ball-royale', gameTitle: 'Битва шаров', country: 'RU', tiktokUrl: 'https://www.tiktok.com/@tiktok/live' },
  { id: '2', streamer: '@alina_quiz', avatar: '🦊', viewers: 890, gameSlug: 'contexto', gameTitle: 'Контекстно', country: 'RU', tiktokUrl: 'https://www.tiktok.com/@tiktok/live' },
  { id: '3', streamer: '@geo_master', avatar: '🌍', viewers: 640, gameSlug: 'flag-quiz', gameTitle: 'Угадай флаг', country: 'EN', tiktokUrl: 'https://www.tiktok.com/@tiktok/live' },
  { id: '4', streamer: '@ege_100_live', avatar: '🎓', viewers: 510, gameSlug: 'ege-oge', gameTitle: 'ЕГЭ и ОГЭ', country: 'RU', tiktokUrl: 'https://www.tiktok.com/@tiktok/live' },
  { id: '5', streamer: '@arena_turk', avatar: '⚔️', viewers: 775, gameSlug: 'land-grab', gameTitle: 'Захват территории', country: 'TR', tiktokUrl: 'https://www.tiktok.com/@tiktok/live' },
  { id: '6', streamer: '@indo_play', avatar: '🐍', viewers: 430, gameSlug: 'snake', gameTitle: 'Змейка', country: 'ID', tiktokUrl: 'https://www.tiktok.com/@tiktok/live' },
];
