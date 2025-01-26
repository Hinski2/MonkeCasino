#[cfg(test)]
mod tests {
    use super::*;
    use crate::game_logic::{AppState, create_deck, GameState};
    use actix_web::{test, web, App};
    use serde_json::Value;
    use std::sync::Mutex;
    use std::collections::HashMap;
    use crate::handlers::{new_game, hit, stand, double};

    fn setup_app_state() -> web::Data<AppState> {
        web::Data::new(AppState {
            deck: Mutex::new(HashMap::new()),
            game_states: Mutex::new(HashMap::new()),
        })
    }

    #[actix_web::test]
    async fn test_new_game() {
        let app_data = setup_app_state();
        let app = test::init_service(App::new().app_data(app_data.clone()).route("/new_game", web::get().to(new_game))).await;

        let req = test::TestRequest::get().uri("/new_game?balance=1500").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());

        let body: Value = test::read_body_json(resp).await;
        assert!(body["token"].is_string(), "Token should be a string");
        assert!(body["player_hand"].is_array(), "Player hand should be present");
        assert_eq!(body["player_balance"].as_i64().unwrap(), 1500, "Starting balance should match");
    }

    #[actix_web::test]
    async fn test_hit() {
        let app_data = setup_app_state();

        // Setup initial game state
        let token = "test-token".to_string();
        {
            let mut deck = app_data.deck.lock().unwrap();
            let mut game_states = app_data.game_states.lock().unwrap();

            deck.insert(token.clone(), create_deck());
            game_states.insert(
                token.clone(),
                GameState {
                    player_hand: vec![],
                    dealer_hand: vec![],
                    game_over: false,
                    result: None,
                    player_balance: 1000,
                    bet: 0,
                },
            );
        }

        let app = test::init_service(App::new().app_data(app_data.clone()).route("/hit/{token}", web::get().to(hit))).await;

        let req = test::TestRequest::get().uri("/hit/test-token").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());

        let body: Value = test::read_body_json(resp).await;
        assert!(body["player_hand"].is_array(), "Player hand should be updated");
        assert!(!body["game_over"].as_bool().unwrap(), "Game should not be over");
    }

    #[actix_web::test]
    async fn test_stand() {
        let app_data = setup_app_state();

        // Setup initial game state
        let token = "test-token".to_string();
        {
            let mut deck = app_data.deck.lock().unwrap();
            let mut game_states = app_data.game_states.lock().unwrap();

            deck.insert(token.clone(), create_deck());
            game_states.insert(
                token.clone(),
                GameState {
                    player_hand: vec![],
                    dealer_hand: vec![],
                    game_over: false,
                    result: None,
                    player_balance: 1000,
                    bet: 0,
                },
            );
        }

        let app = test::init_service(App::new().app_data(app_data.clone()).route("/stand/{token}", web::get().to(stand))).await;

        let req = test::TestRequest::get().uri("/stand/test-token").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());

        let body: Value = test::read_body_json(resp).await;
        assert!(body["dealer_hand"].is_array(), "Dealer hand should be present");
        assert!(body["game_over"].as_bool().unwrap(), "Game should be over");
    }

    #[actix_web::test]
    async fn test_double() {
        let app_data = setup_app_state();

        // Setup initial game state
        let token = "test-token".to_string();
        {
            let mut deck = app_data.deck.lock().unwrap();
            let mut game_states = app_data.game_states.lock().unwrap();

            deck.insert(token.clone(), create_deck());
            game_states.insert(
                token.clone(),
                GameState {
                    player_hand: vec![],
                    dealer_hand: vec![],
                    game_over: false,
                    result: None,
                    player_balance: 1000,
                    bet: 100,
                },
            );
        }

        let app = test::init_service(App::new().app_data(app_data.clone()).route("/double/{token}", web::get().to(double))).await;

        let req = test::TestRequest::get().uri("/double/test-token").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());

        let body: Value = test::read_body_json(resp).await;
        assert!(body["player_hand"].is_array(), "Player hand should be updated");
        assert!(body["game_over"].as_bool().unwrap(), "Game should be over");
        assert_eq!(body["bet"].as_i64().unwrap(), 200, "Bet should be doubled");
    }
}

