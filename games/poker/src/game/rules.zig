const std = @import("std");
const card_module = @import("card.zig");
const Card = card_module.Card;
const Rank = card_module.Rank;
const Suit = card_module.Suit;

pub const CompareResult = enum(u2) {
    Lower,
    Equal,
    Higher,
};

pub const HandRanking = enum(u4) {
    HighCard,
    Pair,
    TwoPair,
    ThreeOfAKind,
    Straight,
    Flush,
    FullHouse,
    FourOfAKind,
    StraightFlush,
    RoyalFlush,
};

pub const RankStruct = struct {
    hand_rank: HandRanking,
    cards_ranks: [5]u5,
};

fn hasCard(board: [5]Card, hand: [2]Card, rank: u5, suit: u3) bool {
    for (board) |card| {
        if (@intFromEnum(card.rank) == rank and @intFromEnum(card.suit) == suit) {
            return true;
        }
    }

    for (hand) |card| {
        if (@intFromEnum(card.rank) == rank and @intFromEnum(card.suit) == suit) {
            return true;
        }
    }

    return false;
}

pub fn evalHand(board: [5]Card, hand: [2]Card) RankStruct {
    var rank_counts: [14]u4 = comptime [_]u4{0} ** 14;
    var suit_counts: [4]u4 = comptime [_]u4{0} ** 4;
    var straight_start: u5 = undefined;
    var has_pair: bool = false;
    var has_twopair: bool = false;
    var has_three: bool = false;
    var has_four: bool = false;
    var has_straight: bool = false;
    var has_wheel: bool = false;
    var has_flush: bool = false;
    var flush_suit: u3 = undefined;
    var streak: u4 = 1;
    var straight_streak: u4 = 1;
    var prev_rank: u5 = @intFromEnum(Rank.Ace) + 2;
    var i: u5 = @intCast(@intFromEnum(Rank.Ace));
    var res = RankStruct{ .hand_rank = undefined, .cards_ranks = undefined };

    for (board) |card| {
        rank_counts[@intFromEnum(card.rank)] += 1;
        suit_counts[@intFromEnum(card.suit)] += 1;
    }

    for (hand) |card| {
        rank_counts[@intFromEnum(card.rank)] += 1;
        suit_counts[@intFromEnum(card.suit)] += 1;
    }

    for (suit_counts, 0..) |count, j| {
        if (count >= 5) {
            has_flush = true;
            flush_suit = @intCast(j);
            break;
        }
    }

    while (true) : (i -= 1) {
        const count: u4 = rank_counts[i];

        if (count == 4) {
            has_four = true;
        } else if (!has_three and count == 3) {
            has_three = true;
        } else if (count >= 2) {
            if (has_pair) {
                has_twopair = true;
            } else {
                has_pair = true;
            }
        }

        if (count > 0) {
            if (prev_rank == i + 1) {
                streak += 1;
                if (streak >= 5) {
                    if (streak > straight_streak) {
                        straight_streak = streak;
                    }

                    has_straight = true;
                    straight_start = @intCast(i);
                }
            } else {
                streak = 1;
            }

            prev_rank = @intCast(i);
        }

        if (i == 0) break;
    }

    if (rank_counts[@intFromEnum(Rank.Ace)] > 0 and rank_counts[@intFromEnum(Rank.Two)] > 0 and rank_counts[@intFromEnum(Rank.Three)] > 0 and rank_counts[@intFromEnum(Rank.Four)] > 0 and rank_counts[@intFromEnum(Rank.Five)] > 0) {
        has_wheel = true;
    }

    if ((has_straight or has_wheel) and has_flush) {
        var start_id: u5 = straight_start + (straight_streak - 5);
        var real_sf: bool = true;

        if (start_id == @intFromEnum(Rank.Ten)) {
            while (start_id <= @intFromEnum(Rank.Ace)) : (start_id += 1) {
                if (!hasCard(board, hand, start_id, flush_suit)) {
                    real_sf = false;
                    break;
                }
            }

            if (real_sf) {
                res.hand_rank = HandRanking.RoyalFlush;
                res.cards_ranks = [5]u5{ @intFromEnum(Rank.Ace), @intFromEnum(Rank.King), @intFromEnum(Rank.Queen), @intFromEnum(Rank.Jack), @intFromEnum(Rank.Ten) };
                return res;
            }
        }

        while (straight_streak >= 5) : (straight_streak -= 1) {
            real_sf = true;
            start_id = straight_start + (straight_streak - 5);
            i = 0;

            while (i < 5) : (i += 1) {
                if (!hasCard(board, hand, start_id, flush_suit)) {
                    real_sf = false;
                    break;
                }
                start_id += 1;
            }

            if (real_sf) {
                start_id = straight_start + (straight_streak - 5);
                i = 4;

                while (true) : (i -= 1) {
                    res.cards_ranks[i] = start_id;
                    start_id += 1;

                    if (i == 0) break;
                }

                res.hand_rank = HandRanking.StraightFlush;
                return res;
            }
        }

        if (has_wheel) {
            i = 0;

            while (i < 5) : (i += 1) {
                if (!hasCard(board, hand, if (i == 4) @intFromEnum(Rank.Ace) else i, flush_suit)) {
                    real_sf = false;
                    break;
                }
            }

            if (real_sf) {
                res.hand_rank = HandRanking.StraightFlush;
                res.cards_ranks = [5]u5{ @intFromEnum(Rank.Two), @intFromEnum(Rank.Three), @intFromEnum(Rank.Four), @intFromEnum(Rank.Five), @intFromEnum(Rank.Ace) };
                return res;
            }
        }
    }

    if (has_four) {
        var placed_last: bool = false;
        var placed_four: bool = false;

        res.hand_rank = HandRanking.FourOfAKind;
        i = @intFromEnum(Rank.Ace);

        while (true) : (i -= 1) {
            if (rank_counts[i] == 4) {
                var j: u5 = 0;

                while (j < 4) : (j += 1) {
                    res.cards_ranks[j] = i;
                }

                placed_four = true;
            } else if (!placed_last and rank_counts[i] > 0) {
                res.cards_ranks[4] = i;
                placed_last = true;
            }

            if (placed_four and placed_last) break;
            if (i == 0) break;
        }
    } else if (has_three and has_pair) {
        var placed_pair: bool = false;

        res.hand_rank = HandRanking.FullHouse;
        i = @intFromEnum(Rank.Ace);

        while (true) : (i -= 1) {
            if (rank_counts[i] == 3) {
                var j: u5 = 0;

                while (j < 3) : (j += 1) {
                    res.cards_ranks[j] = i;
                }
            } else if (!placed_pair and rank_counts[i] > 1) {
                res.cards_ranks[3] = i;
                res.cards_ranks[4] = i;
                placed_pair = true;
            }

            if (i == 0) break;
        }
    } else if (has_flush) {
        res.hand_rank = HandRanking.Flush;

        var lowest: u5 = @intFromEnum(Rank.Ace);
        var id: usize = undefined;

        i = 0;

        for (board) |card| {
            if (@intFromEnum(card.suit) == flush_suit) {
                res.cards_ranks[i] = @intFromEnum(card.rank);
                i += 1;
            }
        }

        for (hand) |card| {
            if (@intFromEnum(card.suit) == flush_suit) {
                if (i == 5) {
                    for (res.cards_ranks, 0..) |rank, j| {
                        if (rank < lowest) {
                            lowest = rank;
                            id = j;
                        }
                    }

                    if (lowest < @intFromEnum(card.rank)) {
                        res.cards_ranks[id] = @intFromEnum(card.rank);
                    }
                } else {
                    res.cards_ranks[i] = @intFromEnum(card.rank);
                    i += 1;
                }
            }
        }

        std.mem.sort(u5, &res.cards_ranks, {}, comptime std.sort.desc(u5));
    } else if (has_straight) {
        res.hand_rank = HandRanking.Straight;
        i = 4;
        straight_start += straight_streak - 5;

        while (true) : (i -= 1) {
            res.cards_ranks[i] = straight_start;
            straight_start += 1;

            if (i == 0) break;
        }
    } else if (has_wheel) {
        res.hand_rank = HandRanking.Straight;
        res.cards_ranks = [5]u5{ @intFromEnum(Rank.Two), @intFromEnum(Rank.Three), @intFromEnum(Rank.Four), @intFromEnum(Rank.Five), @intFromEnum(Rank.Ace) };
    } else if (has_three) {
        var placed_other: u3 = 0;
        var placed_three: bool = false;

        res.hand_rank = HandRanking.ThreeOfAKind;
        i = @intFromEnum(Rank.Ace);

        while (true) : (i -= 1) {
            if (!placed_three and rank_counts[i] > 2) {
                var j: u5 = 0;

                while (j < 3) : (j += 1) {
                    res.cards_ranks[j] = i;
                }

                placed_three = true;
            } else if (placed_other != 2 and rank_counts[i] > 0) {
                res.cards_ranks[3 + placed_other] = i;
                placed_other += 1;
            }

            if (i == 0) break;
        }
    } else if (has_twopair) {
        var placed_pairs: u2 = 0;
        var placed_other: bool = false;

        res.hand_rank = HandRanking.TwoPair;
        i = @intFromEnum(Rank.Ace);

        while (true) : (i -= 1) {
            if (placed_pairs != 2 and rank_counts[i] > 1) {
                res.cards_ranks[0 + 2 * placed_pairs] = i;
                res.cards_ranks[1 + 2 * placed_pairs] = i;
                placed_pairs += 1;
            } else if (!placed_other and rank_counts[i] > 0) {
                res.cards_ranks[4] = i;
                placed_other = true;
            }

            if (i >= 0) break;
        }
    } else if (has_pair) {
        i = @intFromEnum(Rank.Ace);
        var placed_other: u3 = 0;

        while (true) : (i -= 1) {
            if (rank_counts[i] > 1) {
                res.cards_ranks[0] = i;
                res.cards_ranks[1] = i;
            } else if (placed_other != 3 and rank_counts[i] > 0) {
                res.cards_ranks[2 + placed_other] = i;
                placed_other += 1;
            }

            if (i == 0) break;
        }
        res.hand_rank = HandRanking.Pair;
    }

    return res;
}

