import Image from 'next/image';
import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return <Image src="/studymate-mark.svg" alt="" width={128} height={112} aria-hidden="true" style={{ width: 'auto' }} className={cn('h-9 w-auto shrink-0', className)} />;
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('whitespace-nowrap font-bold text-foreground', className)}>
      Study<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Mate</span><span className="text-secondary"> AI</span>
    </span>
  );
}
