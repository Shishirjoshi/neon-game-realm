import teenpatti from "@/assets/game-teenpatti.jpg";
import typing from "@/assets/game-typing.jpg";
import fps from "@/assets/game-fps.jpg";
import racing from "@/assets/game-racing.jpg";
import arcade from "@/assets/game-arcade.jpg";
import chess from "@/assets/game-chess.jpg";
import type { Game } from "@/components/GameCard";

export const CATEGORIES = ["All", "Cards", "Typing", "FPS", "Racing", "Casual", "Strategy"] as const;
export type Category = (typeof CATEGORIES)[number];

export const GAMES: Game[] = [
  {
    id: "teen-patti",
    title: "Teen Patti Royale",
    category: "Cards",
    players: 4231,
    thumbnail: teenpatti,
    description: "The classic 3-card showdown. Bluff, raise, and take the pot.",
    href: "/lobby/teen-patti",
    hot: true,
  },
  {
    id: "typing-race",
    title: "Type Storm",
    category: "Typing",
    players: 1842,
    thumbnail: typing,
    description: "Race against rivals. Fastest fingers take the crown.",
    href: "/lobby/typing",
    hot: true,
  },
  {
    id: "neon-strike",
    title: "Neon Strike",
    category: "FPS",
    players: 8910,
    thumbnail: fps,
    description: "Tactical browser shooter. Drop in, lock on, light up.",
    href: "/lobby/neon-strike",
  },
  {
    id: "velocity-rush",
    title: "Velocity Rush",
    category: "Racing",
    players: 3502,
    thumbnail: racing,
    description: "High-octane night drifts on neon-lit circuits.",
    href: "/lobby/velocity-rush",
  },
  {
    id: "block-blast",
    title: "Block Blast",
    category: "Casual",
    players: 2188,
    thumbnail: arcade,
    description: "Smash neon bricks with a glowing ball. Pure arcade joy.",
    href: "/lobby/block-blast",
  },
  {
    id: "glass-chess",
    title: "Glass Chess",
    category: "Strategy",
    players: 1175,
    thumbnail: chess,
    description: "Classic chess on a holographic board. Online ranked.",
    href: "/lobby/glass-chess",
  },
];
