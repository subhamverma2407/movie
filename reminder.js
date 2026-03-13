async function checkAndCallReminder() {
  const now = new Date();

  // Convert current time to IST
  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );

  const hours = istTime.getHours();

  // Date range (months are 0-indexed)
  const startDate = new Date(2026, 2, 13);
  const endDate = new Date(2026, 2, 19);

  const today = new Date(
    istTime.getFullYear(),
    istTime.getMonth(),
    istTime.getDate(),
  );

  console.log(hours);

  const isValidDate = today >= startDate && today <= endDate;
  const isBlockedTime = hours >= 3 && hours < 10;

  if (isValidDate && !isBlockedTime) {
    await reminderNotification("Check if booking has opened!");
  } else {
    console.log("Conditions not satisfied. API not called.");
  }
}

// Your existing function

async function reminderNotification(message) {
  await fetch("https://ntfy.sh/CHECK_MOVIE_TICKET", {
    method: "POST",
    body: message,
  });
}

checkAndCallReminder();
