const { chromium } = require("playwright");
const { sendTelegram } = require("./notify");

try {
  const { readFileSync } = require("fs");
  const content = readFileSync(`${__dirname}/.env`, "utf8");
  for (const line of content.split("\n")) {
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim();
    if (k && !process.env[k]) process.env[k] = v;
  }
} catch (_) {}

const URL =
  "https://www.district.in/movies/dhurandhar-the-revenge-movie-tickets-in-bengaluru-MV211577?frmtid=v833gyzof7";

// Preferred theatres
const preferredTheatres = [
  // "Cinepolis Nexus Shantiniketan",
  // "Grand cinemas",
  // "PVR Vega City",
  // "PVR Nexus (Formerly Forum)",
];

// Send ntfy notification
async function sendNtfy(message) {
  await fetch("https://ntfy.sh/movie-slot-alert", {
    method: "POST",
    body: message,
  });
  console.log("Notification sent:", message);
}

// Click selector if exists
async function clickIfExists(page, selector, timeout = 5000) {
  try {
    const locator = page.locator(selector);

    await locator.waitFor({
      state: "visible",
      timeout,
    });

    await locator.click();

    await page.waitForTimeout(1500);

    return true;
  } catch {
    return false;
  }
}

// Main slot check function
async function check(page) {
  console.log("Checking:", new Date().toISOString());

  await page.goto(URL, {
    waitUntil: "networkidle",
  });

  // 1️⃣ First Proceed modal (if any)
  await clickIfExists(page, 'button[aria-label="Proceed"]');

  // 2️⃣ Click location icon
  await clickIfExists(page, 'svg[viewBox="0 0 33 32"]');

  // 3️⃣ Search for location
  try {
    const locationInput = page.locator(
      'input[placeholder="Search city, area or locality"]',
    );

    await locationInput.waitFor({
      state: "visible",
      timeout: 8000,
    });

    await locationInput.fill("brookefield mall bengaluru");

    console.log("Typed location: brookefield mall");

    const locationResult = page.locator(
      'button[aria-label="Brookefield Mall, Brookefield"]',
    );

    await locationResult.waitFor({
      state: "visible",
      timeout: 8000,
    });

    await locationResult.click();

    console.log("Selected location: Brookefield Mall, Brookefield");

    await page.waitForTimeout(1500);
  } catch {
    console.log("Location search failed");
  }

  // 4️⃣ Sometimes another Proceed modal appears
  await clickIfExists(page, 'button[aria-label="Proceed"]');

  // 5️⃣ Click Thursday19
  try {
    const dateAnchor = page.locator('a:has(div[aria-label="Thursday19"])');

    await dateAnchor.waitFor({
      state: "visible",
      timeout: 10000,
    });

    await dateAnchor.click();

    console.log("Clicked Thursday19");

    await page
      .locator("div.MovieSessionsListing_titleFlex__mE_KX a")
      .first()
      .waitFor({
        state: "visible",
        timeout: 10000,
      });
  } catch {
    console.log("Thursday19 link not found or theatre list did not appear");
  }

  await page.waitForTimeout(2000);

  // 6️⃣ Check for preferred theatres
  const foundTheatre = await page.evaluate((preferredTheatres) => {
    const theatreElements = Array.from(
      document.querySelectorAll("div.MovieSessionsListing_titleFlex__mE_KX a"),
    );

    const theatreNames = theatreElements.map((el) => el.innerText.trim());

    console.log(theatreNames);

    return preferredTheatres.filter((pref) =>
      theatreNames.some((name) =>
        name.toLowerCase().includes(pref.toLowerCase()),
      ),
    );
  }, preferredTheatres);

  if (foundTheatre.length > 0) {
    const isLocal = !!process.env.isLocal;
    const isUbuntuServer = !!process.env.isUbuntuServer;
    const message = `
${isLocal ? "LOCAL SERVER" : isUbuntuServer ? "UBUNTU SERVER" : "GITHUB ACTION"}: SLOT DETECTED AT ${foundTheatre} ON 19th March
`;
    await Promise.allSettled([sendNtfy(message), sendTelegram(message)]);
  } else {
    console.log("No preferred theatres yet");
  }
}

// Main function
async function start() {
  const browser = await chromium.launch({
    headless: true,
    // slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    geolocation: {
      latitude: 12.96338,
      longitude: 77.7148,
    },
    permissions: ["geolocation"],
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    await check(page);
  } catch (err) {
    console.error("Error during check:", err);
  }
  await browser.close();
}

// start();
