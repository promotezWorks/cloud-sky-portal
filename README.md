# Universal Web Application Starter

A pre-configured, production-ready React + Vite + TypeScript web application suite equipped with:
- **WoodForge 9 Theme** ([tweakcn](https://tweakcn.com/themes/cmmhtixuu000504js4s1f25pf)): Warm cedar & emerald artisan aesthetic for light and dark modes
- **Simple AI** ([simple-ai.dev](https://www.simple-ai.dev/)): AI agent UI primitives, auto-expanding prompt input & chat messages
- **shadcn/ui**: Modern component primitives built with Tailwind CSS & Radix UI
- **shadcn prose**: Responsive typographic styling via `@tailwindcss/typography`
- **Spaceman RTA** ([Demo](https://spaceman-rta-vite.netlify.app/)): Animated theme switching with View Transitions
- **React Wheel Picker** ([Demo](https://react-wheel-picker.chanhdai.com/)): iOS-style 3D inertia wheel picker
- **SVGL** ([Docs](https://svgl.app/)): High-quality brand SVG logos and icons
- **EvilCharts** ([Docs](https://evilcharts.com/docs/recharts/composed-chart/static)): Composed charting with Recharts
- **SoundCN** ([Docs](https://www.soundcn.xyz/)): Zero-dependency UI sound effects with `useSound`

## Setup & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Adding More Simple AI & shadcn Components
```bash
# Simple AI components
npx shadcn@latest add @simple-ai/chat-page
npx shadcn@latest add @simple-ai/chat-input

# shadcn UI components
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add tabs

# EvilCharts
npx shadcn@latest add @evilcharts/recharts-bar-chart

# SoundCN
npx shadcn@latest add @soundcn/pop
```
