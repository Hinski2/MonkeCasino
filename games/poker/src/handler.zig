const std = @import("std");
const table_module = @import("game/table.zig");
const player_module = @import("game/player.zig");
// const zap = @import("zap");

const rand = std.crypto.random;
const Table = table_module.Table;
const GameInfo = table_module.GameInfo;
const Choice = player_module.Choice;
const ChoiceStruct = player_module.ChoiceStruct;
const PSEnum = player_module.PlayerStatus;

fn only_check_bot(avail: ChoiceStruct) Choice {
    if (avail.can_check) return Choice.Check;
    return Choice.Fold;
}

fn full_random_bot(avail: ChoiceStruct) Choice {
    const choices = [_]Choice{ Choice.Fold, Choice.AllIn, Choice.Check, Choice.Fold };
    const at_most: usize = if (avail.can_raise) 3 else if (avail.can_check) 2 else 1;

    return choices[rand.intRangeAtMost(usize, 0, at_most)];
}

fn broadcastToAllPlayers(info: GameInfo) void {
    // TODO broadcast to all non-bot playing players
    std.debug.print("Broadcast game state: {any}\n", .{info});
}

fn bettingRound(t: *Table) !void {
    while (!t.stakes_matched()) {
        if (t.one_remaining()) {
            return;
        }

        const curr_id = t.curr_player;
        const avail = t.available_moves();

        if (t.players[curr_id].is_bot) {
            const bot_choice = full_random_bot(avail);
            t.play(bot_choice);
        } else {
            unreachable;
        }

        try t.print_all();
    }
}

fn singleRound(t: *Table) !void {
    try t.start_round();
    try t.print_all();

    try bettingRound(t);
    if (t.one_remaining()) {
        t.end_round();
        return;
    }

    try t.draw_three();
    try t.print_all();

    try bettingRound(t);
    if (t.one_remaining()) {
        t.end_round();
        return;
    }

    try t.draw_fourth();
    try t.print_all();

    try bettingRound(t);
    if (t.one_remaining()) {
        t.end_round();
        return;
    }

    try t.draw_fifth();
    try t.print_all();
    try bettingRound(t);

    t.end_round();
    try t.print_all();
}

pub fn runPokerGame() !void {
    var table_instance: Table = undefined;
    try table_instance.init(1000, 10);

    _ = table_instance.join(1, "Bot1", true);
    _ = table_instance.join(2, "Bot2", true);
    _ = table_instance.join(3, "Bot3", true);
    _ = table_instance.join(4, "Bot4", true);

    var i: usize = 0;

    while (true) : (i += 1) {
        try singleRound(&table_instance);
        table_instance.kick_left();
        std.debug.print("Koniec rundy, czekam 5 sek...\n", .{});
        table_instance.refill_bots();
        try table_instance.print_all();
        // std.time.sleep(1_000_000_000); // 5 sek
    }
}

pub fn main() !void {
    try runPokerGame();
}