pub fn compareHands(hand1: RankStruct, hand2: RankStruct) CompareResult {
    if (@intFromEnum(hand1.hand_rank) > @intFromEnum(hand2.hand_rank)) {
        return CompareResult.Higher;
    } else if (@intFromEnum(hand1.hand_rank) < @intFromEnum(hand2.hand_rank)) {
        return CompareResult.Lower;
    } else {
        for (hand1.cards_ranks, 0..) |rank, i| {
            if (rank > hand2.cards_ranks[i]) {
                return CompareResult.Higher;
            } else if (rank < hand2.cards_ranks[i]) {
                return CompareResult.Lower;
            }
        }
    }

    return CompareResult.Equal;
}

// EVAL TESTS

test "high_card" {
    const board = [5]Card{
        Card{ .rank = Rank.Two, .suit = Suit.Spades },
        Card{ .rank = Rank.Three, .suit = Suit.Spades },
        Card{ .rank = Rank.Five, .suit = Suit.Hearts },
        Card{ .rank = Rank.Nine, .suit = Suit.Clubs },
        Card{ .rank = Rank.King, .suit = Suit.Diamonds },
    };

    const hand = [2]Card{
        Card{ .rank = Rank.Seven, .suit = Suit.Hearts },
        Card{ .rank = Rank.Ten, .suit = Suit.Clubs },
    };

    const result = evalHand(board, hand);
    try std.testing.expect(result.hand_rank == HandRanking.HighCard);
}

