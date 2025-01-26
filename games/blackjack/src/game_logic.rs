use rand::seq::SliceRandom;
use rand::thread_rng;
use std::collections::HashMap;
use std::sync::Mutex;
use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Card {
    pub rank: String,
    pub value: u8,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GameState {
    pub player_hand: Vec<Card>,
    pub dealer_hand: Vec<Card>,
    pub game_over: bool,
    pub result: Option<String>,
    pub player_balance: i32,
    pub bet: i32,
    pub user_id: String,
}

pub struct AppState {
    pub deck: Mutex<HashMap<String, Vec<Card>>>, // Token -> Deck mapping
    pub game_states: Mutex<HashMap<String, GameState>>, // Token -> GameState mapping
}

pub fn create_deck() -> Vec<Card> {
    let ranks = [
        ("Two", 2), ("Three", 3), ("Four", 4), ("Five", 5), ("Six", 6),
        ("Seven", 7), ("Eight", 8), ("Nine", 9), ("Ten", 10), ("Jack", 10), ("Queen", 10), ("King", 10), ("Ace", 11),
    ];
    let suits = ["Hearts", "Diamonds", "Clubs", "Spades"];

    let mut deck = Vec::new();
    for (rank, value) in ranks.iter() {
        for suit in suits.iter() {
            deck.push(Card {
                rank: format!("{} of {}", rank, suit),
                value: *value,
            });
        }
    }
    deck.shuffle(&mut thread_rng());
    deck
}

pub fn calculate_hand_value(hand: &[Card]) -> u8 {
    let mut value = 0;
    let mut aces = 0;
    for card in hand {
        value += card.value;
        if card.rank.starts_with("A") {
            aces += 1;
        }
    }

    while value > 21 && aces > 0 {
        value -= 10;
        aces -= 1;
    }

    value
}

impl GameState {
    pub fn new(starting_balance: i32) -> Self {
        Self {
            player_hand: Vec::new(),
            dealer_hand: Vec::new(),
            game_over: false,
            result: None,
            player_balance: starting_balance,
            bet: 0,
            user_id: "0".to_string(),
        }
    }
}

impl AppState {
    pub fn new() -> Self {
        Self {
            deck: Mutex::new(HashMap::new()),
            game_states: Mutex::new(HashMap::new()),
        }
    }
}

