/**
 * Card Deck Management
 * Standard 52-card deck with shuffle functionality
 */

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

class Deck {
  constructor() {
    this.cards = [];
    this.reset();
  }

  reset() {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push({ suit, rank });
      }
    }
    this.shuffle();
  }

  shuffle() {
    // Fisher-Yates shuffle algorithm
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    return this;
  }

  drawCard() {
    if (this.cards.length === 0) {
      this.reset();
    }
    return this.cards.pop();
  }

  drawCards(count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
      cards.push(this.drawCard());
    }
    return cards;
  }

  getRemainingCards() {
    return this.cards.length;
  }
}

export default Deck;
