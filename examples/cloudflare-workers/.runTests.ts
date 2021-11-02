import { page, run, autoRetry, fetchHtml } from "../../libframe/test/setup";

export { runTests };

function runTests(
  cmd: "npm run dev" | "npm run prod" | "npm run dev:miniflare",
  { hasStarWarsPage }: { hasStarWarsPage: boolean }
) {
  if (
    isWindows() &&
    (cmd === "npm run dev:miniflare" || cmd === "npm run prod")
  ) {
    test("SKIPED: miniflare/wrangler doesn't work with Windows", () => {});
    return;
  }
  if (cmd === "npm run prod") {
    test("API keys", () => {
      const envVars = Object.keys(process.env);
      expect(envVars).toContain("CF_ACCOUNT_ID");
      expect(envVars).toContain("CF_API_TOKEN");
    });
  }

  run(cmd);

  test("page content is rendered to HTML", async () => {
    const html = await fetchHtml("/");
    expect(html).toContain("<h1>Welcome</h1>");
  });

  test("page is rendered to the DOM and interactive", async () => {
    expect(await page.textContent("h1")).toBe("Welcome");
    expect(await page.textContent("button")).toBe("Counter 0");
    // `autoRetry` because browser-side code may not be loaded yet
    await autoRetry(async () => {
      await page.click("button");
      expect(await page.textContent("button")).toBe("Counter 1");
    });
  });

  test("about page", async () => {
    await page.click('a[href="/about"]');
    expect(await page.textContent("h1")).toBe("About");
  });

  if (hasStarWarsPage) {
    test("data fetching", async () => {
      await page.click('a[href="/star-wars"]');
      await autoRetry(async () => {
        expect(await page.textContent("h1")).toBe("Star Wars Movies");
      });
      expect(await page.textContent("body")).toContain("The Phantom Menace");
    });
  }
}

function isWindows() {
  return process.platform === "win32";
}