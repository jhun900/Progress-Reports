// Helper to calculate expiry date
function getExpiryDate(months = 0, years = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  d.setFullYear(d.getFullYear() + years);
  // Format in Bitly's required ISO format
  return d.toISOString();
}

// Call your Vercel API endpoint
async function createBitlyLink(longUrl, expiryType = "30d") {
  let expireAt = null;

  // Set expiry value
  if (expiryType === "1m") expireAt = getExpiryDate(1);
  if (expiryType === "6m") expireAt = getExpiryDate(6);
  if (expiryType === "1y") expireAt = getExpiryDate(0, 1);

  try {
    const res = await fetch("/api/create-bitly-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl, expireAt })
    });

    const result = await res.json();
    if (result.error) throw new Error(result.error);
    return result.shortLink;

  } catch (err) {
    console.error("Error creating link:", err);
    alert("Failed: " + err.message);
    return null;
  }
}

// --- Test it / use it in your app ---
// Example: run this when a user submits a form or clicks a button
createBitlyLink("https://your-original-long-url.com", "1y")
  .then(link => {
    console.log("Created link:", link);
    // Show it to the user
    document.getElementById("link-output").textContent = link;
  });
