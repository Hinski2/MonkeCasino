use crate::game::deck::{Card};
use crate::game::rules::Rules;

pub struct Dealer {
    hand: Vec<Card>,
}

impl Dealer {
    pub fn new() -> Self {
        Self { hand: Vec::new() }
    }

    pub fn receive_card(&mut self, card: Card) {
        self.hand.push(card);
    }

    pub fn play_turn(&mut self, deck: &mut crate::game::deck::Deck) {
        while Rules::calculate_hand_value(&self.hand) < 17 {
            if let Some(card) = deck.deal() {
                self.receive_card(card);
            } else {
                break;
            }
        }
    }

    pub fn hand_value(&self) -> u8 {
        Rules::calculate_hand_value(&self.hand)
    }

    pub fn show_hand(&self) -> &[Card] {
        &self.hand
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::deck::{Deck, CardValue, Suit};

    fn create_card(suit: Suit, value: CardValue) -> Card {
        Card { suit, value }
    }

    #[test]
    fn test_dealer_play_turn() {
        let mut dealer = Dealer::new();
        let mut deck = Deck::new();
        deck.shuffle();

        dealer.receive_card(create_card(Suit::Hearts, CardValue::Five));
        dealer.receive_card(create_card(Suit::Spades, CardValue::Six));

        dealer.play_turn(&mut deck);
        let hand_value = dealer.hand_value();
        assert!(hand_value >= 17, "Dealer should stop hitting once hand value is 17 or more");
    }

    #[test]
    fn test_dealer_receive_card() {
        let mut dealer = Dealer::new();
        let card = create_card(Suit::Hearts, CardValue::Ace);
        dealer.receive_card(card.clone());

        assert_eq!(dealer.show_hand().len(), 1);
        assert_eq!(dealer.show_hand()[0], card);
    }
}

