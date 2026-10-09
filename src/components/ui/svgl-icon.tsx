import React from 'react';
import { cn } from '@/lib/utils';

export interface SvglIconProps extends React.SVGProps<SVGSVGElement> {
  name: 'react' | 'vite' | 'tailwind' | 'typescript' | 'shadcn' | 'github' | 'vercel' | 'nextjs' | string;
  className?: string;
  size?: number;
}

/**
 * SVGL (https://svgl.app/) Component
 * Renders high-quality brand SVG logos with automatic theme adaptation.
 */
export function SvglIcon({ name, className, size = 24, ...props }: SvglIconProps) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  switch (normalized) {
    case 'react':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-11.5 -10.23174 23 20.46348"
          width={size}
          height={size}
          fill="none"
          className={cn('text-[#61DAFB]', className)}
          {...props}
        >
          <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
          <g stroke="#61DAFB" strokeWidth="1" fill="none">
            <ellipse rx="11" ry="4.2" />
            <ellipse rx="11" ry="4.2" transform="rotate(60)" />
            <ellipse rx="11" ry="4.2" transform="rotate(120)" />
          </g>
        </svg>
      );

    case 'vite':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width={size}
          height={size}
          fill="none"
          className={className}
          {...props}
        >
          <path
            d="M29.6 4.3 16.9 29.4a1 1 0 0 1-1.8 0L2.4 4.3a1 1 0 0 1 1.3-1.3l12.3 5.4 12.3-5.4a1 1 0 0 1 1.3 1.3z"
            fill="url(#viteGradient)"
          />
          <path
            d="m20.5 3-7.7 3.3L15 15l3.8-1.7 1.7-10.3z"
            fill="#FFC920"
          />
          <defs>
            <linearGradient id="viteGradient" x1="2" y1="3" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#41D1FF" />
              <stop offset="1" stopColor="#BD34FE" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'tailwind':
    case 'tailwindcss':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="currentColor"
          className={cn('text-[#38BDF8]', className)}
          {...props}
        >
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.975 12 6.001 12z" />
        </svg>
      );

    case 'typescript':
    case 'ts':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="none"
          className={className}
          {...props}
        >
          <rect width="24" height="24" rx="4" fill="#3178C6" />
          <path
            d="M11.5 15.5H9.7v-7h-2.5V7h6.8v1.5h-2.5v7zm3.1.2c.7.2 1.5.3 2.2.3 1.1 0 1.9-.3 2.5-.8.5-.5.8-1.2.8-2 0-.7-.2-1.3-.6-1.7-.4-.4-1.1-.8-2-1.1-.6-.2-1-.5-1.2-.7-.2-.2-.3-.5-.3-.8 0-.4.1-.7.4-1 .3-.3.7-.4 1.3-.4.6 0 1.2.1 1.7.3l.3-1.4c-.6-.2-1.3-.3-2-.3-1 0-1.8.3-2.4.8-.5.5-.8 1.2-.8 2 0 .7.2 1.2.6 1.6.4.4 1 .8 1.9 1.1.6.2 1 .5 1.2.8.2.3.3.6.3.9 0 .4-.2.8-.5 1-.3.3-.8.4-1.4.4-.7 0-1.5-.2-2.1-.5l-.3 1.4z"
            fill="#FFF"
          />
        </svg>
      );

    case 'shadcn':
    case 'shadcnui':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          width={size}
          height={size}
          fill="none"
          className={cn('text-foreground', className)}
          {...props}
        >
          <line x1="208" y1="128" x2="128" y2="208" stroke="currentColor" strokeWidth="24" strokeLinecap="round" />
          <line x1="192" y1="40" x2="40" y2="192" stroke="currentColor" strokeWidth="24" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase',
            className
          )}
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          {name.slice(0, 2)}
        </div>
      );
  }
}

export default SvglIcon;
