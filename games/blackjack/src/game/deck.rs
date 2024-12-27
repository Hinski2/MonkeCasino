use rand::seq::SliceRandom;
use rand::thread_rng;

#[derive(Clone, Debug, PartialEq)]
pub enum Suit {
    Hearts,
    Diamonds,
    Clubs,
    Spades,
}

#[derive(Clone, Debug, PartialEq)]
pub enum CardValue {
    Ace,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Card {
    pub suit: Suit,
    pub value: CardValue,
}

pub struct Deck {
    cards: Vec<Card>,
}

impl Deck {
    pub fn new() -> Self {
        let suits = vec![
            Suit::Hearts,
            Suit::Diamonds,
            Suit::Clubs,
            Suit::Spades,
        ];
        let values = vec![
            CardValue::Ace,
            CardValue::Two,
            CardValue::Three,
            CardValue::Four,
            CardValue::Five,
            CardValue::Six,
            CardValue::Seven,
            CardValue::Eight,
            CardValue::Nine,
            CardValue::Ten,
            CardValue::Jack,
            CardValue::Queen,
            CardValue::King,
        ];
        let mut cards = Vec::new();
        for suit in suits {
            for value in &values {
                cards.push(Card {
                    suit: suit.clone(),
                    value: value.clone(),
                });
            }
        }
        Self { cards }
    }
    
    pub fn new_decks(deck_count: usize) -> Self {
        let mut all_cards = Vec::new();
        for _ in 0..deck_count {
            all_cards.extend(Self::new().cards);
        }
        Self { cards: all_cards }
    }
    
    pub fn shuffle(&mut self) {
        let mut rng = thread_rng();
        self.cards.shuffle(&mut rng);
    }

    pub fn deal(&mut self) -> Option<Card> {
        self.cards.pop()
    }

    pub fn remaining_cards(&self) -> usize {
        self.cards.len()
    }

    
    
    pub fn reset(&mut self) {
        *self = Deck::new();
        self.shuffle();
    }

    pub fn print_deck(&self) {
        for card in &self.cards {
            println!("{:?} of {:?}", card.value, card.suit);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deck_creation() {
        let deck = Deck::new();
        assert_eq!(deck.remaining_cards(), 52, "A new deck should have 52 cards.");
    }

    #[test]
    fn test_deal() {
        let mut deck = Deck::new();
        let initial_count = deck.remaining_cards();
        let card = deck.deal();
        assert!(card.is_some(), "Dealing should return a card.");
        assert_eq!(deck.remaining_cards(), initial_count - 1, "Dealing should reduce the card count by 1.");
    }

    #[test]
    fn test_remaining_cards() {
        let mut deck = Deck::new();
        for _ in 0..5 {
            deck.deal();
        }
        assert_eq!(deck.remaining_cards(), 47, "Remaining cards should be accurate after dealing.");
    }

    #[test]
    fn test_multiple_decks() {
        let deck = Deck::new_decks(2);
        assert_eq!(deck.remaining_cards(), 104, "Two decks combined should have 104 cards.");
    }

    #[test]
    fn test_reset_deck() {
        let mut deck = Deck::new();
        deck.deal();
        deck.deal();
        deck.reset();
        assert_eq!(deck.remaining_cards(), 52, "Reset should restore the deck to 52 cards.");
    }

    #[test]
    fn test_print_deck() {
        let deck = Deck::new();
        deck.print_deck();
    }
}

