const axios = require("axios");

const URL =
  "https://ticketnew.com/movies/dhurandhar-the-revenge-movie-detail-211577?frmtid=v833gyzof7";

const BOT_TOKEN = "8710062239:AAH_s5ma268wUqaYMal85uxITQsFw9BotZI";
const CHAT_ID = "1407253191";

async function sendNtfy(message) {
  await fetch("https://ntfy.sh/movie-slot-alert", {
    method: "POST",
    body: message,
  });

  console.log("ntfy notification sent");
}

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
  console.log("Checking:", new Date().toISOString());

  try {
    const response = await axios.get(URL);

    const html = response.data;

    if (html.includes('aria-label="Wednesday18"')) {
      console.log("Element found!");
      const message = `🚨 Slot detected for 18 March!\n\n${URL}`;

      await Promise.all([sendNtfy(message)]);

      //   await sendTelegramNotification(
      //     `🚨 Slot detected for 18 March!\n\n${URL}`,
      //   );
    } else {
      console.log("Element not found");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkWebsite();
