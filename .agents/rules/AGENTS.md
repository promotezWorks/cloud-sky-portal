# Web Application - Agent Guidelines

## Architecture & Stack
This web application is built on:
- **Theme**: WoodForge 9 theme (`https://tweakcn.com/themes/cmmhtixuu000504js4s1f25pf`) configured in `src/index.css`
- **AI Primitives**: Simple AI (`https://www.simple-ai.dev/`) in `src/components/simple-ai/` (ChatInput, ChatMessage, streaming indicators)
- **Vite + React + TypeScript**
- **Tailwind CSS** with `@tailwindcss/typography` (shadcn prose) and `tailwindcss-animate`
- **shadcn/ui** component aliases in `@/components/ui`
- **Spaceman RTA** (`@space-man/react-theme-animation`) for animated theme transitions
- **React Wheel Picker** (`@ncdai/react-wheel-picker`) in `@/components/ui/wheel-picker`
- **SVGL** (`@ridemountainpig/svgl-react`) in `@/components/ui/svgl-icon`
- **EvilCharts** (`recharts`) in `@/components/evilcharts/`
- **SoundCN** (`useSound`) in `@/hooks/use-sound`

## Component Guidelines
1. Place reusable UI components in `src/components/ui/`.
2. Wrap articles and markdown content in `<Prose>...</Prose>`.
3. Use `ChatInput` and `ChatMessage` from `@/components/simple-ai` for any AI agent or chat interactions.
4. Use `useSound` for interactive audio cues on clicks, switches, sends, and toasts.
5. For data visualization, compose charts using the EvilCharts pattern with Recharts.
