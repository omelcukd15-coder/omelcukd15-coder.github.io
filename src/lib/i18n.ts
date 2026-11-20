export const SUPPORTED_LANGS = ['ru', 'en', 'tr', 'id'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export function isValidLang(lang: string): lang is Lang {
  return SUPPORTED_LANGS.includes(lang as Lang);
}

export const LANG_LABELS: Record<Lang, { label: string; flag: string }> = {
  ru: { label: 'Русский', flag: '🇷🇺' },
  en: { label: 'English', flag: '🇺🇸' },
  tr: { label: 'Türkçe', flag: '🇹🇷' },
  id: { label: 'Indonesia', flag: '🇮🇩' },
};

export interface Dictionary {
  brand: string;
  nav: {
    games: string;
    streams: string;
    articles: string;
    demo: string;
    login: string;
    dashboard: string;
    tryFree: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaDemo: string;
  };
  howItWorks: {
    title: string;
    steps: { title: string; desc: string }[];
  };
  benefits: {
    title: string;
    items: { title: string; desc: string }[];
  };
  footer: {
    platform: string;
    games: string;
    docs: string;
    contacts: string;
    questions: string;
    terms: string;
    privacy: string;
    legal: string;
    copyright: string;
  };
  categories: {
    all: string;
    guessing: string;
    voting: string;
    arena: string;
    words: string;
  };
  common: {
    details: string;
    launchLive: string;
    playAsViewer: string;
    send: string;
    hint: string;
    skip: string;
    pause: string;
    resume: string;
    newRound: string;
    resetScores: string;
    connectTikTok: string;
    connected: string;
    disconnected: string;
    copyLink: string;
    copied: string;
    openGame: string;
    searchPlaceholder: string;
    popular: string;
    newest: string;
  };
  dashboardNav: {
    overview: string;
    games: string;
    gifts: string;
    content: string;
    playlist: string;
    skins: string;
    stats: string;
    moderation: string;
    settings: string;
    admin: string;
  };
}

const dictionaries: Record<Lang, Dictionary> = {
  ru: {
    brand: 'VibePlay LIVE',
    nav: {
      games: 'Игры',
      streams: 'Эфиры',
      articles: 'Статьи',
      demo: 'Демо-эфир',
      login: 'Войти',
      dashboard: 'Кабинет',
      tryFree: 'Попробовать бесплатно',
    },
    hero: {
      badge: '17 игр для TikTok LIVE · 0 скачиваний',
      title: 'Игры для стрима, в которые играет ваш чат',
      subtitle:
        'Зрители отправляют сообщения и подарки — игра сама считает ходы и ведёт раунды. Живой чат поднимает эфир в рекомендации TikTok без мощного ПК.',
      ctaPrimary: 'Попробовать бесплатно',
      ctaDemo: 'Демо-эфир',
    },
    howItWorks: {
      title: 'Чат играет, а вы ведёте эфир',
      steps: [
        {
          title: 'Подключите за минуту',
          desc: 'Впишите свой @ник в TikTok и вставьте ссылку в OBS (1080×1920) или откройте полноэкранно на телефоне.',
        },
        {
          title: 'Чат управляет игрой',
          desc: 'Каждое сообщение зрителя и подарок мгновенно превращаются в ход, шар с аватаркой или подсказку.',
        },
        {
          title: 'Активный чат — больше зрителей',
          desc: 'Алгоритмы TikTok видят бурный диалог и вовлечённость, продвигая ваш стрим в ленту рекомендаций.',
        },
      ],
    },
    benefits: {
      title: 'Почему стримеры выбирают VibePlay',
      items: [
        {
          title: 'Ничего не нужно скачивать',
          desc: 'Вся игровая логика работает на сервере и открывается в браузере или мобильном веб-приложении.',
        },
        {
          title: 'Для слабого ПК и смартфона',
          desc: 'Лёгкий рендер 60 FPS не грузит процессор при параллельной трансляции в TikTok LIVE Studio или Mobile Gaming.',
        },
        {
          title: 'На языке вашего чата',
          desc: 'Встроенная поддержка русского, английского, турецкого и индонезийского языков с озвучкой слов (TTS).',
        },
        {
          title: 'Запуск за 60 секунд',
          desc: 'Выберите любую из 17 игр, настройте подарки или пресеты и выходите в прямой эфир прямо сейчас.',
        },
      ],
    },
    footer: {
      platform: 'Платформа',
      games: 'Все 17 игр',
      docs: 'Документы',
      contacts: 'Контакты',
      questions: 'Вопросы и ответы',
      terms: 'Пользовательское соглашение',
      privacy: 'Политика конфиденциальности',
      legal: 'Правовая информация',
      copyright: '© 2026 VibePlay LIVE. Оригинальная интерактивная платформа для стримеров.',
    },
    categories: {
      all: 'Все игры',
      guessing: 'Угадайки',
      voting: 'Голосования',
      arena: 'Арены',
      words: 'Слова',
    },
    common: {
      details: 'Подробнее об игре',
      launchLive: 'Запустить в эфире',
      playAsViewer: 'Напишите как зритель...',
      send: 'Отправить',
      hint: 'Подсказка',
      skip: 'Пропустить',
      pause: 'Пауза',
      resume: 'Продолжить',
      newRound: 'Новый раунд',
      resetScores: 'Сбросить очки',
      connectTikTok: 'Подключить TikTok',
      connected: 'TikTok LIVE подключён',
      disconnected: 'Ожидание подключения',
      copyLink: 'Копировать ссылку',
      copied: 'Скопировано!',
      openGame: 'Открыть игру',
      searchPlaceholder: 'Найти игру по названию или механике...',
      popular: 'Популярные',
      newest: 'Новые',
    },
    dashboardNav: {
      overview: 'Обзор',
      games: 'Игры',
      gifts: 'Подарки',
      content: 'Контент',
      playlist: 'Плейлист',
      skins: 'Скины',
      stats: 'Статистика',
      moderation: 'Модерация',
      settings: 'Настройки',
      admin: 'Админка',
    },
  },
  en: {
    brand: 'VibePlay LIVE',
    nav: {
      games: 'Games',
      streams: 'Live Streams',
      articles: 'Articles',
      demo: 'Live Demo',
      login: 'Sign In',
      dashboard: 'Dashboard',
      tryFree: 'Try Free',
    },
    hero: {
      badge: '17 TikTok LIVE Games · Zero Downloads',
      title: 'Interactive stream games controlled by your chat',
      subtitle:
        'Viewers play by typing messages and sending gifts. The engine tracks turns, rounds, and leaderboards automatically to boost your FYP reach.',
      ctaPrimary: 'Try Free',
      ctaDemo: 'Open Demo Stream',
    },
    howItWorks: {
      title: 'Your chat plays while you host',
      steps: [
        {
          title: 'Connect in one minute',
          desc: 'Enter your TikTok @username and paste the 1080×1920 link into OBS or open full-screen on your phone.',
        },
        {
          title: 'Chat drives the action',
          desc: 'Every viewer comment and gift instantly spawns an avatar ball, guess, or boost.',
        },
        {
          title: 'Active chat brings more viewers',
          desc: 'TikTok algorithms reward high comment velocity and push your stream to recommendations.',
        },
      ],
    },
    benefits: {
      title: 'Built for modern mobile & desktop streamers',
      items: [
        {
          title: 'No downloads needed',
          desc: 'Runs in the cloud as a lightweight browser source or mobile web app.',
        },
        {
          title: 'Low CPU footprint',
          desc: 'Smooth 60 FPS animations designed for budget PCs and mobile screen sharing.',
        },
        {
          title: 'Multilingual chat support',
          desc: 'Russian, English, Turkish, and Indonesian with built-in voice TTS.',
        },
        {
          title: 'Ready in 60 seconds',
          desc: 'Pick any of the 17 games, customize gift triggers, and go live.',
        },
      ],
    },
    footer: {
      platform: 'Platform',
      games: 'All 17 Games',
      docs: 'Legal',
      contacts: 'Contacts',
      questions: 'FAQ',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      legal: 'Legal Notice',
      copyright: '© 2026 VibePlay LIVE. Original interactive streaming platform.',
    },
    categories: {
      all: 'All Games',
      guessing: 'Guessing',
      voting: 'Voting',
      arena: 'Arenas',
      words: 'Words',
    },
    common: {
      details: 'Game details',
      launchLive: 'Launch on Stream',
      playAsViewer: 'Type as a viewer...',
      send: 'Send',
      hint: 'Hint',
      skip: 'Skip',
      pause: 'Pause',
      resume: 'Resume',
      newRound: 'New Round',
      resetScores: 'Reset Scores',
      connectTikTok: 'Connect TikTok',
      connected: 'TikTok LIVE Connected',
      disconnected: 'Waiting for connection',
      copyLink: 'Copy link',
      copied: 'Copied!',
      openGame: 'Open Game',
      searchPlaceholder: 'Search games...',
      popular: 'Popular',
      newest: 'Newest',
    },
    dashboardNav: {
      overview: 'Overview',
      games: 'Games',
      gifts: 'Gifts',
      content: 'Content',
      playlist: 'Playlist',
      skins: 'Skins',
      stats: 'Analytics',
      moderation: 'Moderation',
      settings: 'Settings',
      admin: 'Admin',
    },
  },
  tr: {
    brand: 'VibePlay LIVE',
    nav: {
      games: 'Oyunlar',
      streams: 'Yayınlar',
      articles: 'Makaleler',
      demo: 'Demo Yayın',
      login: 'Giriş Yap',
      dashboard: 'Panel',
      tryFree: 'Ücretsiz Dene',
    },
    hero: {
      badge: '17 TikTok LIVE Oyunu · İndirme Yok',
      title: 'Sohbetinizin oynadığı canlı yayın oyunları',
      subtitle:
        'İzleyiciler yorum ve hediyelerle oynar; oyun turları ve puanları otomatik hesaplar. Aktif sohbet yayınınızı keşfete taşır.',
      ctaPrimary: 'Ücretsiz Dene',
      ctaDemo: 'Demo Yayını Aç',
    },
    howItWorks: {
      title: 'Sohbet oynar, siz yayını yönetirsiniz',
      steps: [
        {
          title: 'Bir dakikada bağlanın',
          desc: 'TikTok @kullanıcıadınızı girin, OBS bağlantısını ekleyin veya telefon ekranında tam ekran açın.',
        },
        {
          title: 'Sohbet oyunu yönetir',
          desc: 'Her yorum ve hediye anında avatarlı bir topa, tahmine veya ipucuna dönüşür.',
        },
        {
          title: 'Aktif sohbet = daha fazla izleyici',
          desc: 'Yüksek yorum hızı TikTok algoritmasını tetikler.',
        },
      ],
    },
    benefits: {
      title: 'Neden VibePlay LIVE?',
      items: [
        { title: 'İndirme gerekmez', desc: 'Tarayıcı kaynağı ve mobil uygulama olarak doğrudan çalışır.' },
        { title: 'Düşük sistem kullanımı', desc: 'Zayıf bilgisayarlarda bile akıcı 60 FPS performans.' },
        { title: 'Çoklu dil desteği', desc: 'Türkçe, Rusça, İngilizce ve Endonezce + sesli okuma.' },
        { title: '60 saniyede yayında', desc: '17 oyundan birini seçin ve hemen başlayın.' },
      ],
    },
    footer: {
      platform: 'Platform',
      games: '17 Oyun',
      docs: 'Belgeler',
      contacts: 'İletişim',
      questions: 'SSS',
      terms: 'Kullanım Şartları',
      privacy: 'Gizlilik Politikası',
      legal: 'Yasal Bilgi',
      copyright: '© 2026 VibePlay LIVE. Tüm hakları saklıdır.',
    },
    categories: {
      all: 'Tümü',
      guessing: 'Tahmin',
      voting: 'Oylama',
      arena: 'Arena',
      words: 'Kelimeler',
    },
    common: {
      details: 'Oyun detayları',
      launchLive: 'Yayında Başlat',
      playAsViewer: 'İzleyici gibi yaz...',
      send: 'Gönder',
      hint: 'İpucu',
      skip: 'Geç',
      pause: 'Duraklat',
      resume: 'Devam',
      newRound: 'Yeni Tur',
      resetScores: 'Puanları Sıfırla',
      connectTikTok: 'TikTok Bağla',
      connected: 'TikTok LIVE Bağlı',
      disconnected: 'Bağlantı bekleniyor',
      copyLink: 'Linki kopyala',
      copied: 'Kopyalandı!',
      openGame: 'Oyunu Aç',
      searchPlaceholder: 'Oyun ara...',
      popular: 'Popüler',
      newest: 'Yeni',
    },
    dashboardNav: {
      overview: 'Genel Bakış',
      games: 'Oyunlar',
      gifts: 'Hediyeler',
      content: 'İçerik',
      playlist: 'Oynatma Listesi',
      skins: 'Temalar',
      stats: 'İstatistik',
      moderation: 'Moderasyon',
      settings: 'Ayarlar',
      admin: 'Yönetici',
    },
  },
  id: {
    brand: 'VibePlay LIVE',
    nav: {
      games: 'Game',
      streams: 'Live',
      articles: 'Artikel',
      demo: 'Demo Live',
      login: 'Masuk',
      dashboard: 'Dasbor',
      tryFree: 'Coba Gratis',
    },
    hero: {
      badge: '17 Game TikTok LIVE · Tanpa Unduhan',
      title: 'Game live streaming yang dimainkan oleh chat penonton',
      subtitle:
        'Penonton bermain lewat komentar dan hadiah. Sistem menghitung giliran dan skor otomatis untuk mendorong live ke FYP TikTok.',
      ctaPrimary: 'Coba Gratis',
      ctaDemo: 'Buka Demo Live',
    },
    howItWorks: {
      title: 'Chat bermain, Anda memandu live',
      steps: [
        {
          title: 'Hubungkan dalam 1 menit',
          desc: 'Masukkan @username TikTok Anda dan tempel tautan ke OBS atau buka layar penuh di HP.',
        },
        {
          title: 'Chat mengendalikan game',
          desc: 'Setiap komentar dan hadiah langsung menjadi bola avatar, tebakan, atau efek spesial.',
        },
        {
          title: 'Chat aktif membawa lebih banyak penonton',
          desc: 'Algoritma TikTok memprioritaskan siaran dengan interaksi komentar tinggi.',
        },
      ],
    },
    benefits: {
      title: 'Keunggulan VibePlay LIVE',
      items: [
        { title: 'Tanpa unduhan', desc: 'Berjalan langsung sebagai Browser Source atau aplikasi web ponsel.' },
        { title: 'Ringan di PC & HP', desc: 'Animasi 60 FPS mulus tanpa membebani perangkat.' },
        { title: 'Multi-bahasa', desc: 'Mendukung bahasa Indonesia, Rusia, Inggris, dan Turki.' },
        { title: 'Siap dalam 60 detik', desc: 'Pilih dari 17 game dan langsung mulai siaran.' },
      ],
    },
    footer: {
      platform: 'Platform',
      games: 'Semua 17 Game',
      docs: 'Dokumen',
      contacts: 'Kontak',
      questions: 'FAQ',
      terms: 'Syarat & Ketentuan',
      privacy: 'Kebijakan Privasi',
      legal: 'Informasi Hukum',
      copyright: '© 2026 VibePlay LIVE. Platform interaktif untuk kreator.',
    },
    categories: {
      all: 'Semua Game',
      guessing: 'Tebak-tebakan',
      voting: 'Voting',
      arena: 'Arena',
      words: 'Kata',
    },
    common: {
      details: 'Detail game',
      launchLive: 'Mulai di Live',
      playAsViewer: 'Ketik sebagai penonton...',
      send: 'Kirim',
      hint: 'Petunjuk',
      skip: 'Lewati',
      pause: 'Jeda',
      resume: 'Lanjut',
      newRound: 'Ronde Baru',
      resetScores: 'Reset Skor',
      connectTikTok: 'Hubungkan TikTok',
      connected: 'TikTok LIVE Terhubung',
      disconnected: 'Menunggu koneksi',
      copyLink: 'Salin tautan',
      copied: 'Tersalin!',
      openGame: 'Buka Game',
      searchPlaceholder: 'Cari game...',
      popular: 'Populer',
      newest: 'Terbaru',
    },
    dashboardNav: {
      overview: 'Ringkasan',
      games: 'Game',
      gifts: 'Hadiah',
      content: 'Konten',
      playlist: 'Playlist',
      skins: 'Tampilan',
      stats: 'Analitik',
      moderation: 'Moderasi',
      settings: 'Pengaturan',
      admin: 'Admin',
    },
  },
};

export function getDictionary(lang: string): Dictionary {
  return isValidLang(lang) ? dictionaries[lang] : dictionaries.ru;
}
