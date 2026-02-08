# Fusion Monsters

A 3D monster fusion battle game built with Next.js, Three.js, and the Anthropic Claude API.

## Features

- Generate unique monsters using AI
- Fuse two monsters together to create new powerful creatures
- Battle against bosses in dramatic anime-style combat
- Progress through stages with increasingly challenging bosses
- Super Fusion with dice-based mechanics (unlocked after Stage 1)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **3D Graphics**: Three.js
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Anthropic API Key

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd fusion-monster
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the project root and add your Anthropic API key:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

You can get an API key from [Anthropic Console](https://console.anthropic.com/).

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. **Generate Monsters**: Click the generate button and describe a monster (e.g., "Fire Dragon", "Ice Golem")
2. **Select for Fusion**: Click on two monsters to select them for fusion
3. **Fuse**: Click the FUSION button to combine them into a new creature
4. **Battle**: Select party members and start the battle against the stage boss
5. **Progress**: Defeat bosses to unlock new stages and Super Fusion

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude | Yes |

## API Routes

The game uses the following API endpoints powered by Claude:

- `/api/generate` - Generate new monster stats and 3D models
- `/api/fusion` - Create fusion results from two monsters
- `/api/battle` - Generate dramatic battle scenarios

## License

MIT
