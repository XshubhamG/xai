# xai

Multimodal chat on Convex.

OpenRouter-backed models, email login, full-text search over your messages, and per-user system prompt and personality settings.

## Features

- **Real-time Multimodal Chat:** Seamless, responsive chat interface powered by Vercel AI SDK and Convex.
- **Robust Authentication:** Secure email login using Better Auth with Convex adapter.
- **Full-Text Search:** Instantly search through your entire message history.
- **Customizable AI Personas:** Configure per-user system prompts and AI personalities.
- **Markdown & Syntax Highlighting:** Rich text rendering with Shiki and React Markdown.
- **Modern UI/UX:** Built with Tailwind CSS v4 and shadcn/ui components, featuring light and dark modes.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Backend & Database:** [Convex](https://www.convex.dev/)
- **Authentication:** [Better Auth](https://better-auth.com/)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/) & OpenRouter
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Markdown Processing:** Shiki, React Markdown, remark-math, rehype-katex

## Screenshots

<!-- Add your screenshots here. Replace the bracketed text with actual paths to your images -->
![Home Page]([Path to Home Page Screenshot])
*Caption: Landing page and authentication*

![Chat Interface]([Path to Chat Interface Screenshot])
*Caption: Multimodal chat interface in action*

## Prerequisites

Ensure you have the following installed before getting started:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Bun](https://bun.sh/) (Preferred package manager)

## Getting Started

### 1. Clone the repository

```bash
git clone [repository-url]
cd xai
```

### 2. Install dependencies

```bash
bun install
```

### 3. Environment Variables

Create a `.env.local` file in the root of the project and add the necessary environment variables. You will need keys for Convex and your AI provider (e.g., OpenRouter).

```env
# Convex
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...

# Auth (Better Auth)
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# AI Provider (OpenRouter/OpenAI compatible)
OPENAI_API_KEY=...
```

### 4. Run the development server

Start both the Convex backend and the Next.js frontend:

```bash
# Terminal 1: Run Convex dev server
bun run convex

# Terminal 2: Run Next.js dev server
bun run dev
```

Navigate to `http://localhost:3000` to view the application.

## Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable React components (UI and domain-specific).
- `convex/`: Convex backend functions, schemas, and configurations.
- `lib/`: Utility functions and shared configurations.
- `public/`: Static assets.

## Scripts

- `bun run dev`: Starts the Next.js development server with Turbopack.
- `bun run convex`: Starts the Convex development server and syncs schema.
- `bun run build`: Builds the Next.js application for production.
- `bun run start`: Starts the Next.js production server.
- `bun run lint`: Runs ESLint to find and fix problems.
- `bun run format`: Formats code using Prettier.
- `bun run typecheck`: Runs TypeScript compiler check.

## License

[Add License Information Here]
