import { useEffect } from "react";

export interface KeyboardShortcuts {
  undo?: () => void;
  reset?: () => void;
  exit?: () => void;
  resign?: () => void;
}

/**
 * Hook to handle keyboard shortcuts in chess game
 * - Ctrl+Z or Cmd+Z: Undo move (if supported)
 * - Ctrl+R: Reset/New Game
 * - Esc: Exit game
 * - Ctrl+Q: Resign/Give up
 */
export function useChessKeyboard(shortcuts: KeyboardShortcuts): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCtrlCmd = isMac ? e.metaKey : e.ctrlKey;

      // Undo (Ctrl+Z / Cmd+Z)
      if (isCtrlCmd && e.key === "z" && shortcuts.undo) {
        e.preventDefault();
        shortcuts.undo();
      }

      // Reset (Ctrl+R / Cmd+R)
      if (isCtrlCmd && e.key === "r" && shortcuts.reset) {
        e.preventDefault();
        shortcuts.reset();
      }

      // Exit (Esc)
      if (e.key === "Escape" && shortcuts.exit) {
        e.preventDefault();
        shortcuts.exit();
      }

      // Resign (Ctrl+Q / Cmd+Q)
      if (isCtrlCmd && e.key === "q" && shortcuts.resign) {
        e.preventDefault();
        shortcuts.resign();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

/**
 * Get keyboard shortcuts help text
 */
export function getKeyboardShortcutsHelp(): string {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const ctrlKey = isMac ? "Cmd" : "Ctrl";

  return `
Keyboard Shortcuts:
${ctrlKey}+Z  - Undo move
${ctrlKey}+R  - New game
Esc    - Exit game
${ctrlKey}+Q  - Resign
  `.trim();
}
