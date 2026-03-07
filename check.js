const axios = require("axios");

const URL =
  "https://ticketnew.com/movies/dhurandhar-the-revenge-movie-detail-211577?frmtid=v833gyzof7";

async function sendNtfy(message) {
  await fetch("https://ntfy.sh/movie-slot-alert", {
    method: "POST",
    body: message,
  });

  console.log("ntfy notification sent");
}

async function checkWebsite() {
  console.log("Checking:", new Date().toISOString());

  try {
    const response = await axios.get(URL);

    const html = response.data;

    if (html.includes('aria-label="Thursday19"')) {
      console.log("Element found!");
      const message = `🚨 Slot detected for 19 March!\n\n${URL}`;

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
