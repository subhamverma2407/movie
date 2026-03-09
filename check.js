const { sendTelegram } = require("./notify");

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
    const response = await fetch(URL);
    const html = await response.text();

    if (html.includes('aria-label="Thursday19"')) {
      console.log("Element found!");

      const message = `🚨Ticket Now: Slot detected for 19 March}`;

      await Promise.allSettled([sendNtfy(message), sendTelegram(message)]);
      // await sendNtfy(message);
    } else {
      console.log("Element not found");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkWebsite();