test "pair" {
    const board = [5]Card{
        Card{ .rank = Rank.Ace, .suit = Suit.Spades },
        Card{ .rank = Rank.King, .suit = Suit.Clubs },
        Card{ .rank = Rank.Queen, .suit = Suit.Hearts },
        Card{ .rank = Rank.Two, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Two, .suit = Suit.Clubs },
    };

    const hand = [2]Card{
        Card{ .rank = Rank.Five, .suit = Suit.Spades },
        Card{ .rank = Rank.Seven, .suit = Suit.Hearts },
    };

    const result = evalHand(board, hand);
    try std.testing.expect(result.hand_rank == HandRanking.Pair);
}

test "two_pair" {
    const board = [5]Card{
        Card{ .rank = Rank.Five, .suit = Suit.Clubs },
        Card{ .rank = Rank.Five, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Nine, .suit = Suit.Spades },
        Card{ .rank = Rank.Nine, .suit = Suit.Hearts },
        Card{ .rank = Rank.Four, .suit = Suit.Diamonds },
    };

    const hand = [2]Card{
        Card{ .rank = Rank.Ten, .suit = Suit.Hearts },
        Card{ .rank = Rank.King, .suit = Suit.Clubs },
    };

    const result = evalHand(board, hand);
    try std.testing.expect(result.hand_rank == HandRanking.TwoPair);
}

