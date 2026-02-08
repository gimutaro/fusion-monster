# Fusion Monsters

A 3D monster fusion battle game built with Next.js, Three.js, and the Anthropic Claude API.

## Features

- Generate unique monsters using AI
- Fuse two monsters together to create powerful new creatures
- Battle bosses with anime-style combat effects
- Progress through stages with increasingly challenging bosses
- Dice-based Super Fusion (unlocked after clearing Stage 1)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **3D Graphics**: Three.js
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm / bun
- Anthropic API key (get one from [Anthropic Console](https://console.anthropic.com/))

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

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Enter your **Anthropic API key** on the start screen to begin playing

## API Key

- You will be prompted to enter your API key on the start screen
- No environment variable configuration is required
- Your key is stored in the browser's localStorage and is never sent to any server other than Anthropic's API

## How to Play

1. **Enter API Key** - Input your Anthropic API key on the start screen
2. **Generate Monsters** - Create monsters using the generate button (e.g., "Fire Dragon", "Ice Golem")
3. **Select for Fusion** - Click two monsters to select them
4. **Fuse** - Press the FUSION button to combine them
5. **Battle** - Choose party members and fight the stage boss
6. **Progress** - Defeat bosses to unlock new stages and Super Fusion
