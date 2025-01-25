const std = @import("std");

pub const Suit = enum(u2) {
    Spades,
    Hearts,
    Clubs,
    Diamonds,
};

pub const Rank = enum(u4) {
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace,
};

pub const Card = struct {
    suit: Suit = undefined,
    rank: Rank = undefined,

    pub fn print(self: *Card) !void {
        const stdout = std.io.getStdOut().writer();

        const suit = @tagName(self.suit);
        const rank = @tagName(self.rank);

        try stdout.print("{s} of {s}\n", .{ rank, suit });
    }
};
