use crate::game::deck::{Card, CardValue};

pub struct Rules;

impl Rules {
    pub fn calculate_hand_value(hand: &[Card]) -> u8 {
        let mut total = 0;
        let mut aces = 0;

        for card in hand {
            match card.value {
                CardValue::Two => total += 2,
                CardValue::Three => total += 3,
                CardValue::Four => total += 4,
                CardValue::Five => total += 5,
                CardValue::Six => total += 6,
                CardValue::Seven => total += 7,
                CardValue::Eight => total += 8,
                CardValue::Nine => total += 9,
                CardValue::Ten | CardValue::Jack | CardValue::Queen | CardValue::King => total += 10,
                CardValue::Ace => aces += 1,
            }
        }

        for _ in 0..aces {
            if total + 11 <= 21 {
                total += 11;
            } else {
                total += 1;
            }
        }

        total
    }

    pub fn is_blackjack(hand: &[Card]) -> bool {
        hand.len() == 2 && Self::calculate_hand_value(hand) == 21
    }

    pub fn is_busted(hand: &[Card]) -> bool {
        Self::calculate_hand_value(hand) > 21
    }

    pub fn compare_hands(player_hand: &[Card], dealer_hand: &[Card]) -> Option<bool> {
        let player_value = Self::calculate_hand_value(player_hand);
        let dealer_value = Self::calculate_hand_value(dealer_hand);

        if player_value > 21 {
            Some(false)
        } else if dealer_value > 21 {
            Some(true)
        } else if player_value > dealer_value {
            Some(true)
        } else if player_value < dealer_value {
            Some(false)
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::game::deck::{Card, CardValue, Suit};

    fn create_card(suit: Suit, value: CardValue) -> Card {
        Card { suit, value }
    }

    #[test]
    fn test_calculate_hand_value() {
        let hand = vec![
            create_card(Suit::Hearts, CardValue::Ace),
            create_card(Suit::Spades, CardValue::King),
        ];
        assert_eq!(Rules::calculate_hand_value(&hand), 21);

        let hand = vec![
            create_card(Suit::Hearts, CardValue::Ace),
            create_card(Suit::Spades, CardValue::Nine),
            create_card(Suit::Diamonds, CardValue::Ace),
        ];
        assert_eq!(Rules::calculate_hand_value(&hand), 21);
    }

    #[test]
    fn test_is_blackjack() {
        let hand = vec![
            create_card(Suit::Hearts, CardValue::Ace),
            create_card(Suit::Spades, CardValue::King),
        ];
        assert!(Rules::is_blackjack(&hand));

        let hand = vec![
            create_card(Suit::Hearts, CardValue::Ace),
            create_card(Suit::Spades, CardValue::Nine),
            create_card(Suit::Diamonds, CardValue::Two),
        ];
        assert!(!Rules::is_blackjack(&hand));
    }

    #[test]
    fn test_is_busted() {
        let hand = vec![
            create_card(Suit::Hearts, CardValue::Ten),
            create_card(Suit::Spades, CardValue::King),
            create_card(Suit::Diamonds, CardValue::Three),
        ];
        assert!(Rules::is_busted(&hand));

        let hand = vec![
            create_card(Suit::Hearts, CardValue::Ace),
            create_card(Suit::Spades, CardValue::Nine),
        ];
        assert!(!Rules::is_busted(&hand));
    }

    #[test]
    fn test_compare_hands() {
        let player_hand = vec![
            create_card(Suit::Hearts, CardValue::Ace),
            create_card(Suit::Spades, CardValue::Ten),
        ];
        let dealer_hand = vec![
            create_card(Suit::Clubs, CardValue::King),
            create_card(Suit::Diamonds, CardValue::Nine),
        ];
        assert_eq!(Rules::compare_hands(&player_hand, &dealer_hand), Some(true));

        let player_hand = vec![
            create_card(Suit::Hearts, CardValue::Five),
            create_card(Suit::Spades, CardValue::Ten),
            create_card(Suit::Diamonds, CardValue::Seven),
        ];
        let dealer_hand = vec![
            create_card(Suit::Clubs, CardValue::King),
            create_card(Suit::Diamonds, CardValue::Nine),
        ];
        assert_eq!(Rules::compare_hands(&player_hand, &dealer_hand), Some(false));
    }
}

