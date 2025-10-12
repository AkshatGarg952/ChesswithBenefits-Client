# Chess with Benefits - Frontend

Chess with Benefits is an innovative chess platform that transforms traditional chess gameplay into an immersive, interactive experience. Featuring real-time video calls, AI-powered commentary, voice commands, and comprehensive game analytics—all while maintaining the classic chess experience.

## Features

* **Video Call Integration**: Play chess face-to-face with opponents through integrated WebRTC video calling for a more personal gaming experience.
* **AI Commentary Modes**: Choose from three unique commentary styles:
  * **Roast Mode**: Humorous, witty commentary that playfully critiques your moves
  * **Hype Mode**: Energetic, encouraging commentary that celebrates every play
  * **Beginner Mode**: Educational commentary explaining strategies and techniques
* **Voice Commands**: Move pieces hands-free using natural voice commands for an accessible gaming experience.
* **Real-time Chat**: Communicate with your opponent through instant messaging during matches.
* **Move Analysis**: Powered by Stockfish engine to analyze and categorize every move with professional-grade insights.
* **Comprehensive Dashboard**: Track your progress with detailed statistics, match history, and performance metrics across all games.
* **Real-time Gameplay**: Seamless synchronization ensures smooth, lag-free chess matches.

## Demo

* Live Website: [Chess with Benefits](https://your-frontend-url.com)
* Demo Video: [Watch Demo](your-demo-video-link)

## Installation

To run Chess with Benefits frontend locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/AkshatGarg952/ChesswithBenefits-Client
cd ChesswithBenefits-Client
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set Up Environment Variables

Create a `.env.local` file in the root directory using the provided `.env.example`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_WEBRTC_SIGNALING_URL=http://localhost:8000
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Tech Stack

| Component | Tools & Technologies |
|-----------|---------------------|
| **Frontend Framework** | Next.js, React, TypeScript |
| **Chess Logic** | Chess.js |
| **Video Calling** | WebRTC, Socket.io |
| **Voice Recognition** | Web Speech API |
| **Styling** | Tailwind CSS / Material-UI |
| **State Management** | Redux / Zustand |
| **Real-time Communication** | Socket.io Client |
| **Deployment** | Vercel |

## Project Structure

```
ChesswithBenefits-Client/
├── src/
│   ├── components/
│   │   ├── Chess/
│   │   ├── VideoCall/
│   │   ├── Commentary/
│   │   ├── Chat/
│   │   └── Dashboard/
│   ├── hooks/
│   ├── utils/
│   ├── context/
│   └── pages/
├── public/
└── package.json
```

## Key Features Implementation

### Chess Board
Custom chess board implementation with drag-and-drop functionality, move validation, and visual indicators for legal moves.

### Commentary System
Real-time AI commentary that analyzes each move and provides contextual feedback based on the selected mode (Roast, Hype, or Beginner).

### Voice Commands
Natural language processing for chess move commands like "Knight to E4" or "Castle kingside" using the Web Speech API.

### Dashboard Analytics
Comprehensive statistics dashboard displaying:
- Total matches played
- Win/Loss/Draw ratios
- Move accuracy percentages
- Opening repertoire analysis
- Time management statistics

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Related Repositories

* Backend Server: [ChesswithBenefits-Server](https://github.com/AkshatGarg952/ChesswithBenefits-Server)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or suggestions, feel free to reach out:

* GitHub: [@AkshatGarg952](https://github.com/AkshatGarg952)
* Email: your-email@example.com

---

Built with ♟️ by passionate chess enthusiasts
