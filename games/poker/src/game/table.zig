const std = @import("std");
const card_module = @import("card.zig");
const deck_module = @import("deck.zig");
const player_module = @import("player.zig");
const rules_module = @import("rules.zig");

const Card = card_module.Card;
const Deck = deck_module.Deck;
const Player = player_module.Player;
const PSEnum = player_module.PlayerStatus;
const RankStruct = rules_module.RankStruct;
const HandEval = rules_module.evalHand;
const HandsCmp = rules_module.compareHands;
const CmpRes = rules_module.CompareResult;
const Choice = player_module.Choice;
const ChoiceStruct = player_module.ChoiceStruct;

pub const WinInfo = struct {
    winners_ids: [8]usize,
    winners_count: usize,

    pub fn print(self: *WinInfo, players: [8]Player) !void {
        const stdout = std.io.getStdOut().writer();
        var id: usize = 0;

        try stdout.writeAll("Winners: ");

        while (id < self.winners_count) : (id += 1) {
            try stdout.print("{s}, ", .{players[self.winners_ids[id]].name});
        }

        try stdout.writeAll("\n");
    }
};

pub const GameInfo = struct {
    pot: u64,
    current_player_id: usize,

    players: [8]struct {
        cash: u64,
        stake: u64,
        status: PSEnum,
        name: []const u8,
    },
};

