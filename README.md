# Tambola Game

A full-stack multiplayer Tambola (Housie/Bingo) game web application. This project allows users to create rooms, join games, play Tambola in real-time, and claim prizes interactively. Built with a React + Vite frontend and a Node.js/Express + MongoDB backend, it supports authentication, game management, and real-time updates via sockets.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Game Rules & Prizes](#game-rules--prizes)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Authentication**: Sign up and login flow for players.
- **Room Creation & Joining**: Host or join Tambola rooms.
- **Real-Time Gameplay**: Numbers called and ticket marking update live via sockets.
- **Prize Claiming**: Claim patterns (Early Five, Rows, Corners, Full House) interactively.
- **Host Controls**: Manage game start, number calling, and verify claims.
- **Responsive UI**: Modern design using React and Tailwind CSS.
- **Backend API**: RESTful endpoints for game management, user auth, etc.

---

## Tech Stack

- **Frontend**: React, Vite, React Router, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Real-Time**: Socket.io
- **Authentication**: JWT based
- **Linting**: ESLint, with recommended configs for React and Vite

---

## Folder Structure

```
tambola-game/
├── Backend/                   # Node.js Express backend
│   ├── config/                # DB config (MongoDB)
│   ├── controllers/           # Game logic (gameController.js)
│   ├── models/                # Mongoose models (game.js)
│   ├── routes/                # API routes (game.js)
│   └── ...                    # Other backend files
├── Frontend/
│   └── tambola-frontend/      # React frontend
│       ├── public/
│       ├── src/
│       │   ├── components/    # React components (Login, SignUp, PrizeButton, etc.)
│       │   ├── pages/         # Main pages (Dashboard, TambolaRoom)
│       │   ├── context/       # Context providers (Auth)
│       │   ├── services/      # API service
│       │   ├── App.jsx        # Main app component
│       │   ├── main.jsx       # Entry point
│       │   └── ...            # Other frontend files
│       ├── index.html         # Main HTML
│       ├── README.md          # Frontend README (Vite/React template)
│       └── eslint.config.js   # ESLint config
└── ...
```

---

## Game Rules & Prizes

- Mark numbers on your ticket as they are called.
- Prizes can be claimed by clicking the relevant button:
  - **Early Five**: First 5 numbers marked.
  - **Top Row**: Complete the top row.
  - **Middle Row**: Complete the middle row.
  - **Bottom Row**: Complete the bottom row.
  - **All Corners**: All four corner numbers marked.
  - **Full House**: All numbers marked.
- Each claimed pattern gives **100 points**.
- Claims are verified by the host before confirming the win.
- Prizes must be claimed manually; unclaimed patterns don’t grant points.

---

## Setup & Installation

### Backend

1. `cd Backend`
2. Install dependencies: `npm install`
3. Set up `.env` with your MongoDB URI:
    ```
    MONGO_URI=your_mongo_connection_string
    JWT_SECRET=your_jwt_secret
    ```
4. Start server: `npm run start`

### Frontend

1. `cd Frontend/tambola-frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Access app at `http://localhost:5173`

---

## Usage

1. **Sign Up or Login**
2. **Create a Room** (as host) or **Join a Room** (via room code)
3. **Mark Numbers** as they are called
4. **Claim Prizes** when patterns are completed
5. **Host Verifies** claims and awards points

---

## Contributing

Contributions, issues, and feature requests are welcome! Please open a pull request or issue.

---

## License

[MIT](LICENSE)

---

**Maintainer:** [natin-kumar](https://github.com/natin-kumar)