# Chess with Benefits - Client

A modern chess platform that combines traditional chess gameplay with real-time video calls, AI-powered commentary, voice commands, and comprehensive game analytics. Built with React and Vite for a fast and responsive user experience.

## Features

- Real-time multiplayer chess with instant move synchronization
- Integrated video calling for face-to-face gameplay
- AI commentary system with three distinct modes:
  - Roast Mode: Humorous and witty commentary
  - Hype Mode: Enthusiastic and encouraging feedback
  - Beginner Mode: Educational explanations and strategy tips
- Voice command support for hands-free chess moves
- Live chat messaging during matches
- Move analysis powered by Stockfish engine
- Comprehensive dashboard with statistics and match history
- Responsive design with smooth animations
- Modern UI with Tailwind CSS styling

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 18 |
| Build Tool | Vite |
| Routing | React Router DOM |
| Styling | Tailwind CSS |
| Chess Logic | Chess.js |
| Chess Board | React Chessboard |
| Real-time Communication | Socket.io Client |
| Animations | Framer Motion |
| Charts | Recharts |
| HTTP Client | Axios |
| Voice Recognition | Web Speech API, Mic Recorder |
| UI Components | Lucide React (icons) |
| Celebrations | React Confetti |
| Notifications | React Toastify |

## Installation

1. Clone the repository:

```bash
git clone https://github.com/AkshatGarg952/ChesswithBenefits-Client
cd ChesswithBenefits-Client
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory based on `.env.example`:

```env
# Server Configuration
VITE_SERVER_URL=http://localhost:3000
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
ChesswithBenefits-Client/
├── src/
│   ├── components/
│   │   ├── AICommentary.jsx
│   │   ├── AuthModal.jsx
│   │   ├── CallToAction.jsx
│   │   ├── Chat.jsx
│   │   ├── ChessBoard.jsx
│   │   ├── ChessGame.jsx
│   │   ├── Features.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── MobilePanel.jsx
│   │   ├── MoveAnalysis.jsx
│   │   ├── MoveHistory.jsx
│   │   ├── Navbar.jsx
│   │   ├── Testimonials.jsx
│   │   └── VideoCall.jsx
│   ├── hooks/
│   ├── socket/
│   ├── storage/
│   ├── utils/
│   ├── App.jsx
│   ├── Authcontext.jsx
│   ├── Dashboard.jsx
│   ├── LandPage2.jsx
│   ├── index.css
│   └── main.jsx
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Key Components

### ChessBoard
Interactive chess board with drag-and-drop functionality, move validation, legal move highlighting, and piece animations.

### ChessGame
Main game component managing game state, player connections, move handling, and real-time synchronization.

### AICommentary
Real-time AI commentary system that analyzes moves and provides contextual feedback based on selected mode (Roast, Hype, or Beginner).

### VideoCall
WebRTC-based video calling component enabling face-to-face gameplay between opponents.

### Dashboard
Comprehensive analytics dashboard displaying:
- Total matches played
- Win, loss, and draw statistics
- Move accuracy metrics
- Match history
- Performance trends
- Time management analysis

### MoveAnalysis
Displays detailed analysis of chess moves including quality assessment, evaluation scores, and strategic insights.

### Chat
Real-time messaging component for communication between players during matches.

## Voice Commands

The application supports natural language voice commands for chess moves:

- Standard notation: "Knight to E4"
- Castle moves: "Castle kingside" or "Castle queenside"
- Pawn moves: "Pawn to D4"
- Captures: "Bishop takes E5"

## Environment Configuration

The client connects to the backend server using the URL specified in the `VITE_SERVER_URL` environment variable. Make sure this matches your server configuration.

## Build and Deployment

To build the application for production:

```bash
npm run build
```

The build output will be in the `dist` directory, ready for deployment to any static hosting service.

## Browser Compatibility

The application works best on modern browsers with WebRTC and Web Speech API support:
- Chrome (recommended)
- Firefox
- Edge
- Safari (limited voice command support)

## Related Repositories

- Backend Server: [ChesswithBenefits-Server](https://github.com/AkshatGarg952/ChesswithBenefits-Server)

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

- GitHub: [@AkshatGarg952](https://github.com/AkshatGarg952)
- Email: gargakshat952@gmail.com