test "three_of_a_kind" {
    const board = [5]Card{
        Card{ .rank = Rank.Three, .suit = Suit.Spades },
        Card{ .rank = Rank.Three, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Three, .suit = Suit.Clubs },
        Card{ .rank = Rank.Nine, .suit = Suit.Hearts },
        Card{ .rank = Rank.Jack, .suit = Suit.Hearts },
    };

    const hand = [2]Card{
        Card{ .rank = Rank.Two, .suit = Suit.Hearts },
        Card{ .rank = Rank.King, .suit = Suit.Diamonds },
    };

    const result = evalHand(board, hand);
    try std.testing.expect(result.hand_rank == HandRanking.ThreeOfAKind);
}

test "straight" {
    const board = [5]Card{
        Card{ .rank = Rank.Two, .suit = Suit.Clubs },
        Card{ .rank = Rank.Three, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Four, .suit = Suit.Spades },
        Card{ .rank = Rank.Six, .suit = Suit.Hearts },
        Card{ .rank = Rank.King, .suit = Suit.Clubs },
    };

    const hand = [2]Card{
        Card{ .rank = Rank.Five, .suit = Suit.Clubs },
        Card{ .rank = Rank.Seven, .suit = Suit.Diamonds },
    };

    const result = evalHand(board, hand);
    try std.testing.expect(result.hand_rank == HandRanking.Straight);
}

test "flush" {
    const board = [5]Card{
        Card{ .rank = Rank.Ace, .suit = Suit.Clubs },
        Card{ .rank = Rank.Five, .suit = Suit.Clubs },
        Card{ .rank = Rank.Nine, .suit = Suit.Clubs },
        Card{ .rank = Rank.Jack, .suit = Suit.Clubs },
        Card{ .rank = Rank.Two, .suit = Suit.Diamonds },
    };

    const hand = [2]Card{
        Card{ .rank = Rank.King, .suit = Suit.Clubs },
        Card{ .rank = Rank.Four, .suit = Suit.Clubs },
    };

    const result = evalHand(board, hand);
    try std.testing.expect(result.hand_rank == HandRanking.Flush);
}

test "full_house" {
    const board = [5]Card{
        Card{ .rank = Rank.Four, .suit = Suit.Spades },
        Card{ .rank = Rank.Four, .suit = Suit.Hearts },
        Card{ .rank = Rank.Nine, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Nine, .suit = Suit.Clubs },
        Card{ .rank = Rank.Two, .suit = Suit.Clubs },
    };

    const hand = [2]Card{
        Card{ .rank = Rank.Nine, .suit = Suit.Hearts },
        Card{ .rank = Rank.Queen, .suit = Suit.Clubs },
    };

    const result = evalHand(board, hand);
    try std.testing.expect(result.hand_rank == HandRanking.FullHouse);
}

test "four_of_a_kind" {
    const board = [5]Card{
        Card{ .rank = Rank.Ten, .suit = Suit.Spades },
        Card{ .rank = Rank.Ten, .suit = Suit.Hearts },
        Card{ .rank = Rank.Ten, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Two, .suit = Suit.Clubs },
        Card{ .rank = Rank.Five, .suit = Suit.Diamonds },
    };

    const hand = [2]Card{
        Card{ .rank = Rank.Ten, .suit = Suit.Clubs },
        Card{ .rank = Rank.Eight, .suit = Suit.Diamonds },
    };

    const result = evalHand(board, hand);
    try std.testing.expect(result.hand_rank == HandRanking.FourOfAKind);
}

