import './globals.css';
import type { Metadata } from 'next';
import Providers from '@/components/providers';

export const metadata: Metadata = {
  title: 'StudyMate AI - AI-Powered Learning Companion',
  description:
    'Transform your study materials into summaries, quizzes, flashcards and get AI-powered tutoring with StudyMate AI.',
  keywords: ['AI', 'study', 'learning', 'quiz', 'flashcards', 'summary', 'tutor'],
  icons: { icon: '/studymate-mark.svg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
