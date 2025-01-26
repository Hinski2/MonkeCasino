use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use std::collections::HashMap;
use std::sync::Mutex;

mod handlers;
mod game_logic;
use game_logic::AppState;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let app_data = web::Data::new(AppState {
        deck: Mutex::new(HashMap::new()),
        game_states: Mutex::new(HashMap::new()),
    });

    HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header(),
            )
            .app_data(app_data.clone())
            .route("/new_game", web::get().to(handlers::new_game))
            .route("/hit/{token}", web::get().to(handlers::hit))
            .route("/stand/{token}", web::get().to(handlers::stand))
            .route("/double/{token}", web::get().to(handlers::double))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