test "straight_flush" {
    const board = [5]Card{
        Card{ .rank = Rank.Five, .suit = Suit.Spades },
        Card{ .rank = Rank.Six, .suit = Suit.Spades },
        Card{ .rank = Rank.Seven, .suit = Suit.Spades },
        Card{ .rank = Rank.Eight, .suit = Suit.Spades },
        Card{ .rank = Rank.Two, .suit = Suit.Hearts },
    };

    const hand = [2]Card{
        Card{ .rank = Rank.Nine, .suit = Suit.Spades },
        Card{ .rank = Rank.King, .suit = Suit.Clubs },
    };

    const result = evalHand(board, hand);
    try std.testing.expect(result.hand_rank == HandRanking.StraightFlush);
}

test "royal_flush" {
    const board = [5]Card{
        Card{ .rank = Rank.Ten, .suit = Suit.Clubs },
        Card{ .rank = Rank.Jack, .suit = Suit.Clubs },
        Card{ .rank = Rank.Queen, .suit = Suit.Clubs },
        Card{ .rank = Rank.Two, .suit = Suit.Hearts },
        Card{ .rank = Rank.Three, .suit = Suit.Hearts },
    };

    const hand = [2]Card{
        Card{ .rank = Rank.King, .suit = Suit.Clubs },
        Card{ .rank = Rank.Ace, .suit = Suit.Clubs },
    };

    const result = evalHand(board, hand);
    try std.testing.expect(result.hand_rank == HandRanking.RoyalFlush);
}

// COMPARE TESTS

test "compare_hands_highcard_vs_pair" {
    const board1 = [5]Card{
        Card{ .rank = Rank.Two, .suit = Suit.Hearts },
        Card{ .rank = Rank.Three, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Five, .suit = Suit.Clubs },
        Card{ .rank = Rank.Nine, .suit = Suit.Spades },
        Card{ .rank = Rank.King, .suit = Suit.Hearts },
    };
    const hand1 = [2]Card{
        Card{ .rank = Rank.Seven, .suit = Suit.Clubs },
        Card{ .rank = Rank.Ten, .suit = Suit.Diamonds },
    };

    const board2 = [5]Card{
        Card{ .rank = Rank.Two, .suit = Suit.Spades },
        Card{ .rank = Rank.Five, .suit = Suit.Hearts },
        Card{ .rank = Rank.Six, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Six, .suit = Suit.Clubs },
        Card{ .rank = Rank.King, .suit = Suit.Spades },
    };
    const hand2 = [2]Card{
        Card{ .rank = Rank.Queen, .suit = Suit.Hearts },
        Card{ .rank = Rank.Three, .suit = Suit.Clubs },
    };

    const eval1 = evalHand(board1, hand1);
    const eval2 = evalHand(board2, hand2);

    try std.testing.expect(eval1.hand_rank == HandRanking.HighCard);
    try std.testing.expect(eval2.hand_rank == HandRanking.Pair);

    const cmp = compareHands(eval1, eval2);
    try std.testing.expect(cmp == CompareResult.Lower);
}

test "compare_hands_pair_vs_pair_kicker" {
    const board1 = [5]Card{
        Card{ .rank = Rank.Eight, .suit = Suit.Clubs },
        Card{ .rank = Rank.Eight, .suit = Suit.Spades },
        Card{ .rank = Rank.Two, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Five, .suit = Suit.Hearts },
        Card{ .rank = Rank.Nine, .suit = Suit.Clubs },
    };
    const hand1 = [2]Card{
        Card{ .rank = Rank.Three, .suit = Suit.Hearts },
        Card{ .rank = Rank.Four, .suit = Suit.Diamonds },
    };

    const board2 = [5]Card{
        Card{ .rank = Rank.Eight, .suit = Suit.Hearts },
        Card{ .rank = Rank.Eight, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Two, .suit = Suit.Clubs },
        Card{ .rank = Rank.Five, .suit = Suit.Spades },
        Card{ .rank = Rank.Nine, .suit = Suit.Diamonds },
    };
    const hand2 = [2]Card{
        Card{ .rank = Rank.King, .suit = Suit.Clubs },
        Card{ .rank = Rank.Three, .suit = Suit.Spades },
    };

    const eval1 = evalHand(board1, hand1);
    const eval2 = evalHand(board2, hand2);

    try std.testing.expect(eval1.hand_rank == HandRanking.Pair);
    try std.testing.expect(eval2.hand_rank == HandRanking.Pair);

    const cmp = compareHands(eval1, eval2);
    try std.testing.expect(cmp == CompareResult.Lower);
}

