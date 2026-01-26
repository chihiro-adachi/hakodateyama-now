interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  WORKFLOW_ID: string;
}

interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
};

export function calculateBackoffDelay(
  attempt: number,
  baseDelayMs: number
): number {
  return baseDelayMs * Math.pow(2, attempt);
}

export async function triggerWorkflowDispatch(
  env: Env,
  fetchFn: typeof fetch = fetch
): Promise<Response> {
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/${env.WORKFLOW_ID}/dispatches`;

  return fetchFn(url, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "hakodateyama-cron",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      ref: "main",
    }),
  });
}

export async function triggerWithRetry(
  env: Env,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS,
  fetchFn: typeof fetch = fetch,
  delayFn: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms))
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      const response = await triggerWorkflowDispatch(env, fetchFn);

      if (response.status === 204) {
        console.log(
          `Workflow dispatch triggered successfully (attempt ${attempt + 1})`
        );
        return;
      }

      const body = await response.text();
      throw new Error(
        `GitHub API returned ${response.status}: ${body}`
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Attempt ${attempt + 1}/${options.maxRetries} failed:`,
        lastError.message
      );

      if (attempt < options.maxRetries - 1) {
        const delay = calculateBackoffDelay(attempt, options.baseDelayMs);
        console.log(`Retrying in ${delay}ms...`);
        await delayFn(delay);
      }
    }
  }

  throw new Error(
    `Failed after ${options.maxRetries} attempts. Last error: ${lastError?.message}`
  );
}

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    ctx.waitUntil(triggerWithRetry(env));
  },
};
