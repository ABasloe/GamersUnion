import { Link } from 'react-router-dom';
import type { Game } from '../types';
import { GameCover } from './GameCover';
import { useApp } from '../store/AppContext';
import { STATUS_LABELS } from './statusMeta';

export function GameCard({ game }: { game: Game }) {
  const { library } = useApp();
  const entry = library.find((e) => e.gameId === game.id);
  return (
    <Link to={`/game/${game.id}`} className="game-card">
      <GameCover game={game} />
      <div className="game-card-body">
        <div className="game-card-title">{game.title}</div>
        <div className="game-card-meta">
          {game.year} · ⭐ {game.communityRating.toFixed(1)}
        </div>
        {entry && <span className={`status-pill status-${entry.status}`}>{STATUS_LABELS[entry.status]}</span>}
      </div>
    </Link>
  );
}
