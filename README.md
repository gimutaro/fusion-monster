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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Enter your Anthropic API key** on the start screen to begin playing.

## API Key

This game requires an Anthropic API key to generate monsters and battle scenarios.

- Get your API key from [Anthropic Console](https://console.anthropic.com/)
- Enter your key on the game's start screen
- Your key is stored locally in your browser (localStorage) and is never sent to any server other than Anthropic's API

## How to Play

1. **Enter API Key**: Input your Anthropic API key on the start screen
2. **Generate Monsters**: Click the generate button and describe a monster (e.g., "Fire Dragon", "Ice Golem")
3. **Select for Fusion**: Click on two monsters to select them for fusion
4. **Fuse**: Click the FUSION button to combine them into a new creature
5. **Battle**: Select party members and start the battle against the stage boss
6. **Progress**: Defeat bosses to unlock new stages and Super Fusion

## API Routes

The game uses the following API endpoints powered by Claude:

- `/api/generate` - Generate new monster stats and 3D models
- `/api/fusion` - Create fusion results from two monsters
- `/api/battle` - Generate dramatic battle scenarios

## License

MIT
