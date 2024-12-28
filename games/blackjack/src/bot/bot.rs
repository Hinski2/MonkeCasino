use crate::game::rules::Rules;
use crate::game::deck::Card;

pub struct SimpleBot;

impl SimpleBot {
    pub fn decide_action(hand: &[Card]) -> String {
        let hand_value = Rules::calculate_hand_value(hand);

        if hand_value < 17 {
            "hit".to_string()
        } else {
            "stand".to_string()
        }
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
    fn test_decide_action() {
        let hand = vec![
            create_card(Suit::Hearts, CardValue::Five),
            create_card(Suit::Diamonds, CardValue::Six),
        ];
        assert_eq!(SimpleBot::decide_action(&hand), "hit");

        let hand = vec![
            create_card(Suit::Spades, CardValue::Ten),
            create_card(Suit::Clubs, CardValue::Seven),
        ];
        assert_eq!(SimpleBot::decide_action(&hand), "stand");
    }
}

