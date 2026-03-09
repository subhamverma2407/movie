// Load .env (no extra deps)
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

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_MY_ID;

async function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn(
      "Telegram not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID)",
    );
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
    });

    if (res.ok) {
      console.log("Telegram notification sent");
    } else {
      const text = await res.text();
      console.error("Telegram API error:", res.status, text);
    }
  } catch (err) {
    console.error("Telegram request failed:", err.message);
  }
}

module.exports = { sendTelegram };
