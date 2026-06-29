export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { longUrl, expireAt } = req.body;
  // expireAt = ISO date: e.g. "2027-06-29T23:59:59+08:00"

  try {
    const response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.BITLY_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        long_url: longUrl,
        // Only works on Premium: set custom expiration
        ...(expireAt && { expires_at: expireAt })
      })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "API error");

    res.status(200).json({
      shortLink: data.link,
      id: data.id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
