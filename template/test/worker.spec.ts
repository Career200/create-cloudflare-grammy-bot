import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { afterEach, describe, it, expect, vi } from "vitest";
import worker from "../src/worker.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("worker webhook handler", () => {
  it("initializes the bot against a mocked getMe call and processes an update", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = new URL(input instanceof Request ? input.url : input);

      if (url.pathname === "/bottest-token/getMe") {
        return new Response(
          JSON.stringify({
            ok: true,
            result: {
              id: 1,
              is_bot: true,
              first_name: "TestBot",
              username: "test_bot"
            }
          }),
          { headers: { "content-type": "application/json" } }
        );
      }

      if (url.pathname === "/bottest-token/sendMessage") {
        return new Response(JSON.stringify({ ok: true, result: true }), {
          headers: { "content-type": "application/json" }
        });
      }

      throw new Error(`Unexpected fetch to ${url}`);
    });

    const request = new Request("http://example.com/webhook", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        update_id: 1,
        message: {
          message_id: 1,
          date: 0,
          chat: { id: 1, type: "private", first_name: "Tester" },
          from: { id: 1, is_bot: false, first_name: "Tester" },
          text: "hello"
        }
      })
    });
    const ctx = createExecutionContext();

    const response = await worker.fetch(request, { BOT_TOKEN: "test-token" }, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
  });
});
