import CloudSky from '@/components/originkit/ui/cloud-sky';
import { ThreeModelViewer } from '@/components/ThreeModelViewer';
import MouseEffects from '@/components/originkit/ui/click-effects';
import GooeyNav from '@/components/GooeyNav';

const navItems = [
  { label: "Home", href: "#" },
  { label: "Products", href: "#" },
  { label: "Docs", href: "#" },
];

export function App() {
  const modelMode = 'text' as const;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden cursor-default select-none">
      {/* Originkit Cloud Sky Background */}
      <CloudSky
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          minWidth: 0,
          minHeight: 0,
          zIndex: 0,
        }}
        background="#0284c7"
        baseColor="#bae6fd"
        accentColor="#ffffff"
        density={75}
        speed={60}
        size={140}
        sun={{
          x: 75,
          y: 88,
          glow: 'rgba(254, 240, 138, 0.95)',
        }}
        clouds={{ softness: 110, shadow: 115, cirrus: 50 }}
        pointer={{ parallax: 120, wind: 100, damping: 25 }}
      />

      {/* Floating Header with GooeyNav */}
      <header className="relative z-20 w-full px-8 py-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <span className="text-xl font-bold tracking-tight text-white/95 drop-shadow">
            Joyride
          </span>
        </div>

        <div className="pointer-events-auto">
          <GooeyNav
            items={navItems}
            particleCount={15}
            particleDistances={[90, 10]}
            particleR={100}
            initialActiveIndex={0}
            animationTime={600}
            timeVariance={300}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
          />
        </div>
      </header>

      {/* Center True 3D Canvas Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-[850px] h-[380px] sm:h-[460px] flex items-center justify-center">
          <ThreeModelViewer mode={modelMode} />
        </div>
      </main>

      {/* Originkit Click Effects — click-through overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <MouseEffects showLabel={false} />
      </div>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full px-8 py-4 flex items-center justify-between text-xs text-white/60 pointer-events-none">
        <span>Originkit Cloud Sky Background</span>
        <span>Three.js Real 3D Viewport</span>
      </footer>
    </div>
  );
}

export default App;
