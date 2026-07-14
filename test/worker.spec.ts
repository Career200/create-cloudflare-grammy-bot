import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
  fetchMock
} from "cloudflare:test";
import { beforeAll, afterEach, describe, it, expect } from "vitest";
import worker from "../src/worker.ts";

beforeAll(() => {
  fetchMock.activate();
  fetchMock.disableNetConnect();
});
afterEach(() => fetchMock.assertNoPendingInterceptors());

describe("worker webhook handler", () => {
  it("initializes the bot against a mocked getMe call and processes an update", async () => {
    fetchMock
      .get("https://api.telegram.org")
      .intercept({ path: /\/bottest-token\/getMe/, method: "POST" })
      .reply(
        200,
        JSON.stringify({
          ok: true,
          result: {
            id: 1,
            is_bot: true,
            first_name: "TestBot",
            username: "test_bot"
          }
        })
      );
    fetchMock
      .get("https://api.telegram.org")
      .intercept({ path: /\/bottest-token\/sendMessage/, method: "POST" })
      .reply(200, JSON.stringify({ ok: true, result: true }));

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

    const response = await worker.fetch(request, { ...env, BOT_TOKEN: "test-token" }, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
  });
});
