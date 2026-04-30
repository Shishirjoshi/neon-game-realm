import teenpatti from "@/assets/game-teenpatti.jpg";
import typing from "@/assets/game-typing.jpg";
import chess from "@/assets/game-chess.jpg";
import type { Game } from "@/components/GameCard";

export const CATEGORIES = ["All", "Cards", "Typing", "Strategy"] as const;
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
    id: "glass-chess",
    title: "Glass Chess",
    category: "Strategy",
    players: 1175,
    thumbnail: chess,
    description: "Classic chess on a holographic board. Online ranked.",
    href: "/lobby/glass-chess",
  },
];
