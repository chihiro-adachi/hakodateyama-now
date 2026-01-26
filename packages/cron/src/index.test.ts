import { describe, it, expect, vi } from "vitest";
import {
  calculateBackoffDelay,
  triggerWorkflowDispatch,
  triggerWithRetry,
} from "./index.js";

const createMockEnv = () => ({
  GITHUB_TOKEN: "test-token",
  GITHUB_OWNER: "test-owner",
  GITHUB_REPO: "test-repo",
  WORKFLOW_ID: "test-workflow.yml",
});

describe("calculateBackoffDelay", () => {
  it("returns base delay for first attempt", () => {
    expect(calculateBackoffDelay(0, 1000)).toBe(1000);
  });

  it("doubles delay for each subsequent attempt", () => {
    expect(calculateBackoffDelay(1, 1000)).toBe(2000);
    expect(calculateBackoffDelay(2, 1000)).toBe(4000);
    expect(calculateBackoffDelay(3, 1000)).toBe(8000);
  });

  it("works with different base delays", () => {
    expect(calculateBackoffDelay(0, 500)).toBe(500);
    expect(calculateBackoffDelay(1, 500)).toBe(1000);
    expect(calculateBackoffDelay(2, 500)).toBe(2000);
  });
});

describe("triggerWorkflowDispatch", () => {
  it("calls GitHub API with correct URL and headers", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const env = createMockEnv();

    await triggerWorkflowDispatch(env, mockFetch);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/test-owner/test-repo/actions/workflows/test-workflow.yml/dispatches",
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: "Bearer test-token",
          "User-Agent": "hakodateyama-cron",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ ref: "main" }),
      }
    );
  });
});

describe("triggerWithRetry", () => {
  it("succeeds on first attempt when API returns 204", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const mockDelay = vi.fn().mockResolvedValue(undefined);
    const env = createMockEnv();

    await triggerWithRetry(env, { maxRetries: 3, baseDelayMs: 1000 }, mockFetch, mockDelay);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockDelay).not.toHaveBeenCalled();
  });

  it("retries on failure and succeeds on second attempt", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response("Server Error", { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const mockDelay = vi.fn().mockResolvedValue(undefined);
    const env = createMockEnv();

    await triggerWithRetry(env, { maxRetries: 3, baseDelayMs: 1000 }, mockFetch, mockDelay);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockDelay).toHaveBeenCalledTimes(1);
    expect(mockDelay).toHaveBeenCalledWith(1000);
  });

  it("retries with exponential backoff", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response("Error", { status: 500 }))
      .mockResolvedValueOnce(new Response("Error", { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const mockDelay = vi.fn().mockResolvedValue(undefined);
    const env = createMockEnv();

    await triggerWithRetry(env, { maxRetries: 3, baseDelayMs: 1000 }, mockFetch, mockDelay);

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockDelay).toHaveBeenCalledTimes(2);
    expect(mockDelay).toHaveBeenNthCalledWith(1, 1000);
    expect(mockDelay).toHaveBeenNthCalledWith(2, 2000);
  });

  it("throws error after all retries fail", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response("Error", { status: 500 }));
    const mockDelay = vi.fn().mockResolvedValue(undefined);
    const env = createMockEnv();

    await expect(
      triggerWithRetry(env, { maxRetries: 3, baseDelayMs: 1000 }, mockFetch, mockDelay)
    ).rejects.toThrow("Failed after 3 attempts");

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockDelay).toHaveBeenCalledTimes(2);
  });

  it("retries on network error", async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const mockDelay = vi.fn().mockResolvedValue(undefined);
    const env = createMockEnv();

    await triggerWithRetry(env, { maxRetries: 3, baseDelayMs: 1000 }, mockFetch, mockDelay);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockDelay).toHaveBeenCalledTimes(1);
  });
});
