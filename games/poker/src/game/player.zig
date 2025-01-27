const card_module = @import("card.zig");
const Card = card_module.Card;

pub const Choice = enum(u3) {
    Fold,
    Check,
    Raise,
    AllIn,
};

pub const ChoiceStruct = struct {
    can_check: bool,
    can_raise: bool,
};

pub const PlayerStatus = enum(u4) {
    Empty,
    Joined,
    Left,
    Active,
    Folded,
    AllIn,
};

pub const Player = struct {
    id: usize,
    name: []const u8,
    cards: [2]Card,
    cash: u64,
    stake: u64,
    status: PlayerStatus,
    is_bot: bool,
    played_betting: bool,
};
