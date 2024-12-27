mod game;
mod bot;

use std::io;
use game::game_state::GameState;
use game::game_state::GameResult;
use game::rules::Rules;
use crate::bot::bot::SimpleBot;

fn main() {
    let mut game_state = GameState::new(100); // Start with 100 chips for the bot

    loop {
        println!("\n=== Blackjack Simulation ===");
        println!("1. Simulate a game with SimpleBot");
        println!("2. Quit");
        println!("Enter your choice: ");

        let mut choice = String::new();
        io::stdin().read_line(&mut choice).unwrap();
        let choice = choice.trim();

        match choice {
            "1" => simulate_game(&mut game_state),
            "2" => {
                println!("Thanks for playing! Goodbye.");
                break;
            }
            _ => println!("Invalid choice. Please try again."),
        }
    }
}

fn simulate_game(game_state: &mut GameState) {
    game_state.start_new_game();

    println!("SimpleBot's initial hand: {:?}", game_state.player.show_hand());
    println!("Dealer's visible card: {:?}", game_state.dealer.show_hand().get(0));

    while !Rules::is_busted(game_state.player.show_hand()) {
        let action = SimpleBot::decide_action(game_state.player.show_hand());

        if action == "hit" {
            println!("SimpleBot chooses to Hit.");
            if !game_state.player_hits() {
                println!("No more cards left in the deck.");
                break;
            }
        } else {
            println!("SimpleBot chooses to Stand.");
            break;
        }

        println!("SimpleBot's hand: {:?}, Value: {}", game_state.player.show_hand(), game_state.player.hand_value());
    }

    if Rules::is_busted(game_state.player.show_hand()) {
        println!("SimpleBot busted with a hand value of {}! Dealer wins.", game_state.player.hand_value());
        game_state.player.lose_bet();
        return;
    }

    game_state.dealer_plays();
    determine_outcome(game_state);
}

fn determine_outcome(game_state: &mut GameState) {
    let result = game_state.determine_winner();
    println!(
        "\nSimpleBot's final hand: {:?}, Value: {}",
        game_state.player.show_hand(),
        game_state.player.hand_value()
    );
    println!(
        "Dealer's final hand: {:?}, Value: {}",
        game_state.dealer.show_hand(),
        game_state.dealer.hand_value()
    );

    match result {
        Some(GameResult::PlayerWins) => {
            println!("SimpleBot wins!");
            game_state.player.win_bet(2.0);
        }
        Some(GameResult::DealerWins) => {
            println!("Dealer wins!");
            game_state.player.lose_bet();
        }
        Some(GameResult::Tie) => {
            println!("It's a tie!");
            game_state.player.win_bet(1.0); // Return the bet
        }
        None => println!("Unexpected result!"),
    }
    println!("SimpleBot's remaining chips: {}", game_state.player.get_chips());
}

