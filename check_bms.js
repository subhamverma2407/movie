const { sendTelegram } = require("./notify");

const URL =
  "https://www.district.in/movies/dhurandhar-the-revenge-movie-tickets-in-bengaluru-MV211577?frmtid=v833gyzof7";

async function sendNtfy(message) {
  await fetch("https://ntfy.sh/movie-slot-alert", {
    method: "POST",
    body: "DISTRICT:" + message,
  });

  console.log("ntfy notification sent");
}

async function checkWebsite() {
  console.log("Checking:", new Date().toISOString());

  try {
    const response = await fetch(URL);

    const html = await response.text();

    // const hasDate = html.includes('aria-label="Wednesday18"');
    const hasDate = html.includes('aria-label="Thursday19"');

    const preferredTheatres = [
      "Cinepolis Nexus Shantiniketan",
      "PVR Vega City",
      "PVR VR",
    ];

    const hasPreferredTheatre = preferredTheatres.some((t) => html.includes(t));

    if (hasDate && hasPreferredTheatre) {
      console.log("Element found!");

      const message = `🚨 Slot detected for Dhurandhar: The Revenge on 19 March`;

      await Promise.allSettled([
        sendNtfy(message),
        sendTelegram(`DISTRICT: ${message}`),
      ]);
    } else {
      console.log("Element not found");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkWebsite();
