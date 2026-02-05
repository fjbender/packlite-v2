# Packlite

A modern web application for hikers and trekkers to manage gear, optimize pack weight, and create trip packing lists.

## Features

- **Gear Management**: Track your outdoor gear with details like weight, category, and photos
- **Food/Pantry**: Manage food items with calorie tracking and expiration dates
- **Trip Planning**: Create packing lists for specific trips with weight optimization
- **Weight Tracking**: Separate tracking for gear and food with category-based visualizations
- **Social Sharing**: Share your packing lists publicly or with friends

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **State Management**: React Query + Context API
- **Forms**: React Hook Form + Zod
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- AWS S3 bucket (for image storage)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd packlite-v2
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your actual values.

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # Shared UI components (atomic design)
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── features/         # Feature modules
│   ├── gear/
│   ├── trips/
│   ├── pantry/
│   └── auth/
├── hooks/            # Custom React hooks
├── lib/              # Utilities and configuration
├── styles/           # Global styles
└── types/            # TypeScript type definitions
```

## Development Guide

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed development conventions and guidelines.

## License

MIT
