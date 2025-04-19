# MonkeCasino

An online casino platform featuring multiple games, AI-driven opponents, and secure, scalable backend services.

## Overview

MonkeCasino is a full-stack web application offering:

- **Roulette**
- **Slots**
- **Blackjack** (with bot opponent)
- **Poker** (multi-player and bot)

The platform focuses on robust security, real-time interactions, modular architecture, and engaging user experience.

## Architecture & Technologies

| Component            | Language / Framework          | Responsibilities                                                      |
|----------------------|-------------------------------|-----------------------------------------------------------------------|
| **Express Backend**  | Node.js & Express.js          | User management, authentication, session state                        |
| **Rust Service**     | Rust                          | Blackjack game logic and AI bot engine                                |
| **Zig Service**      | Zig                           | Roulette, Slots, and Poker game logic and bots                        |
| **Frontend**         | React 18 + Vite               | Responsive UI/UX, React Router, React Hook Form, React Toastify, ESLint, JWT handling |
| **Database**         | MongoDB                       | User accounts, balances, game records                                 |
| **Real-time Layer**  | WebSockets (Socket.IO)        | Multi-player poker sessions and live updates                          |

## Frontend & User Experience

- Built with **React** (v18) and **Vite** for fast development, HMR, and optimized builds.
- **UI Components & Libraries**: `react-custom-roulette` for dynamic roulette visuals, `react-icons` for iconography, `react-toastify` for toast notifications.
- **Form Handling & Validation**: `react-hook-form` with `Yup` and `@hookform/resolvers` for robust user input management.
- **Client-side Routing**: `react-router-dom` for seamless navigation between game pages and user dashboard.
- **Design & Accessibility**: Modern, clean layouts, responsive breakpoints, and ARIA attributes to ensure intuitive and accessible gameplay.
- **Gamification**: Players accumulate experience points (XP) and level up by engaging with games. Level progression unlocks exclusive avatars—refer to `public/profile_pictures.json` and the `public/profile_pictures` folder for available avatars.

## Game Modules

### Roulette, Slots & Poker (Zig Service)

- **Roulette**: Comprehensive betting table with configurable odds.
- **Slots**: Multiple reel configurations with dynamic payout logic.
- **Poker**: Texas Hold’em implementation supporting multiple human and AI players via sockets.

### Blackjack (Rust Service)

- Solo play against a Rust-based AI bot employing basic strategy and card-counting heuristics for higher difficulty levels.

## Security

- **Account Integrity**: All transactions and balance updates are validated server-side to prevent client manipulation.
- **Authentication & Sessions**: Secure login with JWT tokens, hashed credentials, and Express middleware enforcement.
- **Input Sanitization**: Server-side validation in Express, plus strong typing in Rust and Zig layers to mitigate injection and overflow risks.
- **Encrypted Channels**: All HTTP and WebSocket communication secured via HTTPS/WSS protocols.

## Real-time Multiplayer Poker

- Utilizes **Socket.IO** for event-driven, bidirectional communication.
- Supports dynamic lobby creation, player joins/leaves, and real-time game state synchronization.

## Deployment

Each microservice can be deployed independently:

1. **Express Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```
2. **Rust Service**
   ```bash
   cd backend/rust
   cargo build --release
   ./target/release/blackjack_service
   ```
3. **Zig Service**
   ```bash
   cd backend/zig
   zig build
   ./zig-out/bin/zig_casino_service
   ```
4. **MongoDB**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```
5. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Configure environment variables via the provided `.env.example` file to point each service to the correct endpoints.

## Contributing

Contributions to enhance game logic, UI/UX, and security are welcome. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/YourFeature`)
3. Commit your changes (`git commit -m "Add YourFeature"`)
4. Push to the branch (`git push origin feat/YourFeature`)
5. Open a pull request