# ft_transcendence

A full-stack real-time multiplayer gaming platform built with modern web technologies. Play classic games like Ping Pong and Tic-Tac-Toe, join tournaments, compete on leaderboards, and connect with other players.

## Key Features

- **Multiplayer Gaming**: Real-time Ping Pong and Tic-Tac-Toe matches with live opponent connections
- **Tournament Mode**: Bracket-based tournament system with multiple player support
- **User Accounts**: Secure authentication with JWT, OAuth (Google, Intra), and 2FA
- **Leaderboards**: Track player rankings and statistics
- **User Profiles**: Customizable profiles with avatars and game history
- **Real-Time Communication**: Socket.io-powered live gameplay and instant notifications
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Multi-Language Support**: Internationalization ready with next-intl
- **Security**: Rate limiting, CORS protection, helmet security headers, bcrypt password hashing

## Tech Stack

### Frontend
- **Next.js 16** - React meta-framework with App Router
- **React 19** - Latest React with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Socket.io Client** - Real-time communication
- **Zustand** - State management
- **Zod** - Schema validation
- **React Toastify** - Toast notifications
- **Recharts** - Data visualization
- **SWR** - Data fetching with caching

### Backend
- **Fastify 5** - High-performance HTTP framework
- **TypeScript** - Type-safe server code
- **Socket.io** - Real-time server events
- **SQLite 3** - Embedded database
- **Redis** - Caching and session management
- **JWT** - Secure authentication tokens
- **Bcrypt** - Password hashing
- **Nodemailer** - Email delivery (password reset)
- **OTPLib** - 2FA TOTP implementation
- **Appwrite** - Optional backend-as-a-service integration

### Infrastructure
- **Docker & Docker Compose** - Containerization and orchestration
- **Nginx** - Reverse proxy and SSL termination
- **pnpm** - Fast package manager

## Prerequisites

- **Node.js**: 18+ (for development)
- **Docker** & **Docker Compose**: 3.8+
- **pnpm**: Latest version

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/anass-hajjaji/ft_transcendence.git
   cd ft_transcendence
   ```
2.  **Configure environment variables**


    ```bash
    # Copy and update backend environment
    cp back_end/.env.example back_end/.env

    # Copy and update frontend environment
    cp frontend/.env.example frontend/.env

    # Copy and update nginx environment
    cp nginx/.env.example nginx/.env

    ```

3.  **Start all services**


    ```bash
    docker-compose up --build

    ```

    Services will be available at:

    -   Frontend: [https://localhost:8443](https://localhost:8443/)
    -   Backend API: <https://localhost:8443/api>
    -   Direct Frontend: [http://localhost:3000](http://localhost:3000/) (during development)
    -   Direct Backend: [http://localhost:4000](http://localhost:4000/) (during development)

Environment Variables Setup
----------------------------

This project uses multiple `.env` files for different services. You need to create them manually before running the project.

### 1. Nginx (`nginx/.env`)

Create the file:

```bash
touch nginx/.env
```

Add:

```
DOMAIN_NAME=localhost
```

* * * * *

###  2. Frontend (`frontend/.env`)

Create the file:

```bash
touch frontend/.env
```

Add:

```
NEXT_PUBLIC_API_URL=https://localhost:8443/api
NEXT_PUBLIC_SITE_URL=https://localhost:8443
NEXT_PUBLIC_INTRA_CLIENT_ID=your_intra_client_id
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_REDIRECT_URI_42=https://api.intra.42.fr/oauth/authorize?client_id=your_intra_client_id
```

* * * * *

###  3. Backend (`back_end/.env`)

Create the file:

```bash
touch back_end/.env
```

Add:

```
NODE_ENV=development
PORT=4000
LOG_LEVEL=info

FRONTEND_URL=https://localhost:8443
REDIRECT_URI_42=https://localhost:8443/auth-intra

JWT_SECRET=your_jwt_secret
JWT_EXPIRES=1h
JWT_REFRESH=7d
JWT_REFRESH_SECRET=your_refresh_secret
COOKIE_SECRET=your_cookie_secret

REDIS_HOST=redis
REDIS_PORT=6379

MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_email_password

FT_API_TOKEN_URL=https://api.intra.42.fr/oauth/token
FT_API_ME_URL=https://api.intra.42.fr/v2/me
CLIENT_ID_42=your_42_client_id

DATABASE_URL=/app/data/database.dbNODE_ENV=development
PORT=4000
LOG_LEVEL=info

FRONTEND_URL=https://localhost:8443
REDIRECT_URI_42=https://localhost:8443/auth-intra

JWT_SECRET=your_jwt_secret
JWT_EXPIRES=1h
JWT_REFRESH=7d
JWT_REFRESH_SECRET=your_refresh_secret
COOKIE_SECRET=your_cookie_secret

REDIS_HOST=redis
REDIS_PORT=6379

MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_email_password

FT_API_TOKEN_URL=https://api.intra.42.fr/oauth/token
FT_API_ME_URL=https://api.intra.42.fr/v2/me
CLIENT_ID_42=your_42_client_id

DATABASE_URL=/app/data/database.db
```

Project Structure
-----------------

```
ft_transcendence/
├── backend/                          # Fastify API server
│   ├── src/
│   │   ├── main.ts                  # Server entry point
│   │   ├── db.ts                    # Database initialization
│   │   ├── socket.ts                # Socket.io setup
│   │   ├── routes/                  # API routes
│   │   └── ...
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                         # Next.js application
│   ├── app/                         # App Router
│   │   ├── (public)/                # Unauthenticated routes
│   │   ├── (private)/               # Protected routes
│   │   └── _hooks/                  # Custom React hooks
│   ├── components/                  # Reusable components
│   ├── lib/                         # Utilities and helpers
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── nginx/                           # Reverse proxy configuration
│   ├── Dockerfile
│   ├── default.conf
│   └── .env
├── docker-compose.yml               # Docker services orchestration
└── README.md
```
🎮 How to Play
--------------

### Ping Pong

1.  Navigate to Ping Pong from the main menu
2.  Choose Local Game to play against AI, or Online Game to challenge other players
3.  Use arrow keys or W/S to move your paddle
4.  First to reach the score limit wins

### Tic-Tac-Toe

1.  Select Tic-Tac-Toe from the games menu
2.  Play against AI or another player
3.  Click cells to place your mark
4.  Get three in a row to win

### Tournaments

1.  Go to Tournaments
2.  Create a new tournament and invite players
3.  Each round is automatically scheduled
4.  Winners advance to the next bracket level
5.  Champion is crowned after all rounds complete

🔐 Authentication
-----------------

### Standard Authentication

-   Email and password registration/login
-   Password recovery via email link
-   Refresh token for persistent sessions

### Two-Factor Authentication (2FA)

-   Optional TOTP-based 2FA setup
-   QR code generation for authenticator apps
-   Fallback codes for account recovery

### OAuth Integration

-   Google Sign-In for quick registration
-   Intra (42 School) authentication for educational institutions

⏱️ Real-Time Features
------------------

Socket.io powers real-time features including:

-   Live Game Updates: Paddle position, ball movement, scores
-   Player Status: Online/offline indicators
-   Notifications: Friend requests, game invitations, tournament updates
-   Chat: Direct messaging between players
-   Leaderboard: Live ranking updates

📊 Performance Considerations
-----------------------------

-   Redis Caching: User data, game results, leaderboards cached for fast retrieval
-   Rate Limiting: 100 requests per minute per IP to prevent abuse
-   Image Optimization: Avatar uploads limited to 5MB
-   Database Indexing: Optimized queries for common operations
-   Static Asset Caching: Nginx caches static frontend assets

🔒 Security Features
--------------------

-   HTTPS: All connections encrypted with SSL/TLS via Nginx
-   JWT Tokens: Secure stateless authentication
-   CORS Protection: Cross-origin requests validated
-   Helmet: Security headers for XSS, clickjacking protection
-   Rate Limiting: Prevents brute force attacks
-   Password Hashing: bcrypt with salt rounds for secure storage
-   Cookie Security: Secure, HttpOnly, SameSite flags set
-   Input Validation: Zod schema validation on all endpoints
