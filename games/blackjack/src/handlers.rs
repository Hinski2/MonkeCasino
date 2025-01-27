use actix_web::{web, HttpResponse, Responder, web::Path};
use uuid::Uuid;
use crate::game_logic::{create_deck, calculate_hand_value, AppState, GameState};
use serde::Deserialize;
use reqwest::header::{HeaderMap, HeaderValue, ORIGIN};
#[derive(Deserialize)]
pub struct NewGameParams {
    balance: Option<i32>,
    bet: Option<i32>,
    user_id: Option<String>,
}

#[derive(Deserialize, Debug)]
struct Data {
    nick: String,
    lvl: i32,
    accoutBalance: i32,
    experiencePoints: i32,
    profilePicture: String,
}

#[derive(Deserialize, Debug)]
struct ApiResponse {
    success: bool,
    data: Data, 
    user_message: String,
    message: String,
}
#[derive(Deserialize, Debug)]
pub struct Tok {
    token: Option<String>,
}

pub async fn new_game(
    data: web::Data<AppState>,
    json: web::Json<NewGameParams>,
) -> impl Responder {
    let starting_balance = match json.balance {
        Some(balance) if balance > 0 => balance,
        _ => return HttpResponse::BadRequest().body("Invalid or missing 'balance'!"),
    };
    let bbet = match json.bet {
        Some(bet) if bet > 0 => bet,
        _ => return HttpResponse::BadRequest().body("Invalid or missing 'bet'!"),
    };

    let user_id = match &json.user_id {
        Some(user) => user,
        _ => return HttpResponse::BadRequest().body("Missing 'user_id'!"),
    };
    let url = format!("http://77.255.162.181:3000/api/users/{}", user_id);
    let client = reqwest::Client::new();
    let origin_header = "http://77.255.162.181:8080";
    let starting_balance_2 = match client
    .get(&url)
    .header("Origin", origin_header)
    .send()
    .await
{
    Ok(response) if response.status().is_success() => {
        match response.json::<ApiResponse>().await {
            Ok(parsed_response) => parsed_response.data.accoutBalance, // Extracting account balance
            Err(err) => {
                return HttpResponse::InternalServerError().body("Failed to parse JSON response!");
            }
        }
    }
    Ok(response) => {
        return HttpResponse::InternalServerError().body("Unexpected response status!");
    }
    Err(err) => {
        return HttpResponse::InternalServerError().body("Failed to send request to server!");
    }
};

    if starting_balance_2 != starting_balance {
        return HttpResponse::BadRequest().body("Balance is incorrect!");
    }
    let token = Uuid::new_v4().to_string();
    let mut decks = data.deck.lock().unwrap();
    let mut game_states = data.game_states.lock().unwrap();
    let deck = create_deck();

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
            user_id: user_id.to_string(),
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

pub async fn money(x: i32, id: String) {
    let url = format!("http://77.255.162.181:3000/api/users/{}", id);
    let client = reqwest::Client::new();
    let origin_header = "http://77.255.162.181";
    println!("{x} {id}");
    let body = serde_json::json!({
        "accoutBalance": x
    });

    let starting_balance_2 = match client
        .patch(&url)
        .header("Origin", origin_header)
        .header("server-auth", "d93mM2!4@dN_d()39dNNlsndOIOIOO420$$")
        .json(&body) 
        .send()
        .await
    {
        Ok(response) if response.status().is_success() => {
            println!("Request succeeded with status: {}", response.status());
            match response.json::<serde_json::Value>().await {
                Ok(json_response) => {
                    println!("Response JSON: {:?}", json_response);
                    json_response
                }
                Err(err) => {
                    eprintln!("Failed to parse JSON response: {}", err);
                    return;
                }
            }
        }
        Ok(response) => {
            eprintln!("Request failed with status: {}", response.status());
            return;
        }
        Err(err) => {
            eprintln!("Request error: {}", err);
            return;
        }
    };

    println!("Starting balance updated: {:?}", starting_balance_2);
}


pub async fn hit(
    data: web::Data<AppState>,
    json: web::Json<Tok>,
) -> impl Responder {
    let token = match &json.token {
        Some(token) => token.to_string(),
        _ => return HttpResponse::BadRequest().body("Invalid or missing 'Token'!"),
    };

    let mut decks = data.deck.lock().unwrap();
    let mut game_states = data.game_states.lock().unwrap();

    if let (Some(deck), Some(state)) = (decks.get_mut(&token), game_states.get_mut(&token)) {
        if !state.game_over {
            state.player_hand.push(deck.pop().unwrap());
            let player_value = calculate_hand_value(&state.player_hand);

            if player_value > 21 {
                state.game_over = true;
                state.result = Some("Player busts. Dealer wins!".to_string());
                money(state.player_balance - state.bet, state.user_id.clone()).await;
            }
        }

        HttpResponse::Ok().json(state)
    } else {
        HttpResponse::BadRequest().body("Invalid token or game session not found.")
    }
}

pub async fn stand(
    data: web::Data<AppState>,
    json: web::Json<Tok>,
) -> impl Responder {
    let token = match &json.token {
        Some(token) => token.to_string(),
        _ => return HttpResponse::BadRequest().body("Invalid or missing 'Token'!"),
    };
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
                    money(state.player_balance + (2*state.bet), state.user_id.clone()).await;
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
                money(state.player_balance + state.bet, state.user_id.clone()).await;
                "Player wins!".to_string()
            } else if dealer_value == player_value {
                "It's a tie!".to_string()
            } else {
                money(state.player_balance - state.bet, state.user_id.clone()).await;
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
    json: web::Json<Tok>,
) -> impl Responder {
    let token = match &json.token {
        Some(token) => token.to_string(),
        _ => return HttpResponse::BadRequest().body("Invalid or missing 'Token'!"),
    };
    let mut decks = data.deck.lock().unwrap();
    let mut game_states = data.game_states.lock().unwrap();

    if let (Some(deck), Some(state)) = (decks.get_mut(&token), game_states.get_mut(&token)) {
        if !state.game_over {
            if state.bet*2 > state.player_balance {
                return HttpResponse::BadRequest().body("Bid is larger than balance!");
            }
            state.bet *= 2;
            state.player_hand.push(deck.pop().unwrap());
            let player_value = calculate_hand_value(&state.player_hand);

            if player_value > 21 {
                state.game_over = true;
                money(state.player_balance - state.bet, state.user_id.clone()).await;
                state.result = Some("Player busts. Dealer wins!".to_string());
            } else {
                while calculate_hand_value(&state.dealer_hand) < 17 {
                    state.dealer_hand.push(deck.pop().unwrap());
                }

                let dealer_value = calculate_hand_value(&state.dealer_hand);

                state.game_over = true;
                state.result = Some(if dealer_value > 21 || player_value > dealer_value {
                     money(state.player_balance + state.bet, state.user_id.clone()).await;
                    "Player wins!".to_string()
                } else if dealer_value == player_value {
                    "It's a tie!".to_string()
                } else {
                    money(state.player_balance - state.bet, state.user_id.clone()).await;
                    "Dealer wins!".to_string()
                });
            }
        }

        HttpResponse::Ok().json(state)
    } else {
        HttpResponse::BadRequest().body("Invalid token or game session not found.")
    }
}

