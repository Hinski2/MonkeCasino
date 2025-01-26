use actix_web::{web, HttpResponse, Responder, web::Query, web::Path};
use uuid::Uuid;
use crate::game_logic::{create_deck, calculate_hand_value, AppState, GameState};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct NewGameParams {
    balance: Option<i32>,
    bet: Option<i32>,
}

pub async fn new_game(
    data: web::Data<AppState>,
    query: Query<NewGameParams>,
) -> impl Responder {
    let token = Uuid::new_v4().to_string();
    let mut decks = data.deck.lock().unwrap();
    let mut game_states = data.game_states.lock().unwrap();

    let deck = create_deck();
    let starting_balance = query.balance.unwrap_or(-1);
    let bbet = query.bet.unwrap_or(-1);
    
    if bbet == -1 || starting_balance == -1 {
        HttpResponse::BadRequest().body("Invalid data!");
    }

    let player_hand = vec![deck[0].clone(), deck[1].clone()];
    let dealer_hand = vec![deck[2].clone()];
    let mut remaining_deck = deck.clone();
    remaining_deck.drain(0..3);

    decks.insert(token.clone(), remaining_deck);
    game_states.insert(
        token.clone(),
        GameState {
            player_hand: player_hand.clone(), 
            dealer_hand: dealer_hand.clone(), 
            game_over: false,
            result: None,
            player_balance: starting_balance,
            bet: bbet,
        },
    );

    HttpResponse::Ok().json(serde_json::json!({
        "token": token,
        "player_hand": player_hand,
        "dealer_hand": dealer_hand,
        "player_balance": starting_balance,
        "player_bet": bbet,
    }))
}

pub async fn hit(
    data: web::Data<AppState>,
    path: Path<String>,
) -> impl Responder {
    let token = path.into_inner();
    let mut decks = data.deck.lock().unwrap();
    let mut game_states = data.game_states.lock().unwrap();

    if let (Some(deck), Some(state)) = (decks.get_mut(&token), game_states.get_mut(&token)) {
        if !state.game_over {
            state.player_hand.push(deck.pop().unwrap());
            let player_value = calculate_hand_value(&state.player_hand);

            if player_value > 21 {
                state.game_over = true;
                state.result = Some("Player busts. Dealer wins!".to_string());
            }
        }

        HttpResponse::Ok().json(state)
    } else {
        HttpResponse::BadRequest().body("Invalid token or game session not found.")
    }
}

pub async fn stand(
    data: web::Data<AppState>,
    path: Path<String>,
) -> impl Responder {
    let token = path.into_inner();
    let mut decks = data.deck.lock().unwrap();
    let mut game_states = data.game_states.lock().unwrap();

    if let (Some(deck), Some(state)) = (decks.get_mut(&token), game_states.get_mut(&token)) {

        if !state.game_over {
            let player_value = calculate_hand_value(&state.player_hand);
            let mut dealer_value = calculate_hand_value(&state.dealer_hand);
            if state.player_hand.len() == 2 && player_value == 21 {
                state.game_over = true;
                state.result = Some(if dealer_value == 21 {
                    "It's a tie!".to_string()
                } else {
                    "BlackJack!".to_string()
                });
               return HttpResponse::Ok().json(state);
            }

            while calculate_hand_value(&state.dealer_hand) < 17 {
                state.dealer_hand.push(deck.pop().unwrap());
            }
            dealer_value = calculate_hand_value(&state.dealer_hand);

            state.game_over = true;
            state.result = Some(if dealer_value > 21 || player_value > dealer_value {
                "Player wins!".to_string()
            } else if dealer_value == player_value {
                "It's a tie!".to_string()
            } else {
                "Dealer wins!".to_string()
            });
        }

        HttpResponse::Ok().json(state)
    } else {
        HttpResponse::BadRequest().body("Invalid token or game session not found.")
    }
}

pub async fn double(
    data: web::Data<AppState>,
    path: Path<String>,
) -> impl Responder {
    let token = path.into_inner();
    let mut decks = data.deck.lock().unwrap();
    let mut game_states = data.game_states.lock().unwrap();

    if let (Some(deck), Some(state)) = (decks.get_mut(&token), game_states.get_mut(&token)) {
        if !state.game_over {
            state.bet *= 2;
            state.player_hand.push(deck.pop().unwrap());
            let player_value = calculate_hand_value(&state.player_hand);

            if player_value > 21 {
                state.game_over = true;
                state.result = Some("Player busts. Dealer wins!".to_string());
            } else {
                while calculate_hand_value(&state.dealer_hand) < 17 {
                    state.dealer_hand.push(deck.pop().unwrap());
                }

                let dealer_value = calculate_hand_value(&state.dealer_hand);

                state.game_over = true;
                state.result = Some(if dealer_value > 21 || player_value > dealer_value {
                    "Player wins!".to_string()
                } else if dealer_value == player_value {
                    "It's a tie!".to_string()
                } else {
                    "Dealer wins!".to_string()
                });
            }
        }

        HttpResponse::Ok().json(state)
    } else {
        HttpResponse::BadRequest().body("Invalid token or game session not found.")
    }
}