pub const Table = struct {
    deck: Deck,
    players: [8]Player,
    curr_player: usize,
    board: [5]Card,
    on_board: usize,
    pot: u64,
    max_stake: u64,
    dealer_pos: usize,
    join_cash: u64,
    small_blind: u64,

    pub fn init(self: *Table, join_cash: u64, small_blind: u64) !void {
        self.deck = Deck{};
        try self.deck.init();
        self.pot = 0;
        self.dealer_pos = 0;
        self.join_cash = join_cash;
        self.small_blind = small_blind;
        self.on_board = 0;

        for (&self.players) |*player| {
            player.status = PSEnum.Empty;
        }
    }

    pub fn has_empty(self: *Table) bool {
        for (self.players) |player| {
            if (player.status == PSEnum.Empty) {
                return true;
            }
        }

        return false;
    }

    pub fn join(self: *Table, id: usize, name: []const u8, is_bot: bool) usize {
        var free_id: usize = undefined;

        for (self.players, 0..) |player, i| {
            if (player.status == PSEnum.Empty) {
                free_id = i;
                break;
            }
        }

        self.players[free_id].id = id;
        self.players[free_id].name = name;
        self.players[free_id].cash = self.join_cash;
        self.players[free_id].status = PSEnum.Joined;
        self.players[free_id].is_bot = is_bot;

        return free_id;
    }

    fn next_active(self: *Table, in_board_id: usize) usize {
        var pos = (in_board_id + 1) % 8;
        var counter: usize = 0;

        while ((self.players[pos].status != PSEnum.Active and self.players[pos].status != PSEnum.AllIn) and counter <= 8) : (counter += 1) {
            pos = (pos + 1) % 8;
        }

        return pos;
    }

    pub fn draw_three(self: *Table) !void {
        var i: usize = 0;

        while (i < 3) : (i += 1) {
            self.board[i] = try self.deck.draw();
        }

        self.on_board = 3;
    }

    pub fn draw_fourth(self: *Table) !void {
        self.board[3] = try self.deck.draw();
        self.on_board = 4;
    }

    pub fn draw_fifth(self: *Table) !void {
        self.board[4] = try self.deck.draw();
        self.on_board = 5;
    }

    pub fn start_round(self: *Table) !void {
        try self.deck.reinit();
        try self.deck.shuffle();
        self.on_board = 0;
        self.pot = 0;

        for (&self.players) |*player| {
            if (player.status != PSEnum.Empty) {
                player.status = PSEnum.Active;
                player.stake = 0;
                player.cards[0] = try self.deck.draw();
                player.cards[1] = try self.deck.draw();
                player.played_betting = false;
            }
        }

        self.dealer_pos = self.next_active(self.dealer_pos);

        const small_blind_id = self.next_active(self.dealer_pos);
        self.players[small_blind_id].stake = self.small_blind;
        self.players[small_blind_id].cash -= self.small_blind;
        self.pot += self.small_blind;

        const big_blind_id = self.next_active(small_blind_id);
        self.players[big_blind_id].stake = self.small_blind * 2;
        self.players[big_blind_id].cash -= self.small_blind * 2;
        self.pot += self.small_blind * 2;

        if (self.players[big_blind_id].cash == self.small_blind * 2) {
            self.players[big_blind_id].status = PSEnum.AllIn;
        }

        self.max_stake = self.small_blind * 2;
        self.curr_player = self.next_active(big_blind_id);
    }

    pub fn play(self: *Table, choice: Choice) void {
        const curr: usize = self.curr_player;

        if (choice == Choice.Fold) {
            self.players[curr].status = PSEnum.Folded;
        } else if (choice == Choice.AllIn) {
            const this_stake: u64 = self.players[curr].stake + self.players[curr].cash;

            self.players[curr].status = PSEnum.AllIn;
            self.players[curr].played_betting = true;
            self.pot += self.players[curr].cash;
            self.players[curr].cash = 0;
            self.players[curr].stake = this_stake;

            if (this_stake > self.max_stake) {
                self.max_stake = this_stake;
            }
        } else {
            if (choice == Choice.Raise) {
                self.max_stake += self.small_blind * 2;
                self.pot += self.small_blind * 2;
            }
            const added: u64 = self.max_stake - self.players[curr].stake;
            self.players[curr].cash -= added;
            self.players[curr].stake += added;
            self.players[curr].played_betting = true;
            self.pot += added;
        }

        self.curr_player = self.next_active(self.curr_player);
    }

    pub fn stakes_matched(self: *Table) bool {
        for (self.players) |player| {
            if (player.status == PSEnum.Active and (!player.played_betting or player.stake != self.max_stake)) {
                return false;
            }
        }

        for (&self.players) |*player| {
            if (player.status == PSEnum.Active or player.status == PSEnum.AllIn) {
                player.played_betting = false;
            }
        }

        return true;
    }

    pub fn one_remaining(self: *Table) bool {
        var found_other: bool = false;

        for (self.players) |player| {
            if (player.status == PSEnum.Active or player.status == PSEnum.AllIn) {
                if (found_other) {
                    return false;
                }

                found_other = true;
            }
        }

        return true;
    }

    pub fn available_moves(self: *Table) ChoiceStruct {
        const cash_left: u64 = self.players[self.curr_player].cash;
        const curr_stake: u64 = self.players[self.curr_player].stake;

        if (self.max_stake - curr_stake > cash_left) {
            return ChoiceStruct{ .can_check = false, .can_raise = false };
        } else if (self.max_stake + self.small_blind * 2 - curr_stake > cash_left) {
            return ChoiceStruct{ .can_check = true, .can_raise = false };
        }

        return ChoiceStruct{ .can_check = true, .can_raise = true };
    }

    pub fn end_round(self: *Table) WinInfo {
        var winner_ids: [8]usize = undefined;
        var winner_count: u64 = 1;
        var win_per_person: u64 = undefined;
        var rest: u64 = undefined;

        if (self.one_remaining()) {
            for (self.players, 0..) |player, i| {
                if (player.status == PSEnum.Active or player.status == PSEnum.AllIn) {
                    winner_ids[0] = i;
                    break;
                }
            }
        } else {
            var first_id: usize = undefined;
            var curr_id: usize = undefined;
            var prev_struct: RankStruct = undefined;
            var curr_struct: RankStruct = undefined;

            for (self.players, 0..) |player, i| {
                if (player.status == PSEnum.Active or player.status == PSEnum.AllIn) {
                    first_id = i;
                    winner_ids[0] = first_id;
                    break;
                }
            }

            prev_struct = HandEval(self.board, self.players[first_id].cards);
            curr_id = self.next_active(first_id);

            while (curr_id != first_id) : (curr_id = self.next_active(curr_id)) {
                curr_struct = HandEval(self.board, self.players[curr_id].cards);

                const curr_res = HandsCmp(curr_struct, prev_struct);

                if (curr_res == CmpRes.Higher) {
                    winner_ids[0] = curr_id;
                    winner_count = 1;
                } else if (curr_res == CmpRes.Equal) {
                    winner_ids[winner_count] = curr_id;
                    winner_count += 1;
                }
            }
        }

        win_per_person = self.pot / winner_count;
        rest = self.pot - win_per_person * winner_count;

        for (winner_ids, 0..) |id, i| {
            if (i == winner_count) {
                break;
            }

            self.players[id].cash += win_per_person;

            if (i == 0) {
                self.players[id].cash += rest;
            }
        }

        for (&self.players) |*player| {
            if (!player.is_bot and player.cash < self.small_blind * 2) {
                player.status = PSEnum.Left;
            }
        }

        return WinInfo{ .winners_ids = winner_ids, .winners_count = winner_count };
    }

    pub fn kick_left(self: *Table) void {
        for (&self.players) |*player| {
            if (player.status == PSEnum.Left) {
                player.status = PSEnum.Empty;
            }
        }
    }

    pub fn timeout_current(self: *Table) void {
        const curr = self.curr_player;

        self.play(Choice.Fold);
        self.players[curr].status = PSEnum.Left;
    }

    pub fn get_info(self: *Table) GameInfo {
        var info = GameInfo{ .pot = self.pot, .current_player_id = self.curr_active, .players = undefined };

        for (self.players, 0..) |player, i| {
            info.players[i].cash = player.cash;
            info.players[i].name = player.name;
            info.players[i].stake = player.stake;
            info.players[i].status = player.status;
        }

        return info;
    }

    pub fn refill_bots(self: *Table) void {
        for (&self.players) |*player| {
            if (player.is_bot and player.cash < self.small_blind * 2) {
                player.cash = self.join_cash;
            }
        }
    }

    pub fn print_all(self: *Table) !void {
        const stdout = std.io.getStdOut().writer();

        for (&self.players, 0..) |*player, i| {
            if (player.status == PSEnum.Empty) {
                try stdout.print("{d} - empty\n", .{i});
            } else {
                if (i == self.dealer_pos) {
                    try stdout.writeAll("D: ");
                }

                if (i == self.curr_player) {
                    try stdout.writeAll("Active: ");
                }

                try stdout.print("{d} - {s}, cash: {d}, bet: {d}, cards:\n", .{ i, player.name, player.cash, player.stake });
                try player.cards[0].print();
                try player.cards[1].print();
            }
        }

        try stdout.writeAll("\nBoard:\n");

        for (&self.board, 0..) |*card, i| {
            if (i == self.on_board) {
                break;
            }

            try card.print();
        }

        try stdout.print("Pot: {d}\n\n\n", .{self.pot});
    }
};

test "init" {
    var tab: Table = undefined;
    try tab.init(1000, 10);
    try std.testing.expect(tab.players[0].status == PSEnum.Empty);
    try std.testing.expect(tab.join_cash == 1000);
    try std.testing.expect(tab.small_blind == 10);
}

test "join" {
    var tab: Table = undefined;
    const name: []const u8 = "player";
    const id: usize = 12341;

    try tab.init(1000, 10);

    const joined_id = tab.join(id, name, false);

    try std.testing.expect(joined_id == 0);
    try std.testing.expect(tab.players[0].id == id);
    try std.testing.expect(tab.players[0].cash == tab.join_cash);
    try std.testing.expect(tab.players[0].status == PSEnum.Joined);
    try std.testing.expect(std.mem.eql(u8, tab.players[0].name, name));
}
