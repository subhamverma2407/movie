const { chromium } = require("playwright");
const cron = require("node-cron");

const URL =
  "https://ticketnew.com/movies/dhurandhar-the-revenge-movie-detail-211577?frmtid=v833gyzof7"; // change to your site

const BOT_TOKEN = "8710062239:AAH_s5ma268wUqaYMal85uxITQsFw9BotZI";
const CHAT_ID = "1407253191";

async function sendTelegramNotification(message) {
  const telegramURL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(telegramURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    }),
  });

  console.log("Telegram notification sent");
}

async function checkWebsite() {
  console.log("Checking website at:", new Date().toISOString());

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });

    const count = await page.locator('[aria-label="Wednesday18"]').count();

    if (count > 0) {
      console.log("Element found!");

      await sendTelegramNotification(
        `🚨 Element Found!\n\naria-label=" 18 March" detected on:\n${URL}`,
      );
    } else {
      console.log("Element not found");
    }
  } catch (err) {
    console.error("Error:", err);
  }

  await browser.close();
}

// run every 5 minutes
cron.schedule("*/30 * * * *", () => {
  checkWebsite();
});

// run once immediately
checkWebsite();