test "compare_hands_same_rank_equal" {
    const board = [5]Card{
        Card{ .rank = Rank.Ten, .suit = Suit.Hearts },
        Card{ .rank = Rank.Jack, .suit = Suit.Spades },
        Card{ .rank = Rank.Three, .suit = Suit.Clubs },
        Card{ .rank = Rank.Nine, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Two, .suit = Suit.Hearts },
    };
    const hand = [2]Card{
        Card{ .rank = Rank.King, .suit = Suit.Clubs },
        Card{ .rank = Rank.Five, .suit = Suit.Spades },
    };

    const eval1 = evalHand(board, hand);
    const eval2 = evalHand(board, hand);

    try std.testing.expect(eval1.hand_rank == HandRanking.HighCard);
    try std.testing.expect(eval2.hand_rank == HandRanking.HighCard);

    const cmp = compareHands(eval1, eval2);
    try std.testing.expect(cmp == CompareResult.Equal);
}

test "compare_hands_straight_vs_straight" {
    const board1 = [5]Card{
        Card{ .rank = Rank.Five, .suit = Suit.Clubs },
        Card{ .rank = Rank.Six, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Seven, .suit = Suit.Spades },
        Card{ .rank = Rank.Jack, .suit = Suit.Hearts },
        Card{ .rank = Rank.Two, .suit = Suit.Clubs },
    };
    const hand1 = [2]Card{
        Card{ .rank = Rank.Eight, .suit = Suit.Hearts },
        Card{ .rank = Rank.Nine, .suit = Suit.Clubs },
    };

    const board2 = [5]Card{
        Card{ .rank = Rank.Six, .suit = Suit.Hearts },
        Card{ .rank = Rank.Seven, .suit = Suit.Clubs },
        Card{ .rank = Rank.Eight, .suit = Suit.Diamonds },
        Card{ .rank = Rank.King, .suit = Suit.Spades },
        Card{ .rank = Rank.Nine, .suit = Suit.Diamonds },
    };
    const hand2 = [2]Card{
        Card{ .rank = Rank.Ten, .suit = Suit.Clubs },
        Card{ .rank = Rank.Two, .suit = Suit.Hearts },
    };

    const eval1 = evalHand(board1, hand1);
    const eval2 = evalHand(board2, hand2);

    try std.testing.expect(eval1.hand_rank == HandRanking.Straight);
    try std.testing.expect(eval2.hand_rank == HandRanking.Straight);

    const cmp = compareHands(eval1, eval2);
    try std.testing.expect(cmp == CompareResult.Lower);
}

