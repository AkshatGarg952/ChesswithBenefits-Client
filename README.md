# Chess With Benefits — Client

Live demo: https://chesswith-benefits-client.vercel.app/  
Repo: https://github.com/AkshatGarg952/ChesswithBenefits-Client. :contentReference[oaicite:1]{index=1}

## Overview
**Chess With Benefits** is a real-time multiplayer chess client built with React and Tailwind CSS. It connects to an Express/MongoDB backend (Stockfish + OpenAI powered) to provide features such as:

- Private rooms & real-time gameplay
- Video calls via WebRTC
- Live chat and audio (voice) mode (voice commands to move pieces)
- AI-driven commentary in 3 modes: **Hype**, **Roast**, **Beginner**
- Live move analysis & interactive dashboard (move classification)
- JWT-authenticated routes and secure game sessions

This repository contains the frontend client for the platform.

## Tech stack
- React (Vite)
- Tailwind CSS
- WebRTC (video calls)
- WebSockets (socket.io recommended)
- Web Speech API (voice commands) / client-side audio handler
- Axios / fetch for API calls
- JWT for auth token handling in the client

## Requirements
- Node.js >= 18
- npm or yarn
- Backend server URL (see `.env`)

## Quick start

1. Clone the repo
```bash
git clone https://github.com/AkshatGarg952/ChesswithBenefits-Client.git
cd ChesswithBenefits-Client

2. Install dependencies
npm install
# or
yarn

3. Environment variables
VITE_API_BASE_URL=https://your-backend.example.com
VITE_SOCKET_URL=wss://your-backend.example.com
VITE_OPENAI_KEY= # OPTIONAL if client directly uses any OpenAI features (recommended: keep OpenAI calls server-side)
VITE_VERCEL=1 # optional flags

4. Run (development)
npm run dev
# or
yarn dev

5. Build (production)
npm run build
# or
yarn build
