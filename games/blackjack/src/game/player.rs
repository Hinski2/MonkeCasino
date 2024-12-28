use crate::game::deck::{Card};
use crate::game::rules::Rules;

pub struct Player {
    hand: Vec<Card>,
    chips: u32,
    bet: u32,
}

impl Player {
    pub fn new(initial_chips: u32) -> Self {
        Self {
            hand: Vec::new(),
            chips: initial_chips,
            bet: 0,
        }
    }

    pub fn place_bet(&mut self, amount: u32) -> bool {
        if amount <= self.chips {
            self.bet = amount;
            self.chips -= amount;
            true
        } else {
            false
        }
    }

    pub fn receive_card(&mut self, card: Card) {
        self.hand.push(card);
    }

    pub fn hand_value(&self) -> u8 {
        Rules::calculate_hand_value(&self.hand)
    }

    pub fn show_hand(&self) -> &[Card] {
        &self.hand
    }

    pub fn reset_hand(&mut self) {
        self.hand.clear();
    }

    pub fn win_bet(&mut self, multiplier: f32) {
        self.chips += (self.bet as f32 * multiplier) as u32;
        self.bet = 0;
    }

    pub fn lose_bet(&mut self) {
        self.bet = 0;
    }

    pub fn get_chips(&self) -> u32 {
        self.chips
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::deck::{CardValue, Suit};

    fn create_card(suit: Suit, value: CardValue) -> Card {
        Card { suit, value }
    }

    #[test]
    fn test_place_bet() {
        let mut player = Player::new(100);
        assert!(player.place_bet(50));
        assert_eq!(player.get_chips(), 50);
        assert!(!player.place_bet(60));
        assert_eq!(player.get_chips(), 50);
    }

    #[test]
    fn test_receive_card() {
        let mut player = Player::new(100);
        let card = create_card(Suit::Hearts, CardValue::Ace);
        player.receive_card(card.clone());

        assert_eq!(player.show_hand().len(), 1);
        assert_eq!(player.show_hand()[0], card);
    }

    #[test]
    fn test_hand_value() {
        let mut player = Player::new(100);
        player.receive_card(create_card(Suit::Hearts, CardValue::Ten));
        player.receive_card(create_card(Suit::Spades, CardValue::Ace));

        assert_eq!(player.hand_value(), 21);
    }

    #[test]
    fn test_win_and_lose_bet() {
        let mut player = Player::new(100);
        player.place_bet(50);

        player.win_bet(2.0);
        assert_eq!(player.get_chips(), 150);

        player.place_bet(30);
        player.lose_bet();
        assert_eq!(player.get_chips(), 120);
    }
}
