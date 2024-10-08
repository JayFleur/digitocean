import React, { useState, useEffect } from 'react';
import { Hexagon } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import PlayerForm from './components/PlayerForm';
import WaitingRoom from './components/WaitingRoom';
import BanPhase from './components/BanPhase';
import Results from './components/Results';

type GameState = 'player1Submit' | 'player2Submit' | 'bothBan' | 'results';
type PlayerDecks = [string, string, string];

interface GameData {
  state: GameState;
  player1Decks: PlayerDecks;
  player2Decks: PlayerDecks;
  player1BannedDeck: string;
  player2BannedDeck: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameData, setGameData] = useState<GameData>({
    state: 'player1Submit',
    player1Decks: ['', '', ''],
    player2Decks: ['', '', ''],
    player1BannedDeck: '',
    player2BannedDeck: '',
  });
  const [gameId, setGameId] = useState<string>('');
  const [isPlayer2, setIsPlayer2] = useState<boolean>(false);

  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket'],
      upgrade: false
    });
    setSocket(newSocket);

    const params = new URLSearchParams(window.location.search);
    const id = params.get('gameId');

    if (id) {
      setGameId(id);
      setIsPlayer2(true);
      newSocket.emit('joinGame', id);
    } else {
      newSocket.emit('createGame');
    }

    newSocket.on('gameCreated', (id: string) => {
      setGameId(id);
    });

    newSocket.on('updateGameState', (newGameData: GameData) => {
      setGameData(newGameData);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // ... rest of the component remains the same
};

export default App;