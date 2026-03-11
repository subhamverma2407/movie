const puppeteer = require("puppeteer");

const URL =
  "https://www.district.in/movies/dhurandhar-the-revenge-movie-tickets-in-bengaluru-MV211577?frmtid=v833gyzof7&fromdate=2026-03-19";

// Preferred theatres
const preferredTheatres = [
  "Cinepolis Nexus Shantiniketan",
  "PVR Vega City",
  "PVR VR",
  "Grand Cinemas",
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
    const el = await page.waitForSelector(selector, { visible: true, timeout });
    await el.click();
    await page.waitForTimeout(1500);
    return true;
  } catch {
    return false;
  }
}

// Main slot check function
async function check(page) {
  console.log("Checking:", new Date().toISOString());

  await page.goto(URL, { waitUntil: "networkidle2" });

  // 1️⃣ First Proceed modal (if any)
  await clickIfExists(page, 'button[aria-label="Proceed"]');

  // 2️⃣ Click location icon
  await clickIfExists(page, 'svg[viewBox="0 0 33 32"]');

  // 3️⃣ Click "Use Current Location"
  await clickIfExists(page, 'button[aria-label="Use Current Location"]');

  // 4️⃣ Sometimes another Proceed modal appears
  await clickIfExists(page, 'button[aria-label="Proceed"]');

  // 5️⃣ Click Thursday19 <a> wrapping the aria-label div
  try {
    const dateAnchor = await page.waitForSelector(
      'a:has(div[aria-label="Thursday19"])',
      { visible: true, timeout: 10000 },
    );
    await dateAnchor.click();
    console.log("Clicked Thursday19");

    // Wait for the theatre list to appear
    await page.waitForSelector("div.MovieSessionsListing_titleFlex__mE_KX a", {
      visible: true,
      timeout: 10000,
    });
  } catch {
    console.log("Thursday19 link not found or theatre list did not appear");
    return;
  }

  // 6️⃣ Check for preferred theatres using real listing
  const foundTheatre = await page.evaluate((preferredTheatres) => {
    const theatreElements = Array.from(
      document.querySelectorAll("div.MovieSessionsListing_titleFlex__mE_KX a"),
    );
    const theatreNames = theatreElements.map((el) => el.innerText.trim());
    console.log(theatreNames);
    console.log("All theatre names:", theatreNames);

    // Match preferred theatre as substring (case-insensitive)
    return preferredTheatres.find((pref) =>
      theatreNames.some((name) =>
        name.toLowerCase().includes(pref.toLowerCase()),
      ),
    );
  }, preferredTheatres);

  if (foundTheatre) {
    const message = `🚨 Slot detected at ${foundTheatre} on Thursday19`;
    console.log(message);
    await sendNtfy(message);
  } else {
    console.log("No preferred theatres yet");
  }
}

// Main loop
async function start() {
  const browser = await puppeteer.launch({
    defaultViewport: null,
    headless: true,
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://www.district.in", ["geolocation"]);

  const page = await browser.newPage();
  await page.setGeolocation({
    latitude: 12.96338,
    longitude: 77.7148,
  });
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122 Safari/537.36",
  );

  while (true) {
    try {
      await check(page);
    } catch (err) {
      console.error("Error during check:", err);
    }
  }
}

start();
