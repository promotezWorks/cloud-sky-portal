import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

/**
 * Spaceman RTA (React Theme Animation - https://spaceman-rta-vite.netlify.app/)
 * Provides animated circular/view transitions between light and dark themes.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [playSwitch] = useSound('switch', { volume: 0.4 });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    playSwitch();
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    // Check if the View Transition API is supported (Spaceman RTA animation technique)
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: theme === 'dark' ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 450,
          easing: 'ease-in-out',
          pseudoElement: theme === 'dark' ? '::view-transition-old(root)' : '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center p-2 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground transition-all duration-200 border border-border shadow-sm hover:scale-105 active:scale-95"
      aria-label="Toggle Theme (Spaceman RTA)"
      title="Toggle Theme (Spaceman RTA)"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-500 transition-transform rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
