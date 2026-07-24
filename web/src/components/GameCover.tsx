import type { Game } from '../types';

export function GameCover({ game, size = 'md' }: { game: Game; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div
      className={`cover cover-${size}`}
      style={{ background: `linear-gradient(160deg, ${game.cover.from}, ${game.cover.to})` }}
      aria-label={`${game.title} cover art`}
    >
      <span className="cover-emoji">{game.cover.emoji}</span>
      <span className="cover-title">{game.title}</span>
    </div>
  );
}
