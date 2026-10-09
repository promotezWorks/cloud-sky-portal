import React from 'react';
import { cn } from '@/lib/utils';

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'base' | 'lg';
}

/**
 * shadcn prose typography component
 * Powered by @tailwindcss/typography with responsive scale and dark-mode adaptation.
 */
export function Prose({ children, className, size = 'base', ...props }: ProseProps) {
  const sizeClasses = {
    sm: 'prose-sm',
    base: 'prose-base',
    lg: 'prose-lg',
  }[size];

  return (
    <article
      className={cn(
        'prose dark:prose-invert max-w-none',
        'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground',
        'prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:text-primary/80',
        'prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm',
        'prose-blockquote:border-l-primary prose-blockquote:italic',
        sizeClasses,
        className
      )}
      {...props}
    >
      {children}
    </article>
  );
}

export default Prose;
