# Gamehub — Premium Gaming Platform UI

A dark, neon-accented gaming hub with a polished homepage, multiplayer lobby, Teen Patti card table, and competitive Typing race — all wired to real-time multiplayer via Lovable Cloud.

## Visual direction

- **Palette:** background `#0f172a`, deep indigo surface `#1e1b4b`, primary `#6366f1`, accent cyan `#22d3ee`. Neon glows via layered box-shadows; glassmorphism panels (`backdrop-blur` + 8% white borders).
- **Typography:** JetBrains Mono for headings, numbers, room codes, timers. Work Sans for body/UI.
- **Motion:** Framer Motion for page transitions, card deals, chip flights, player join/leave, turn highlight pulse, countdowns. 200–300ms easing.
- **Components:** rounded-2xl, soft shadows, glow-on-hover, gradient borders for active/turn states.

## Pages & flows

### 1. Homepage `/`
- Sticky transparent blur navbar: Logo · Home / Games / Leaderboard / Profile · search · coin balance pill · avatar.
- Hero strip: featured game with animated gradient backdrop + live player count.
- Category chips (All, Cards, FPS, Racing, Casual, Typing) with active glow.
- Search input filters the grid live.
- Responsive `GameCard` grid: thumbnail, title, live player dot + count, "Play Now" → routes to lobby. Hover = scale 1.03 + cyan glow border.

### 2. Lobby `/lobby/:gameId`
- Two glass cards: **Create Room** (generates 6-char code, host) and **Join Room** (code input with paste/auto-uppercase).
- After entering: **Room screen** shows large monospaced room code with copy button (toast confirm), seat grid of `PlayerAvatar`s, host crown badge, Ready/Waiting status pills, animated join/leave (slide+fade), Start Game button (host-only, disabled until ≥2 ready).

### 3. Teen Patti table `/play/teen-patti/:roomId`
- Circular felt table with radial gradient + glowing pot in center showing pot amount.
- Up to 6 player seats around the ring; each seat: avatar, name, coin balance, status badge (Blind / Seen / Folded / All-in).
- Cards: face-down for opponents; current player can tap "See" to flip own 3 cards face-up with a flip animation.
- Action bar: Fold · Call · Raise (with slider + chip preview) · Show. Disabled when not your turn.
- Animations: deal cards from deck to each seat in sequence, chip stack flying to pot on bet, glowing ring around active player, fold = cards greyscale + slide off.
- Side panel: hand log + chat.

### 4. Typing race `/play/typing/:roomId`
- 3-2-1 countdown overlay with scale animation.
- Center: large monospace passage; correct letters cyan, wrong letters red+shake, current letter has blinking cursor underline.
- Live progress bars per player on the left rail (avatar + WPM + accuracy % updating in real time).
- End-of-race podium modal with WPM, accuracy, coin reward.

## Real-time multiplayer (Lovable Cloud)

- **Auth:** email/password + anonymous "Play as guest" (auto-generated handle + avatar). `profiles` table with `username`, `avatar_url`, `coins`. Roles in separate `user_roles` table.
- **Tables:** `rooms` (code, game_type, host_id, status, max_players), `room_players` (room_id, user_id, seat, status, is_ready), `teen_patti_state` (pot, current_turn, deck, round), `teen_patti_actions` (action log), `typing_races` (passage, started_at), `typing_progress` (user_id, position, wpm, accuracy, finished_at).
- **Realtime:** Supabase Realtime channels per room broadcast player join/leave, game state, chat, typing keystrokes (throttled). Presence used for online/seat state.
- **Edge functions:** `create-room`, `start-teen-patti` (deals deck server-side, never trusts client), `teen-patti-action` (validates turn, updates pot/state), `start-typing-race` (selects passage, broadcasts countdown).
- **RLS:** read room state if you're a `room_player`; write only your own actions via security-definer functions.

## Component library (`src/components/`)
`Navbar`, `GameCard`, `CategoryChips`, `SearchBar`, `CoinBadge`, `PlayerAvatar`, `RoomCodeDisplay`, `SeatRing`, `PlayingCard`, `ChipStack`, `ActionBar`, `RaiseSlider`, `TypingPassage`, `ProgressRail`, `CountdownOverlay`, `GlassPanel`, `NeonButton` (primary/secondary/danger variants), `StatusBadge`, `Modal`, `Toast` (existing).

## Design tokens (`index.css` + `tailwind.config.ts`)
- All colors as HSL CSS variables: `--bg`, `--surface`, `--surface-2`, `--primary` (indigo), `--accent` (cyan), `--danger`, `--success`, `--glow-primary`, `--glow-accent`.
- Custom utilities: `.glass`, `.neon-glow`, `.neon-border`, `.text-glow`.
- Keyframes: `pulse-glow`, `card-deal`, `chip-fly`, `countdown-pop`, `shake`, `fade-slide-in`.
- 8px spacing grid; `rounded-2xl` default for surfaces.

## Responsiveness
- Desktop primary (≥1024px): full grids, 6-seat ring.
- Tablet: 3-col game grid, condensed seat ring.
- Mobile: single column, action bar docks bottom, Teen Patti seats stack vertically with current player pinned at bottom, typing rail collapses to top strip.

## Build order
1. Design system tokens, fonts, glass/neon utilities, base layout + Navbar.
2. Homepage with `GameCard` grid + filters + search (mock games seeded).
3. Auth (email + guest) and profiles table.
4. Lobby flow: create/join room, room screen, realtime presence.
5. Teen Patti table UI + edge functions + realtime state sync.
6. Typing race UI + edge function + realtime progress.
7. Polish pass: animations, loading skeletons, page transitions, mobile QA.

## Out of scope (this build)
Leaderboard page (link only), profile editing page (basic view only), payments/coin purchase, additional games beyond Teen Patti and Typing.