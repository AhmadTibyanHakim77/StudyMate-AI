export const translations = {
  en: {
    nav: {
      features: 'Features',
      howItWorks: 'How It Works',
      faq: 'FAQ',
      signIn: 'Sign In',
      getStarted: 'Get Started',
    },
    hero: {
      badge: 'AI-Powered Learning Platform',
      title1: 'Learn Smarter with',
      title2: 'AI',
      subtitle:
        'Transform your study materials into summaries, quizzes, flashcards, and get AI-powered tutoring. Study more effectively with intelligent tools designed for your success.',
      cta1: 'Start Learning Free',
      cta2: 'Explore Features',
    },
    features: {
      title1: 'Everything You Need to',
      title2: 'Excel',
      subtitle: 'Powerful AI tools designed to transform how you study and learn.',
      summaryTitle: 'AI Summary',
      summaryDesc: 'Generate concise, structured summaries from your study materials. Save hours of reading with AI-powered content extraction.',
      quizTitle: 'Quiz Generator',
      quizDesc: 'Create customized quizzes instantly from any material. Test your knowledge with AI-generated questions and track your progress.',
      flashcardTitle: 'Smart Flashcards',
      flashcardDesc: 'Review key concepts with AI-generated flashcards. Mark your understanding and focus on what matters most.',
      tutorTitle: 'AI Tutor',
      tutorDesc: 'Ask questions and receive context-aware answers grounded in your study materials. Like having a personal tutor 24/7.'
    },
    auth: {
      loginTitle: 'Welcome Back',
      loginSubtitle: 'Sign in to continue your learning journey',
      registerTitle: 'Create Account',
      registerSubtitle: 'Start your AI-powered learning journey',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      signInBtn: 'Sign In',
      registerBtn: 'Create Account',
      noAccount: 'Don\'t have an account?',
      haveAccount: 'Already have an account?',
    }
  },
  id: {
    nav: {
      features: 'Fitur',
      howItWorks: 'Cara Kerja',
      faq: 'FAQ',
      signIn: 'Masuk',
      getStarted: 'Mulai Sekarang',
    },
    hero: {
      badge: 'Platform Belajar Berbasis AI',
      title1: 'Belajar Lebih Cerdas dengan',
      title2: 'AI',
      subtitle:
        'Ubah materi belajar Anda menjadi ringkasan, kuis, flashcard, dan dapatkan bimbingan AI. Belajar lebih efektif dengan alat cerdas yang dirancang untuk kesuksesan Anda.',
      cta1: 'Mulai Belajar Gratis',
      cta2: 'Jelajahi Fitur',
    },
    features: {
      title1: 'Semua yang Anda Butuhkan untuk',
      title2: 'Sukses',
      subtitle: 'Alat AI bertenaga yang dirancang untuk mengubah cara Anda belajar.',
      summaryTitle: 'Ringkasan AI',
      summaryDesc: 'Buat ringkasan yang ringkas dan terstruktur dari materi Anda. Hemat waktu berjam-jam dengan ekstraksi konten dari AI.',
      quizTitle: 'Generator Kuis',
      quizDesc: 'Buat kuis kustom seketika dari materi apapun. Uji pengetahuan Anda dan pantau perkembangan Anda.',
      flashcardTitle: 'Flashcard Cerdas',
      flashcardDesc: 'Ulas konsep penting dengan flashcard AI. Tandai pemahaman Anda dan fokus pada hal yang paling penting.',
      tutorTitle: 'Tutor AI',
      tutorDesc: 'Ajukan pertanyaan dan dapatkan jawaban kontekstual berdasarkan materi Anda. Seperti memiliki tutor pribadi 24/7.'
    },
    auth: {
      loginTitle: 'Selamat Datang Kembali',
      loginSubtitle: 'Masuk untuk melanjutkan perjalanan belajar Anda',
      registerTitle: 'Buat Akun',
      registerSubtitle: 'Mulai perjalanan belajar berbasis AI Anda',
      email: 'Email',
      password: 'Kata Sandi',
      confirmPassword: 'Konfirmasi Kata Sandi',
      fullName: 'Nama Lengkap',
      signInBtn: 'Masuk',
      registerBtn: 'Buat Akun',
      noAccount: 'Belum punya akun?',
      haveAccount: 'Sudah punya akun?',
    }
  },
};

export type Language = keyof typeof translations;
export type TranslationType = typeof translations.en;
