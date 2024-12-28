use crate::game::deck::Deck;
use crate::game::dealer::Dealer;
use crate::game::player::Player;

#[derive(PartialEq, Debug)]
pub enum GameResult {
    PlayerWins,
    DealerWins,
    Tie,
}

pub struct GameState {
    pub deck: Deck,
    pub dealer: Dealer,
    pub player: Player,
}

impl GameState {
    pub fn new(initial_chips: u32) -> Self {
        Self {
            deck: Deck::new_decks(8),
            dealer: Dealer::new(),
            player: Player::new(initial_chips),
        }
    }

    pub fn start_new_game(&mut self) {
        self.deck.shuffle();
        self.dealer = Dealer::new();
        self.player.reset_hand();

        for _ in 0..2 {
            if let Some(card) = self.deck.deal() {
                self.player.receive_card(card);
            }
            if let Some(card) = self.deck.deal() {
                self.dealer.receive_card(card);
            }
        }
    }

    pub fn player_hits(&mut self) -> bool {
        if let Some(card) = self.deck.deal() {
            self.player.receive_card(card);
            true
        } else {
            false
        }
    }

    pub fn dealer_plays(&mut self) {
        self.dealer.play_turn(&mut self.deck);
    }

    pub fn determine_winner(&self) -> Option<GameResult> {
        let player_value = self.player.hand_value();
        let dealer_value = self.dealer.hand_value();

        if player_value > 21 {
            Some(GameResult::DealerWins)
        } else if dealer_value > 21 {
            Some(GameResult::PlayerWins)
        } else if player_value > dealer_value {
            Some(GameResult::PlayerWins)
        } else if player_value < dealer_value {
            Some(GameResult::DealerWins)
        } else {
            Some(GameResult::Tie)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_game_initialization() {
        let game_state = GameState::new(100);
        assert_eq!(game_state.player.get_chips(), 100);
        assert_eq!(game_state.player.show_hand().len(), 0);
        assert_eq!(game_state.dealer.show_hand().len(), 0);
    }

    #[test]
    fn test_start_new_game() {
        let mut game_state = GameState::new(100);
        game_state.start_new_game();
        assert_eq!(game_state.player.show_hand().len(), 2);
        assert_eq!(game_state.dealer.show_hand().len(), 2);
    }

    #[test]
    fn test_player_hits() {
        let mut game_state = GameState::new(100);
        game_state.start_new_game();
        let initial_hand_size = game_state.player.show_hand().len();
        game_state.player_hits();
        assert_eq!(game_state.player.show_hand().len(), initial_hand_size + 1);
    }

    #[test]
    fn test_determine_winner() {
        let mut game_state = GameState::new(100);
        game_state.start_new_game();

        // Simulate a scenario where the player wins
        game_state.player.reset_hand();
        game_state.dealer = Dealer::new();
        game_state.player.receive_card(crate::game::deck::Card {
            suit: crate::game::deck::Suit::Hearts,
            value: crate::game::deck::CardValue::Ten,
        });
        game_state.player.receive_card(crate::game::deck::Card {
            suit: crate::game::deck::Suit::Spades,
            value: crate::game::deck::CardValue::Ace,
        });
        game_state.dealer.receive_card(crate::game::deck::Card {
            suit: crate::game::deck::Suit::Clubs,
            value: crate::game::deck::CardValue::Nine,
        });
        game_state.dealer.receive_card(crate::game::deck::Card {
            suit: crate::game::deck::Suit::Diamonds,
            value: crate::game::deck::CardValue::Seven,
        });

        assert_eq!(game_state.determine_winner(), Some(GameResult::PlayerWins));
    }
}

