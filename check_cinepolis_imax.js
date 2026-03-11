const { sendTelegram } = require("./notify");

const URL =
  "https://www.district.in/movies/cinepolis-nexus-shantiniketan-thigalarapalya-bengaluru-in-bengaluru-CD7508?fromdate=2026-03-19";
// "https://www.district.in/movies/cinepolis-nexus-shantiniketan-thigalarapalya-bengaluru-in-bengaluru-CD7508?fromdate=2026-03-11";

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

    const regex = /<span[^>]*>[^<]*IMAX[^<]*<\/span>/i;
    const regexAtmos = /<span[^>]*>[^<]*ATMOS[^<]*<\/span>/i;

    // const hasDate = html.includes('aria-label="Wednesday18"');
    const hasDate =
      html.includes(
        '<span class="MovieSessionsListing_timeblock__frmt___XgZL_D">IMAX</span>',
      ) ||
      regex.test(html) ||
      regexAtmos.test(html);

    // const hasPreferredTheatre = preferredTheatres.some((t) => html.includes(t));

    if (hasDate) {
      console.log("Show found!");

      const message = `🚨LOCAL SERVER: 19th IMAX Cinepolis - Slot detected for Dhurandhar: The Revenge on 19th March`;

      await Promise.allSettled([sendNtfy(message), sendTelegram(message)]);
    } else {
      console.log("Element not found");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkWebsite();
