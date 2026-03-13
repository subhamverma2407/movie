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

    const regexImax = /<span[^>]*>[^<]*IMAX[^<]*<\/span>/i;
    const regexAtmos = /<span[^>]*>[^<]*ATMOS[^<]*<\/span>/i;
    const regexDolby = /<span[^>]*>[^<]*DOLBY 7.1[^<]*<\/span>/i;

    const isImax =
      regexImax.test(html) ||
      html.includes(
        '<span class="MovieSessionsListing_timeblock__frmt___XgZL_D">IMAX</span>',
      );
    const isAtmos = regexAtmos.test(html);
    const isDolby = regexDolby.test(html);

    // const hasDate = html.includes('aria-label="Wednesday18"');
    const hasDate = isImax || isAtmos || isDolby;
    // const hasPreferredTheatre = preferredTheatres.some((t) => html.includes(t));

    if (hasDate) {
      console.log("Show found!");

      const isLocal = !!process.env.isLocal;
      const isUbuntuServer = !!process.env.isUbuntuServer;
      const message = `
  ${isLocal ? "LOCAL SERVER" : isUbuntuServer ? "UBUNTU SERVER" : "GITHUB ACTION"}: Cinepolis shantiniketan(${isImax ? "IMAX" : ""},${isDolby ? "DOLBY" : ""}, ${isAtmos ? "ATMOS" : ""}) - Slot detected for Dhurandhar: The Revenge on 19th March`;

      await Promise.allSettled([sendNtfy(message), sendTelegram(message)]);
    } else {
      console.log("Element not found");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkWebsite();
