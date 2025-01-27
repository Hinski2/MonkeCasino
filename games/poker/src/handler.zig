const std = @import("std");
const table_module = @import("game/table.zig");
const player_module = @import("game/player.zig");
const Thread = std.Thread;

const rand = std.crypto.random;
const Table = table_module.Table;
const GameInfo = table_module.GameInfo;
const WinInfo = table_module.WinInfo;
const Choice = player_module.Choice;
const ChoiceStruct = player_module.ChoiceStruct;
const PSEnum = player_module.PlayerStatus;

pub const TableManager = struct {
    tables: [4]Table,
    threads: [4]Thread,

    pub fn init(self: *TableManager) !void {
        const join_cashes = [_]u64{ 100, 1000, 10000, 25000 };
        const small_blinds = [_]u64{ 5, 50, 500, 1000 };
        const bot_names = [_][]const u8{ "bot Michael", "bot Rafael", "bot Monke", "bot Eva" };

        for (&self.tables, 0..) |*table, i| {
            try table.init(join_cashes[i], small_blinds[i]);

            var j: usize = 0;

            while (j < 4) : (j += 1) {
                table.join(j, bot_names[j], true);
            }
        }
    }

    pub fn runAllTables(self: *TableManager) !void {
        for (&self.tables, 0..) |*table, i| {
            const table_ptr = table;
            const handle = try Thread.spawn(tableLoop, .{ table_ptr, i }, .{});

            self.threads[i] = handle;
        }
    }

    pub fn shutAllTables(self: *TableManager) !void {
        for (&self.threads) |*thread| {
            thread.join();
        }
    }

    fn tableLoop(args: anytype) !void {
        const table_ptr: *Table = args[0];
        const table_id: usize = args[1];

        while (true) {
            const round_res = singleRound(table_ptr);

            if (round_res) |err| {
                std.debug.print("Error in singleRound for table {d}: {any}\n", .{ table_id, err });
            }

            table_ptr.kick_left();
            table_ptr.refill_bots();

            std.debug.print("Table {d} ended round, waiting 5 seconds\n", .{table_id});
            std.time.sleep(2_000_000_000);
        }
    }
};

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

fn awaitUserMove(t: *Table, in_board_id: usize, timeout_ns: u64) bool {
    _ = t;
    _ = in_board_id;
    _ = timeout_ns;
    return false;
}

fn bettingRound(t: *Table) !void {
    const TIMEOUT_NS = 20_000_000_000;

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
            const got_user_move = awaitUserMove(t, curr_id, TIMEOUT_NS);

            if (!got_user_move) {
                t.timeout_current();
            }
        }
    }
}

fn singleRound(t: *Table) !WinInfo {
    try t.start_round();

    try bettingRound(t);
    if (t.one_remaining()) {
        return t.end_round();
    }

    try t.draw_three();

    try bettingRound(t);
    if (t.one_remaining()) {
        return t.end_round();
    }

    try t.draw_fourth();

    try bettingRound(t);
    if (t.one_remaining()) {
        return t.end_round();
    }

    try t.draw_fifth();
    try bettingRound(t);

    return t.end_round();
}

pub fn runPokerGameBots() !void {
    var table_instance: Table = undefined;
    try table_instance.init(1000, 10);

    _ = table_instance.join(1, "bot Michael", true);
    _ = table_instance.join(2, "bot Rafael", true);
    _ = table_instance.join(3, "bot Monke", true);
    _ = table_instance.join(4, "bot Eva", true);

    var i: usize = 0;

    while (i < 2000) : (i += 1) {
        var win_info = try singleRound(&table_instance);
        try win_info.print(table_instance.players);
        table_instance.kick_left();
        table_instance.refill_bots();
        try table_instance.print_all();
        // std.time.sleep(1_000_000_000);
    }
}

pub fn main() !void {
    _ = TableManager;
    try runPokerGameBots();
}
