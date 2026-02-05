# Packlite

A modern web application for hikers and trekkers to manage gear, optimize pack weight, and create trip packing lists.

## Features

- **Gear Management**: Track your outdoor gear with details like weight, category, and photos
- **Food/Pantry**: Manage food items with calorie tracking and expiration dates
- **Trip Planning**: Create packing lists for specific trips with weight optimization
- **Weight Tracking**: Separate tracking for gear and food with category-based visualizations
- **Social Sharing**: Share your packing lists publicly or with friends
- **Authentication**: Secure user accounts with NextAuth.js

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
- Docker and Docker Compose (recommended) OR MongoDB installed locally
- AWS S3 bucket (optional, for image storage)

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

   Edit `.env.local` with your actual values. For MongoDB, you have three options:

   - **Option 1 (Recommended)**: Use Docker Compose (see below)
   - **Option 2**: Use local MongoDB without authentication
   - **Option 3**: Use MongoDB Atlas cloud (get connection string from Atlas)

4. Start MongoDB with Docker Compose (recommended):

   ```bash
   docker-compose up -d
   ```

   This will start:

   - MongoDB on `localhost:27017` (with authentication)
   - Mongo Express (web UI) on `http://localhost:8081`
     - Username: `admin`
     - Password: `admin123`

   To stop the containers:

   ```bash
   docker-compose down
   ```

   To stop and remove all data:

   ```bash
   docker-compose down -v
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Docker Services

The included `docker-compose.yml` provides:

- **MongoDB 7.0**: Database server with persistent volumes and health checks
- **Mongo Express**: Web-based MongoDB admin interface at http://localhost:8081

### MongoDB Credentials

- **Admin Username**: `packlite_admin`
- **Admin Password**: `packlite_password`
- **Database**: `packlite`

These credentials are set in `docker-compose.yml` and match the `DATABASE_URL` in `.env.local`.

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── api/          # API routes (auth, gear, trips, etc.)
│   └── auth/         # Authentication pages
├── components/       # Shared UI components (atomic design)
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── providers/
├── features/         # Feature modules
│   ├── auth/         # Authentication components
│   ├── gear/
│   ├── trips/
│   └── pantry/
├── hooks/            # Custom React hooks
├── lib/              # Utilities, models, and configuration
├── styles/           # Global styles
└── types/            # TypeScript type definitions
```

## Development Guide

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed development conventions and guidelines.

## Environment Variables

Key environment variables (see `.env.example` for all options):

- `DATABASE_URL` - MongoDB connection string
- `NEXTAUTH_URL` - Application URL (http://localhost:3000 in dev)
- `NEXTAUTH_SECRET` - Secret for JWT signing (generate with `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL` - Public-facing URL for sharing features

## License

MIT
