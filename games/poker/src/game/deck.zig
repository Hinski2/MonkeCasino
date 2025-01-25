const std = @import("std");
const card_module = @import("card.zig");
const Card = card_module.Card;
const Suit = card_module.Suit;
const Rank = card_module.Rank;
const expect = std.testing.expect;
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
const gpa_allocator = gpa.allocator();
const rand = std.crypto.random;

const DeckError = error{
    DeckReinitialization,
    DeckEmpty,
};

const all_suits = [4]Suit{ Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds };
const all_ranks = [13]Rank{ Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace };

pub const Deck = struct {
    cards: std.ArrayList(Card) = std.ArrayList(Card).init(gpa_allocator),

    fn fillDeck(self: *Deck) !void {
        for (all_suits) |suit| {
            for (all_ranks) |rank| {
                try self.cards.append(Card{ .suit = suit, .rank = rank });
            }
        }
    }

    pub fn cardsLeft(self: *Deck) usize {
        return self.cards.items.len;
    }

    pub fn init(self: *Deck) !void {
        if (self.cardsLeft() != 0) {
            return DeckError.DeckReinitialization;
        }

        try self.fillDeck();
    }

    pub fn reinit(self: *Deck) !void {
        self.cards.deinit();
        self.cards = std.ArrayList(Card).init(gpa_allocator);

        try self.fillDeck();
    }

    pub fn shuffle(self: *Deck) !void {
        if (self.cardsLeft() == 0) {
            return DeckError.DeckEmpty;
        }

        var i: usize = self.cardsLeft() - 1;

        while (i > 0) : (i -= 1) {
            const j = rand.intRangeAtMost(usize, 0, i);
            std.mem.swap(Card, &self.cards.items[i], &self.cards.items[j]);
        }
    }

    pub fn print(self: *Deck) !void {
        if (self.cardsLeft() == 0) {
            return DeckError.DeckEmpty;
        }

        const stdout = std.io.getStdOut().writer();
        const left = self.cardsLeft();

        try stdout.print("Cards left: {}, cards:\n", .{left});

        for (self.cards.items) |*card| {
            try card.print();
        }
    }

    pub fn draw(self: *Deck) !Card {
        if (self.cards.items.len == 0) {
            return DeckError.DeckEmpty;
        }

        const card = self.cards.pop();
        return card;
    }
};

test "deck creation" {
    var deck = Deck{};
    try deck.init();

    const cardsLeft = deck.cardsLeft();

    try expect(cardsLeft == 52);
}

test "deck printing" {
    var deck = Deck{};
    try deck.init();
    try deck.print();
}

test "card drawing" {
    var deck = Deck{};
    try deck.init();
    _ = try deck.draw();
    try expect(deck.cardsLeft() == 51);
}

test "reinitialization" {
    var deck = Deck{};
    try deck.init();
    _ = try deck.draw();
    try deck.reinit();
    try expect(deck.cardsLeft() == 52);
}

test "double initialization" {
    var deck = Deck{};
    try deck.init();

    deck.init() catch |err| {
        try expect(err == DeckError.DeckReinitialization);
    };
}

test "drawing from empty" {
    var deck = Deck{};

    _ = deck.draw() catch |err| {
        try expect(err == DeckError.DeckEmpty);
    };
}

test "shuffle" {
    var deck = Deck{};
    try deck.init();
    try deck.shuffle();
}

test "shuffle empty" {
    var deck = Deck{};
    deck.shuffle() catch |err| {
        try expect(err == DeckError.DeckEmpty);
    };
}
