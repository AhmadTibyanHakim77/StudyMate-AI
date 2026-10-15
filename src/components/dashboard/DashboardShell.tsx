'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Brain, FileText, GraduationCap, LayoutDashboard, LogOut, MessageSquare, Settings, Sparkles, ChartNoAxesColumn } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { BrandMark, BrandWordmark } from '@/components/BrandLogo';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', mobileLabel: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/materials', label: 'My Materials', mobileLabel: 'Files', icon: FileText },
  { href: '/dashboard/summaries', label: 'AI Summaries', mobileLabel: 'Summary', icon: Sparkles },
  { href: '/dashboard/quizzes', label: 'Quiz Center', mobileLabel: 'Quiz', icon: Brain },
  { href: '/dashboard/flashcards', label: 'Flashcards', mobileLabel: 'Cards', icon: GraduationCap },
  { href: '/dashboard/tutor', label: 'AI Tutor', mobileLabel: 'Tutor', icon: MessageSquare },
  { href: '/dashboard/analytics', label: 'Study Analytics', mobileLabel: 'Stats', icon: ChartNoAxesColumn },
  { href: '/dashboard/settings', label: 'Settings', mobileLabel: 'Settings', icon: Settings },
];

export function DashboardShell({ children, identity }: { children: React.ReactNode; identity: string }) {
  const pathname = usePathname();
  const [displayIdentity, setDisplayIdentity] = useState(identity);

  useEffect(() => {
    const updateIdentity = (event: Event) => {
      setDisplayIdentity((event as CustomEvent<string>).detail);
    };
    window.addEventListener('studymate-profile-updated', updateIdentity);
    return () => window.removeEventListener('studymate-profile-updated', updateIdentity);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <BrandMark className="h-9" />
          <BrandWordmark className="text-base" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:block">{displayIdentity}</span>
          <button type="button" onClick={() => signOut({ callbackUrl: '/auth/login' })} className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-border p-4 lg:block">
          <nav aria-label="Dashboard navigation" className="space-y-1">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors', active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <nav aria-label="Dashboard navigation" className="fixed inset-x-0 bottom-0 z-40 flex max-w-full gap-1 overflow-x-auto overscroll-x-contain border-t border-border bg-background p-2 lg:hidden">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
            const mobileLabel = navigation.find((item) => item.href === href)?.mobileLabel ?? label;
            return <Link key={href} href={href} aria-label={label} aria-current={active ? 'page' : undefined} className={cn('flex h-12 w-16 flex-none flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px]', active ? 'text-primary' : 'text-muted-foreground')}><Icon className="h-5 w-5" /><span className="max-w-full truncate">{mobileLabel}</span></Link>;
          })}
        </nav>
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>
    </div>
  );
}
