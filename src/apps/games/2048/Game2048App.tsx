import { RotateCcw } from "lucide-react";
import { useState } from "react";
import AppFrame from "../../../ui/AppFrame";
import { GameOverlay, Stat, useArrowKeys, useRecord, useSwipe, type Dir } from "../shared";
import { addTile, canMove, GOAL, move, newBoard, type Board } from "./game2048";
import "./game2048.css";

type Game = {
  board: Board;
  score: number;
  /** Bumped every move, so the pop animation of new/merged tiles replays. */
  turn: number;
  fresh: number[];
  merged: number[];
  /** Reached 2048 and chose to keep going. */
  keepPlaying: boolean;
};

const start = (): Game => ({ ...newBoard(), score: 0, turn: 0, merged: [], keepPlaying: false });

/** 2048: swipe (or use the arrow keys) to slide the tiles; equal tiles merge. Logic in game2048.ts. */
export default function Game2048App() {
  const [game, setGame] = useState(start);
  const best = useRecord("2048", game.score);

  const won = !game.keepPlaying && game.board.includes(GOAL);
  const over = !canMove(game.board);

  const play = (dir: Dir) => {
    if (won || over) return;
    setGame((g) => {
      const r = move(g.board, dir);
      if (!r.moved) return g;
      const added = addTile(r.board)!; // a move always frees at least one cell
      return { ...g, board: added.board, score: g.score + r.gained, turn: g.turn + 1, fresh: [added.index], merged: r.merged };
    });
  };
  useArrowKeys(play);
  const swipe = useSwipe(play);

  return (
    <AppFrame title="2048">
      <div className="game-bar">
        <Stat label="Score" value={game.score} />
        <Stat label="Best" value={best ?? 0} />
        <button type="button" className="ui-button ui-button--soft" onClick={() => setGame(start())}>
          <RotateCcw aria-hidden /> New
        </button>
      </div>

      <div className="game-board g2048" {...swipe} role="group" aria-label="2048 board">
        {game.board.map((v, i) => {
          const anim = game.fresh.includes(i) ? " is-new" : game.merged.includes(i) ? " is-merged" : "";
          return (
            <div className="g2048__cell" key={i}>
              {v > 0 && (
                <span key={anim ? game.turn : undefined} className={`g2048__tile${anim}`} data-v={Math.min(v, 4096)} data-digits={String(v).length}>
                  {v}
                </span>
              )}
            </div>
          );
        })}

        {won && (
          <GameOverlay title="You made 2048!" text="Keep going for a bigger tile, or start over.">
            <button type="button" className="ui-button" onClick={() => setGame((g) => ({ ...g, keepPlaying: true }))}>
              Keep going
            </button>
          </GameOverlay>
        )}
        {over && (
          <GameOverlay title="No moves left" text={`You scored ${game.score}.`}>
            <button type="button" className="ui-button" onClick={() => setGame(start())}>
              Try again
            </button>
          </GameOverlay>
        )}
      </div>
      <p className="game-help">Swipe or use the arrow keys. Tiles with the same number merge.</p>
    </AppFrame>
  );
}