test "compare_hands_flush_vs_full_house" {
    const board1 = [5]Card{
        Card{ .rank = Rank.Two, .suit = Suit.Clubs },
        Card{ .rank = Rank.Four, .suit = Suit.Clubs },
        Card{ .rank = Rank.Eight, .suit = Suit.Clubs },
        Card{ .rank = Rank.Queen, .suit = Suit.Clubs },
        Card{ .rank = Rank.Three, .suit = Suit.Spades },
    };
    const hand1 = [2]Card{
        Card{ .rank = Rank.Jack, .suit = Suit.Clubs },
        Card{ .rank = Rank.Nine, .suit = Suit.Clubs },
    };

    const board2 = [5]Card{
        Card{ .rank = Rank.Ten, .suit = Suit.Spades },
        Card{ .rank = Rank.Ten, .suit = Suit.Hearts },
        Card{ .rank = Rank.Three, .suit = Suit.Clubs },
        Card{ .rank = Rank.Three, .suit = Suit.Hearts },
        Card{ .rank = Rank.King, .suit = Suit.Diamonds },
    };
    const hand2 = [2]Card{
        Card{ .rank = Rank.Three, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Ten, .suit = Suit.Diamonds },
    };

    const eval1 = evalHand(board1, hand1);
    const eval2 = evalHand(board2, hand2);

    try std.testing.expect(eval1.hand_rank == HandRanking.Flush);
    try std.testing.expect(eval2.hand_rank == HandRanking.FullHouse);

    const cmp = compareHands(eval1, eval2);
    try std.testing.expect(cmp == CompareResult.Lower);
}

test "compare_hands_straight_flush_vs_straight_flush" {
    const board1 = [5]Card{
        Card{ .rank = Rank.Five, .suit = Suit.Spades },
        Card{ .rank = Rank.Six, .suit = Suit.Spades },
        Card{ .rank = Rank.Seven, .suit = Suit.Spades },
        Card{ .rank = Rank.Two, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Three, .suit = Suit.Diamonds },
    };
    const hand1 = [2]Card{
        Card{ .rank = Rank.Eight, .suit = Suit.Spades },
        Card{ .rank = Rank.Nine, .suit = Suit.Spades },
    };

    const board2 = [5]Card{
        Card{ .rank = Rank.Six, .suit = Suit.Spades },
        Card{ .rank = Rank.Seven, .suit = Suit.Spades },
        Card{ .rank = Rank.Eight, .suit = Suit.Spades },
        Card{ .rank = Rank.Two, .suit = Suit.Clubs },
        Card{ .rank = Rank.Three, .suit = Suit.Clubs },
    };
    const hand2 = [2]Card{
        Card{ .rank = Rank.Nine, .suit = Suit.Spades },
        Card{ .rank = Rank.Ten, .suit = Suit.Spades },
    };

    const eval1 = evalHand(board1, hand1);
    const eval2 = evalHand(board2, hand2);

    try std.testing.expect(eval1.hand_rank == HandRanking.StraightFlush);
    try std.testing.expect(eval2.hand_rank == HandRanking.StraightFlush);

    const cmp = compareHands(eval1, eval2);
    try std.testing.expect(cmp == CompareResult.Lower);
}

test "compare_hands_royal_flush_vs_straight_flush" {
    const board1 = [5]Card{
        Card{ .rank = Rank.Ten, .suit = Suit.Clubs },
        Card{ .rank = Rank.Jack, .suit = Suit.Clubs },
        Card{ .rank = Rank.Queen, .suit = Suit.Clubs },
        Card{ .rank = Rank.Two, .suit = Suit.Diamonds },
        Card{ .rank = Rank.Three, .suit = Suit.Diamonds },
    };
    const hand1 = [2]Card{
        Card{ .rank = Rank.King, .suit = Suit.Clubs },
        Card{ .rank = Rank.Ace, .suit = Suit.Clubs },
    };

    const board2 = [5]Card{
        Card{ .rank = Rank.Jack, .suit = Suit.Spades },
        Card{ .rank = Rank.Nine, .suit = Suit.Spades },
        Card{ .rank = Rank.Two, .suit = Suit.Hearts },
        Card{ .rank = Rank.Three, .suit = Suit.Hearts },
        Card{ .rank = Rank.King, .suit = Suit.Spades },
    };
    const hand2 = [2]Card{
        Card{ .rank = Rank.Ten, .suit = Suit.Spades },
        Card{ .rank = Rank.Queen, .suit = Suit.Spades },
    };

    const eval1 = evalHand(board1, hand1);
    const eval2 = evalHand(board2, hand2);

    try std.testing.expect(eval1.hand_rank == HandRanking.RoyalFlush);
    try std.testing.expect(eval2.hand_rank == HandRanking.StraightFlush);

    const cmp = compareHands(eval1, eval2);
    try std.testing.expect(cmp == CompareResult.Higher);
}
