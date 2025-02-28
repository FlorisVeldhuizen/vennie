# Vennie

Vennie is a furniture matching app designed to help couples with different tastes find furniture they both love. Swipe right on furniture you like, and discover your matches!

## Features

- User authentication with Supabase
- Swipe interface for furniture browsing with smooth animations
- Keyboard navigation support (arrow keys)
- Matching system to find common preferences
- Gallery view of matched items with detailed view
- Responsive design for all devices
- Dark mode support

## Tech Stack

- React + TypeScript
- Vite for fast builds and development
- pnpm for efficient package management
- Tailwind CSS for styling
- Framer Motion for animations and gestures
- Zustand for state management
- Supabase for authentication

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- pnpm (v7 or later)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/vennie.git
   cd vennie
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env`
   - Update with your Supabase credentials

4. Start the development server
   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:5174`

## Development

### Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview the production build
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

## Authentication

The app uses Supabase for authentication. To test the app:

1. Create an account using the registration form
2. Sign in with your credentials
3. Both users need to be authenticated to create matches

## License

MIT

## Acknowledgments

- Inspired by the challenges of finding furniture that both partners love
- Built with ❤️ for couples everywhere
