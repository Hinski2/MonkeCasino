const std = @import("std");
const zap = @import("zap");
const Client = std.http.Client;
const mem = std.mem;

pub const BASE_URL = "http://localhost:3000";
pub const USERS_ENDPOINT = "/api/users";
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
const gpa_allocator = gpa.allocator();

pub const UserData = struct {
    name: []const u8,
    balance: u64,
};

const FullResponse = struct {
    success: bool,
    data: UserData,
};

fn getUser(user_id: usize) !?FullResponse {
    const stdout = std.io.getStdOut().writer();
    var url_buffer: [128]u8 = undefined;
    const url_str = try std.fmt.bufPrint(&url_buffer, "{s}{s}/{d}", .{ BASE_URL, USERS_ENDPOINT, user_id });
    const url = try std.Uri.parse(url_str);

    try stdout.writeAll(url_str);

    var client = Client{ .allocator = gpa_allocator };
    defer client.deinit();

    const header_buf = try gpa_allocator.alloc(u8, 4096);
    defer gpa_allocator.free(header_buf);

    var req = try client.open(.GET, url, .{ .server_header_buffer = header_buf });
    defer req.deinit();

    try req.send();
    try req.finish();
    try req.wait();

    if (req.response.status != .ok) {
        try stdout.print("error: {d}", .{@intFromEnum(req.response.status)});
        return null;
    }

    var rdr = req.reader();
    const body = try rdr.readAllAlloc(gpa_allocator, 1024 * 1024);
    defer gpa_allocator.free(body);

    const parsed = try std.json.parseFromSlice(FullResponse, gpa_allocator, body, .{});
    defer parsed.deinit();

    const full_resp = parsed.value;

    if (!full_resp.success) {
        try stdout.writeAll("User doesnt exist");
        return null;
    }

    return full_resp;
}

fn checkHasMoney(user_id: usize, required: u64) bool {
    const user_data = getUser(user_id) orelse return false;

    return user_data.accountBalance >= required;
}

fn handleRequest(req: zap.Request) void {
    blk: {
        if (req.path) |path| {
            if (mem.startsWith(u8, path, "/api/users/")) {
                const user_id_str = path[11..];
                const user_id = std.fmt.parseUnsigned(usize, user_id_str, 10) catch {
                    req.setStatus(.bad_request);
                    break :blk;
                };

                if (user_id == 123456) {
                    const full_resp = getUser(user_id) catch {
                        req.setStatus(.bad_request);
                        break :blk;
                    };

                    if (full_resp == null) {
                        req.setStatus(.bad_request);
                        break :blk;
                    }

                    req.setStatus(.ok);
                    req.sendBody(full_resp.?.data);
                    break :blk;
                }
            }
        }

        req.setStatus(.not_found);
    }
}

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();

    var listener = zap.HttpListener.init(.{
        .port = 3030,
        .on_request = handleRequest,
        .log = true,
    });
    try listener.listen();

    try stdout.writeAll("Działa na localhost:3030\n");

    zap.start(.{
        .threads = 2,
        .workers = 2,
    });

    // if () {
    //     try stdout.writeAll("wrong");
    // }
}
